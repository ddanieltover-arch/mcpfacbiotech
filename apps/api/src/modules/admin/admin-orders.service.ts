import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, OrderStatus, Prisma } from '@prisma/client';
import type { AdminOrderSummary, OrderDetail } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { EmailService } from '@/modules/email/email.service';
import { decimalToNumber } from '@/modules/products/products.mapper';
import type { AdminOrderQueryDto } from './dto/admin-query.dto';
import type { UpdateAdminOrderStatusDto } from './dto/admin-mutations.dto';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  PACKED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
  DELIVERED: [OrderStatus.RETURNED],
  CANCELLED: [],
  RETURNED: [],
};

function mapAddress(address: {
  firstName: string;
  lastName: string;
  organizationName: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
}) {
  return {
    firstName: address.firstName,
    lastName: address.lastName,
    organizationName: address.organizationName ?? undefined,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? undefined,
    city: address.city,
    stateProvince: address.stateProvince ?? undefined,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? undefined,
  };
}

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async list(query: AdminOrderQueryDto) {
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: 'insensitive' } },
              {
                customer: {
                  OR: [
                    { organizationName: { contains: query.search, mode: 'insensitive' } },
                    {
                      profile: {
                        OR: [
                          { email: { contains: query.search, mode: 'insensitive' } },
                          { firstName: { contains: query.search, mode: 'insensitive' } },
                          { lastName: { contains: query.search, mode: 'insensitive' } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          _count: { select: { items: true } },
          customer: {
            include: {
              profile: { select: { email: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: query.direction === 'asc' ? 'asc' : 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    const items: AdminOrderSummary[] = rows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: decimalToNumber(order.totalAmount) ?? 0,
      currency: order.currency,
      itemCount: order._count.items,
      customerEmail: order.customer.profile.email,
      customerName: `${order.customer.profile.firstName} ${order.customer.profile.lastName}`.trim(),
      organizationName: order.customer.organizationName ?? undefined,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      createdAt: order.createdAt.toISOString(),
    }));

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<OrderDetail & { internalNotes?: string }> {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: { orderBy: { productName: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        invoices: { select: { id: true } },
        shippingAddress: true,
        billingAddress: true,
        customer: {
          include: {
            profile: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const customerName = `${order.customer.profile.firstName} ${order.customer.profile.lastName}`.trim();

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      subtotal: decimalToNumber(order.subtotal) ?? 0,
      shippingCost: decimalToNumber(order.shippingCost) ?? 0,
      taxAmount: decimalToNumber(order.taxAmount) ?? 0,
      totalAmount: decimalToNumber(order.totalAmount) ?? 0,
      currency: order.currency,
      notes: order.notes ?? undefined,
      purchaseOrderNumber: order.purchaseOrderNum ?? undefined,
      quoteId: order.quoteId ?? undefined,
      shippingAddressId: order.shippingAddressId ?? undefined,
      billingAddressId: order.billingAddressId ?? undefined,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      customerEmail: order.customer.profile.email,
      customerName: customerName || undefined,
      organizationName: order.customer.organizationName ?? undefined,
      shippingAddress: order.shippingAddress ? mapAddress(order.shippingAddress) : undefined,
      billingAddress: order.billingAddress ? mapAddress(order.billingAddress) : undefined,
      internalNotes: order.internalNotes ?? undefined,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: decimalToNumber(item.unitPrice) ?? 0,
        totalPrice: decimalToNumber(item.totalPrice) ?? 0,
      })),
      statusHistory: order.statusHistory.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus ?? undefined,
        toStatus: entry.toStatus,
        note: entry.note ?? undefined,
        changedBy: entry.changedBy ?? undefined,
        createdAt: entry.createdAt.toISOString(),
      })),
      invoiceIds: order.invoices.map((invoice) => invoice.id),
    };
  }

  async updateStatus(
    id: string,
    actorProfileId: string,
    dto: UpdateAdminOrderStatusDto,
  ) {
    const existing = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: true,
        invoices: true,
        customer: {
          include: {
            profile: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    const allowed = ALLOWED_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition order from ${existing.status} to ${dto.status}`,
      );
    }

    const statusNote = dto.note ?? `Status updated by admin to ${dto.status}`;

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: dto.status,
          ...(dto.internalNotes !== undefined ? { internalNotes: dto.internalNotes } : {}),
          statusHistory: {
            create: {
              fromStatus: existing.status,
              toStatus: dto.status,
              note: statusNote,
              ...(actorProfileId ? { changedBy: actorProfileId } : {}),
            },
          },
        },
      });

      if (
        dto.status === OrderStatus.CONFIRMED &&
        existing.status === OrderStatus.PENDING &&
        existing.invoices.length === 0
      ) {
        const invoiceNumber = await this.generateInvoiceNumber(tx);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: existing.id,
            customerId: existing.customerId,
            status: InvoiceStatus.ISSUED,
            subtotal: existing.subtotal,
            taxAmount: existing.taxAmount,
            shippingCost: existing.shippingCost,
            totalAmount: existing.totalAmount,
            currency: existing.currency,
            dueDate,
            notes: 'Invoice issued on admin order confirmation.',
            items: {
              create: existing.items.map((item) => ({
                productName: item.productName,
                productSku: item.productSku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })),
            },
          },
        });
      }
    }, { maxWait: 10_000, timeout: 30_000 });

    try {
      await this.notifyCustomerStatusChange({
        email: existing.customer.profile.email,
        firstName: existing.customer.profile.firstName,
        lastName: existing.customer.profile.lastName,
        orderNumber: existing.orderNumber,
        fromStatus: existing.status,
        toStatus: dto.status,
        note: statusNote,
      });
    } catch (error) {
      this.logger.error(
        `Status email failed for ${existing.orderNumber}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return this.getById(id);
  }

  private async notifyCustomerStatusChange(options: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    orderNumber: string;
    fromStatus: OrderStatus;
    toStatus: OrderStatus;
    note?: string;
  }): Promise<void> {
    if (!options.email) {
      this.logger.warn(
        `Skipped status email for ${options.orderNumber} — customer email missing`,
      );
      return;
    }

    const customerName = [options.firstName, options.lastName].filter(Boolean).join(' ').trim();

    const sent = await this.emailService.sendOrderStatusUpdate({
      to: options.email,
      customerName: customerName || undefined,
      orderNumber: options.orderNumber,
      fromStatus: options.fromStatus,
      toStatus: options.toStatus,
      note: options.note,
    });

    if (!sent) {
      this.logger.warn(
        `Failed to send status email for ${options.orderNumber} → ${options.toStatus}`,
      );
    }
  }

  private async generateInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      const invoiceNumber = `INV-${stamp}-${suffix}`;
      const existing = await tx.invoice.findUnique({
        where: { invoiceNumber },
        select: { id: true },
      });
      if (!existing) return invoiceNumber;
    }
    throw new BadRequestException('Unable to generate unique invoice number');
  }
}
