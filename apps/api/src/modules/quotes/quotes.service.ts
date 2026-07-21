import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuoteStatus } from '@prisma/client';
import type {
  QuoteDetail,
  QuoteItem as QuoteItemDto,
  QuoteStatusHistoryEntry,
  QuoteSummary,
} from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { CommercePricingService } from '@/modules/commerce/commerce-pricing';
import { CartService } from '@/modules/cart/cart.service';
import { EmailService } from '@/modules/email/email.service';
import { decimalToNumber } from '@/modules/products/products.mapper';
import type { CreateQuoteDto, UpdateQuoteDto } from './dto/quote.dto';

@Injectable()
export class QuotesService {
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
  ): Promise<{ items: QuoteSummary[]; total: number; page: number; limit: number }> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      this.prisma.quote.findMany({
        where: {
          customerId: customer.id,
          deletedAt: null,
        },
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quote.count({
        where: {
          customerId: customer.id,
          deletedAt: null,
        },
      }),
    ]);

    return {
      items: quotes.map((quote) => ({
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        totalAmount: decimalToNumber(quote.totalAmount) ?? 0,
        currency: quote.currency,
        itemCount: quote._count.items,
        expiresAt: quote.expiresAt?.toISOString(),
        createdAt: quote.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(profileId: string, quoteId: string): Promise<QuoteDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const quote = await this.prisma.quote.findFirst({
      where: {
        id: quoteId,
        customerId: customer.id,
        deletedAt: null,
      },
      include: {
        items: {
          orderBy: { productName: 'asc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return this.toDetail(quote);
  }

  async create(profileId: string, dto: CreateQuoteDto): Promise<QuoteDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);

    const lineInputs = await this.resolveCreateLines(profileId, dto);
    if (lineInputs.length === 0) {
      throw new BadRequestException('Quote requires at least one product');
    }

    const subtotal = Number(
      lineInputs
        .reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
        .toFixed(2),
    );

    const quoteNumber = await this.generateQuoteNumber();

    const quote = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          quoteNumber,
          customerId: customer.id,
          status: QuoteStatus.DRAFT,
          subtotal,
          shippingCost: 0,
          totalAmount: subtotal,
          currency: 'USD',
          notes: dto.notes,
          purchaseOrderNum: dto.purchaseOrderNumber,
          items: {
            create: lineInputs.map((line) => ({
              productId: line.productId,
              productName: line.productName,
              productSku: line.productSku,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              totalPrice: Number((line.unitPrice * line.quantity).toFixed(2)),
              notes: line.notes,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: QuoteStatus.DRAFT,
              note: 'Quote draft created',
              changedBy: customer.id,
            },
          },
        },
        include: {
          items: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return created;
    });

    return this.toDetail(quote);
  }

  async update(
    profileId: string,
    quoteId: string,
    dto: UpdateQuoteDto,
  ): Promise<QuoteDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const existing = await this.prisma.quote.findFirst({
      where: {
        id: quoteId,
        customerId: customer.id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Quote not found');
    }

    if (existing.status !== QuoteStatus.DRAFT) {
      throw new ForbiddenException('Only draft quotes can be edited');
    }

    let itemsUpdate:
      | {
          deleteMany: Record<string, never>;
          create: Array<{
            productId: string;
            productName: string;
            productSku: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
            notes?: string;
          }>;
        }
      | undefined;

    let subtotal = decimalToNumber(existing.subtotal) ?? 0;

    if (dto.items) {
      if (dto.items.length === 0) {
        throw new BadRequestException('Quote requires at least one product');
      }

      const lines = await this.buildLinesFromItems(dto.items);
      subtotal = Number(
        lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0).toFixed(2),
      );

      itemsUpdate = {
        deleteMany: {},
        create: lines.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          productSku: line.productSku,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: Number((line.unitPrice * line.quantity).toFixed(2)),
          notes: line.notes,
        })),
      };
    }

    const quote = await this.prisma.quote.update({
      where: { id: quoteId },
      data: {
        notes: dto.notes !== undefined ? dto.notes : existing.notes,
        purchaseOrderNum:
          dto.purchaseOrderNumber !== undefined
            ? dto.purchaseOrderNumber
            : existing.purchaseOrderNum,
        ...(itemsUpdate
          ? {
              subtotal,
              totalAmount: subtotal,
              items: itemsUpdate,
            }
          : {}),
      },
      include: {
        items: {
          orderBy: { productName: 'asc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.toDetail(quote);
  }

  async submit(profileId: string, quoteId: string): Promise<QuoteDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const existing = await this.prisma.quote.findFirst({
      where: {
        id: quoteId,
        customerId: customer.id,
        deletedAt: null,
      },
      include: {
        items: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Quote not found');
    }

    if (existing.status !== QuoteStatus.DRAFT) {
      throw new ForbiddenException('Only draft quotes can be submitted');
    }

    if (existing.items.length === 0) {
      throw new BadRequestException('Cannot submit an empty quote');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const quote = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.quote.update({
        where: { id: quoteId },
        data: {
          status: QuoteStatus.SUBMITTED,
          expiresAt,
          statusHistory: {
            create: {
              fromStatus: QuoteStatus.DRAFT,
              toStatus: QuoteStatus.SUBMITTED,
              note: 'Quote submitted by customer',
              changedBy: customer.id,
            },
          },
        },
        include: {
          items: {
            orderBy: { productName: 'asc' },
          },
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return updated;
    });

    // Clear customer cart after successful submit (plan: clear on submit).
    const cart = await this.cartService.getActiveCartRecord(profileId);
    if (cart) {
      await this.cartService.clearCartById(cart.id);
    }

    void this.notifyQuoteSubmitted(
      profileId,
      quote.quoteNumber,
      decimalToNumber(quote.totalAmount) ?? 0,
      quote.currency,
    );

    return this.toDetail(quote);
  }

  private async notifyQuoteSubmitted(
    profileId: string,
    quoteNumber: string,
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

    await this.emailService.sendQuoteSubmitted({
      to: profile.email,
      customerName: customerName || undefined,
      quoteNumber,
      totalAmount,
      currency,
    });
  }

  private async resolveCreateLines(profileId: string, dto: CreateQuoteDto) {
    if (dto.fromCart) {
      const cart = await this.cartService.getActiveCartRecord(profileId);
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const lines = [];
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
          notes: undefined as string | undefined,
        });
      }
      return lines;
    }

    if (!dto.items?.length) {
      throw new BadRequestException('Provide items or set fromCart=true');
    }

    return this.buildLinesFromItems(dto.items);
  }

  private async buildLinesFromItems(
    items: Array<{ productId: string; quantity: number; notes?: string }>,
  ) {
    const lines = [];

    for (const item of items) {
      // Allow unpriced catalog products on explicit quote requests (unitPrice 0).
      const product = await this.pricing.loadSellableProduct(item.productId, {
        requirePrice: false,
      });
      this.pricing.assertQuantity(product, item.quantity);
      lines.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        notes: item.notes,
      });
    }

    return lines;
  }

  private async generateQuoteNumber(): Promise<string> {
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      const quoteNumber = `QT-${stamp}-${suffix}`;
      const existing = await this.prisma.quote.findUnique({
        where: { quoteNumber },
        select: { id: true },
      });
      if (!existing) {
        return quoteNumber;
      }
    }

    throw new BadRequestException('Unable to generate unique quote number');
  }

  private toDetail(quote: {
    id: string;
    quoteNumber: string;
    status: QuoteStatus;
    subtotal: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    currency: string;
    notes: string | null;
    purchaseOrderNum: string | null;
    expiresAt: Date | null;
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
      notes: string | null;
    }>;
    statusHistory: Array<{
      id: string;
      fromStatus: QuoteStatus | null;
      toStatus: QuoteStatus;
      note: string | null;
      changedBy: string | null;
      createdAt: Date;
    }>;
  }): QuoteDetail {
    const items: QuoteItemDto[] = quote.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice) ?? 0,
      totalPrice: decimalToNumber(item.totalPrice) ?? 0,
      notes: item.notes ?? undefined,
    }));

    const statusHistory: QuoteStatusHistoryEntry[] = quote.statusHistory.map((entry) => ({
      id: entry.id,
      fromStatus: entry.fromStatus ?? undefined,
      toStatus: entry.toStatus,
      note: entry.note ?? undefined,
      changedBy: entry.changedBy ?? undefined,
      createdAt: entry.createdAt.toISOString(),
    }));

    return {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      subtotal: decimalToNumber(quote.subtotal) ?? 0,
      shippingCost: decimalToNumber(quote.shippingCost) ?? 0,
      totalAmount: decimalToNumber(quote.totalAmount) ?? 0,
      currency: quote.currency,
      notes: quote.notes ?? undefined,
      purchaseOrderNumber: quote.purchaseOrderNum ?? undefined,
      expiresAt: quote.expiresAt?.toISOString(),
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      itemCount: items.length,
      items,
      statusHistory,
    };
  }
}
