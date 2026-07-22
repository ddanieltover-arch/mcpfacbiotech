import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  InvoiceStatus,
  OrderStatus,
  Prisma,
  QuoteStatus,
  UserRole as PrismaUserRole,
} from '@prisma/client';
import type {
  OrderDetail,
  OrderItem as OrderItemDto,
  OrderStatusHistoryEntry,
  OrderSummary,
} from '@mcpfac/shared-types';
import { getShippingMethodPrice } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { CommercePricingService } from '@/modules/commerce/commerce-pricing';
import { CartService } from '@/modules/cart/cart.service';
import { EmailService } from '@/modules/email/email.service';
import { decimalToNumber } from '@/modules/products/products.mapper';
import type { CheckoutAddressDto, CheckoutDto } from './dto/checkout.dto';

type LineInput = {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerContext: CustomerContextService,
    private readonly pricing: CommercePricingService,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,
  ) {}

  async list(
    profileId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: OrderSummary[]; total: number; page: number; limit: number }> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: customer.id, deletedAt: null },
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: { customerId: customer.id, deletedAt: null },
      }),
    ]);

    return {
      items: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        totalAmount: decimalToNumber(order.totalAmount) ?? 0,
        currency: order.currency,
        itemCount: order._count.items,
        createdAt: order.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(profileId: string, orderId: string): Promise<OrderDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id, deletedAt: null },
      include: {
        items: { orderBy: { productName: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        invoices: { select: { id: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.toDetail(order);
  }

  async checkout(input: {
    profileId?: string;
    sessionId?: string;
    dto: CheckoutDto;
  }): Promise<OrderDetail> {
    const { dto, sessionId } = input;
    let profileId = input.profileId;

    if (!dto.fromCart && !dto.quoteId) {
      throw new BadRequestException('Provide fromCart=true or quoteId');
    }

    if (!profileId) {
      if (!dto.guestEmail) {
        throw new BadRequestException('Email is required for guest checkout');
      }
      if (!dto.fromCart) {
        throw new BadRequestException('Guest checkout requires fromCart=true');
      }
      if (!dto.shippingAddress) {
        throw new BadRequestException('Shipping address is required for guest checkout');
      }

      profileId = await this.findOrCreateGuestProfileId(dto.guestEmail, dto.shippingAddress);
    }

    const customer = await this.customerContext.assertActiveCustomer(profileId);

    const lines = dto.fromCart
      ? await this.linesFromCart(profileId, sessionId)
      : await this.linesFromQuote(customer.id, dto.quoteId!);

    if (lines.length === 0) {
      throw new BadRequestException('Order requires at least one product');
    }

    const shippingAddressId = await this.resolveAddressId(
      profileId,
      dto.shippingAddressId,
      dto.shippingAddress,
    );
    const billingAddressId =
      (await this.resolveAddressId(profileId, dto.billingAddressId, dto.billingAddress)) ??
      shippingAddressId;

    const subtotal = Number(
      lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0).toFixed(2),
    );
    const paymentMethod = dto.paymentMethod ?? 'BANK_TRANSFER';
    const shippingMethod = dto.shippingMethod ?? 'STANDARD';
    const shippingCost = getShippingMethodPrice(shippingMethod);
    const taxAmount = 0;
    const totalAmount = Number((subtotal + shippingCost + taxAmount).toFixed(2));
    const orderNumber = await this.generateOrderNumber();
    const notes = dto.notes?.trim() || null;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: OrderStatus.PENDING,
          paymentMethod,
          shippingMethod,
          subtotal,
          shippingCost,
          taxAmount,
          totalAmount,
          currency: 'USD',
          notes,
          purchaseOrderNum: dto.purchaseOrderNumber,
          shippingAddressId,
          billingAddressId,
          quoteId: dto.quoteId,
          items: {
            create: lines.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              productSku: line.productSku,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: Number((line.unitPrice * line.quantity).toFixed(2)),
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: OrderStatus.PENDING,
              note: dto.fromCart
                ? input.profileId
                  ? 'Order placed from cart'
                  : 'Guest order placed from cart'
                : 'Order placed from quote',
              changedBy: customer.id,
            },
          },
        },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          invoices: { select: { id: true } },
        },
      });

      return created;
    });

    if (dto.quoteId) {
      await this.markQuoteConverted(dto.quoteId, customer.id, orderNumber);
    }

    if (dto.fromCart) {
      const cart = await this.cartService.getActiveCartRecord(
        input.profileId ? profileId : undefined,
        input.profileId ? undefined : sessionId,
      );
      if (cart) {
        await this.cartService.clearCartById(cart.id);
        if (!input.profileId && cart.sessionId) {
          await this.prisma.shoppingCart.update({
            where: { id: cart.id },
            data: { isActive: false },
          });
        }
      }
    }

    void this.notifyOrderConfirmation(profileId, order.orderNumber, totalAmount, 'USD');

    return this.getById(profileId, order.id);
  }

  /**
   * Create or reuse a lightweight profile/customer for guest checkout.
   * Later sign-up with the same email reclaims this profile via AuthService.syncProfile.
   */
  private async findOrCreateGuestProfileId(
    email: string,
    address: CheckoutAddressDto,
  ): Promise<string> {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.profile.findUnique({
      where: { email: normalizedEmail },
      include: { customer: true },
    });

    if (existing) {
      if (existing.customer?.isSuspended) {
        throw new ForbiddenException('Customer account is suspended');
      }

      if (!existing.customer) {
        await this.prisma.customer.create({
          data: {
            profileId: existing.id,
            customerGroup: 'RETAIL',
            organizationName: address.organizationName,
            country: address.country,
          },
        });
      }

      return existing.id;
    }

    const guestRole = await this.prisma.role.findUnique({
      where: { name: PrismaUserRole.GUEST },
    });

    const profile = await this.prisma.profile.create({
      data: {
        authUserId: randomUUID(),
        email: normalizedEmail,
        firstName: address.firstName.trim(),
        lastName: address.lastName.trim(),
        phone: address.phone,
        customer: {
          create: {
            customerGroup: 'RETAIL',
            organizationName: address.organizationName,
            country: address.country,
          },
        },
        ...(guestRole
          ? {
              userRoles: {
                create: { roleId: guestRole.id },
              },
            }
          : {}),
      },
    });

    return profile.id;
  }

  async confirm(profileId: string, orderId: string): Promise<OrderDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id, deletedAt: null },
      include: { items: true, invoices: true },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (existing.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('Only pending orders can be confirmed');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CONFIRMED,
          statusHistory: {
            create: {
              fromStatus: OrderStatus.PENDING,
              toStatus: OrderStatus.CONFIRMED,
              note: 'Order confirmed by customer',
              changedBy: customer.id,
            },
          },
        },
      });

      if (existing.invoices.length === 0) {
        const invoiceNumber = await this.generateInvoiceNumber(tx);
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        await tx.invoice.create({
          data: {
            invoiceNumber,
            orderId: existing.id,
            customerId: customer.id,
            status: InvoiceStatus.ISSUED,
            subtotal: existing.subtotal,
            taxAmount: existing.taxAmount,
            shippingCost: existing.shippingCost,
            totalAmount: existing.totalAmount,
            currency: existing.currency,
            dueDate,
            notes: 'Invoice issued on order confirmation. Pay using the method selected at checkout.',
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
    });

    await this.notifyOrderStatusChange(
      profileId,
      existing.orderNumber,
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      'Order confirmed by customer',
    );

    return this.getById(profileId, orderId);
  }

  async cancel(profileId: string, orderId: string): Promise<OrderDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const existing = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Order not found');
    }

    if (existing.status !== OrderStatus.PENDING) {
      throw new ForbiddenException('Only pending orders can be cancelled');
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: {
          create: {
            fromStatus: OrderStatus.PENDING,
            toStatus: OrderStatus.CANCELLED,
            note: 'Order cancelled by customer',
            changedBy: customer.id,
          },
        },
      },
    });

    await this.notifyOrderStatusChange(
      profileId,
      existing.orderNumber,
      OrderStatus.PENDING,
      OrderStatus.CANCELLED,
      'Order cancelled by customer',
    );

    return this.getById(profileId, orderId);
  }

  private async notifyOrderConfirmation(
    profileId: string,
    orderNumber: string,
    totalAmount: number,
    currency: string,
  ): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!profile?.email) {
      return;
    }

    const customerName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

    await this.emailService.sendOrderConfirmation({
      to: profile.email,
      customerName: customerName || undefined,
      orderNumber,
      totalAmount,
      currency,
    });
  }

  private async notifyOrderStatusChange(
    profileId: string,
    orderNumber: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus,
    note?: string,
  ): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!profile?.email) {
      return;
    }

    const customerName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();

    await this.emailService.sendOrderStatusUpdate({
      to: profile.email,
      customerName: customerName || undefined,
      orderNumber,
      fromStatus,
      toStatus,
      note,
    });
  }

  private async linesFromCart(
    profileId?: string,
    sessionId?: string,
  ): Promise<LineInput[]> {
    const cart = await this.cartService.getActiveCartRecord(profileId, sessionId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const lines: LineInput[] = [];
    for (const item of cart.items) {
      const product = await this.pricing.loadSellableProduct(item.productId, {
        requirePrice: true,
      });
      this.pricing.assertQuantity(product, item.quantity);
      lines.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
      });
    }
    return lines;
  }

  private async linesFromQuote(customerId: string, quoteId: string): Promise<LineInput[]> {
    const quote = await this.prisma.quote.findFirst({
      where: { id: quoteId, customerId, deletedAt: null },
      include: { items: true },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    if (
      quote.status !== QuoteStatus.SUBMITTED &&
      quote.status !== QuoteStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Only SUBMITTED or APPROVED quotes can be converted to orders',
      );
    }

    if (quote.items.length === 0) {
      throw new BadRequestException('Quote has no items');
    }

    return quote.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice) ?? 0,
    }));
  }

  private async markQuoteConverted(
    quoteId: string,
    customerId: string,
    orderNumber: string,
  ): Promise<void> {
    const quote = await this.prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote || quote.status === QuoteStatus.CONVERTED) {
      return;
    }

    const fromStatus = quote.status;
    await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.CONVERTED,
        statusHistory: {
          create: {
            fromStatus,
            toStatus: QuoteStatus.CONVERTED,
            note: `Converted to order ${orderNumber}`,
            changedBy: customerId,
          },
        },
      },
    });
  }

  private async resolveAddressId(
    profileId: string,
    addressId?: string,
    address?: CheckoutAddressDto,
  ): Promise<string | undefined> {
    if (addressId) {
      const existing = await this.prisma.address.findFirst({
        where: { id: addressId, profileId, deletedAt: null },
      });
      if (!existing) {
        throw new NotFoundException('Address not found');
      }
      return existing.id;
    }

    if (!address) {
      return undefined;
    }

    const created = await this.prisma.address.create({
      data: {
        profileId,
        label: address.label,
        firstName: address.firstName,
        lastName: address.lastName,
        organizationName: address.organizationName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        stateProvince: address.stateProvince,
        postalCode: address.postalCode,
        country: address.country,
        phone: address.phone,
      },
    });

    return created.id;
  }

  private async generateOrderNumber(): Promise<string> {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      const orderNumber = `ORD-${stamp}-${suffix}`;
      const existing = await this.prisma.order.findUnique({
        where: { orderNumber },
        select: { id: true },
      });
      if (!existing) return orderNumber;
    }
    throw new BadRequestException('Unable to generate unique order number');
  }

  private async generateInvoiceNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
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

  private toDetail(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: import('@prisma/client').PaymentMethod;
    shippingMethod: import('@prisma/client').OrderShippingMethod;
    subtotal: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    currency: string;
    notes: string | null;
    purchaseOrderNum: string | null;
    quoteId: string | null;
    shippingAddressId: string | null;
    billingAddressId: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productSku: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }>;
    statusHistory: Array<{
      id: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      note: string | null;
      changedBy: string | null;
      createdAt: Date;
    }>;
    invoices: Array<{ id: string }>;
  }): OrderDetail {
    const items: OrderItemDto[] = order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice) ?? 0,
      totalPrice: decimalToNumber(item.totalPrice) ?? 0,
    }));

    const statusHistory: OrderStatusHistoryEntry[] = order.statusHistory.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ?? undefined,
      toStatus: entry.toStatus,
      note: entry.note ?? undefined,
      changedBy: entry.changedBy ?? undefined,
      createdAt: entry.createdAt.toISOString(),
    }));

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
      itemCount: items.length,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items,
      statusHistory,
      invoiceIds: order.invoices.map((invoice) => invoice.id),
    };
  }
}
