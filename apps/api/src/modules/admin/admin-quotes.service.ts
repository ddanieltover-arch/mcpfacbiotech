import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuoteStatus } from '@prisma/client';
import type { AdminQuoteSummary, QuoteDetail } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { decimalToNumber } from '@/modules/products/products.mapper';
import type { AdminQuoteQueryDto } from './dto/admin-query.dto';
import type { AdminQuoteActionDto } from './dto/admin-mutations.dto';

const REVIEWABLE: QuoteStatus[] = [
  QuoteStatus.SUBMITTED,
  QuoteStatus.UNDER_REVIEW,
  QuoteStatus.REVISED,
];

@Injectable()
export class AdminQuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminQuoteQueryDto) {
    const where: Prisma.QuoteWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { quoteNumber: { contains: query.search, mode: 'insensitive' } },
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
      this.prisma.quote.findMany({
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
      this.prisma.quote.count({ where }),
    ]);

    const items: AdminQuoteSummary[] = rows.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      totalAmount: decimalToNumber(quote.totalAmount) ?? 0,
      currency: quote.currency,
      itemCount: quote._count.items,
      customerEmail: quote.customer.profile.email,
      customerName: `${quote.customer.profile.firstName} ${quote.customer.profile.lastName}`.trim(),
      organizationName: quote.customer.organizationName ?? undefined,
      expiresAt: quote.expiresAt?.toISOString(),
      createdAt: quote.createdAt.toISOString(),
    }));

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<QuoteDetail & { customerEmail: string; internalNotes?: string }> {
    const quote = await this.prisma.quote.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: { orderBy: { productName: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        customer: {
          include: {
            profile: { select: { email: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

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
      itemCount: quote.items.length,
      expiresAt: quote.expiresAt?.toISOString(),
      createdAt: quote.createdAt.toISOString(),
      updatedAt: quote.updatedAt.toISOString(),
      customerEmail: quote.customer.profile.email,
      internalNotes: quote.internalNotes ?? undefined,
      items: quote.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        unitPrice: decimalToNumber(item.unitPrice) ?? 0,
        totalPrice: decimalToNumber(item.totalPrice) ?? 0,
        notes: item.notes ?? undefined,
      })),
      statusHistory: quote.statusHistory.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus ?? undefined,
        toStatus: entry.toStatus,
        note: entry.note ?? undefined,
        changedBy: entry.changedBy ?? undefined,
        createdAt: entry.createdAt.toISOString(),
      })),
    };
  }

  async startReview(id: string, actorProfileId: string, dto: AdminQuoteActionDto) {
    return this.transition(id, actorProfileId, QuoteStatus.UNDER_REVIEW, dto, REVIEWABLE);
  }

  async approve(id: string, actorProfileId: string, dto: AdminQuoteActionDto) {
    const quote = await this.transition(
      id,
      actorProfileId,
      QuoteStatus.APPROVED,
      dto,
      REVIEWABLE,
    );

    await this.prisma.quote.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        approvedBy: actorProfileId,
      },
    });

    return this.getById(quote.id);
  }

  async reject(id: string, actorProfileId: string, dto: AdminQuoteActionDto) {
    return this.transition(id, actorProfileId, QuoteStatus.REJECTED, dto, REVIEWABLE);
  }

  private async transition(
    id: string,
    actorProfileId: string,
    toStatus: QuoteStatus,
    dto: AdminQuoteActionDto,
    allowedFrom: QuoteStatus[],
  ) {
    const existing = await this.prisma.quote.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Quote not found');
    }

    if (!allowedFrom.includes(existing.status)) {
      throw new BadRequestException(
        `Cannot move quote from ${existing.status} to ${toStatus}`,
      );
    }

    await this.prisma.quote.update({
      where: { id },
      data: {
        status: toStatus,
        ...(dto.internalNotes !== undefined ? { internalNotes: dto.internalNotes } : {}),
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus,
            note: dto.note ?? `Quote ${toStatus.toLowerCase().replace('_', ' ')} by admin`,
            changedBy: actorProfileId,
          },
        },
      },
    });

    return this.getById(id);
  }
}
