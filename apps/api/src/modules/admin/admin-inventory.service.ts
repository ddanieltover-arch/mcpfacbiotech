import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductAvailability } from '@prisma/client';
import type { AdminInventoryItem } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminInventoryQueryDto } from './dto/admin-query.dto';
import type { UpdateAdminInventoryDto } from './dto/admin-mutations.dto';

@Injectable()
export class AdminInventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminInventoryQueryDto) {
    const lowStockOnly = query.lowStockOnly === 'true';

    let lowStockIds: string[] | undefined;
    if (lowStockOnly) {
      const rows = await this.prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM products
        WHERE deleted_at IS NULL
          AND stock_quantity <= low_stock_threshold
      `;
      lowStockIds = rows.map((row) => row.id);
      if (lowStockIds.length === 0) {
        return {
          items: [] as AdminInventoryItem[],
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
        };
      }
    }

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(lowStockIds ? { id: { in: lowStockIds } } : {}),
      ...(query.availability ? { availability: query.availability } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          productCategories: {
            include: { category: { select: { name: true } } },
            take: 1,
          },
        },
        orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const items: AdminInventoryItem[] = rows.map((product) => {
      const threshold = product.lowStockThreshold ?? 5;
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        status: product.status,
        availability: product.availability,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: threshold,
        isLowStock: product.stockQuantity <= threshold,
        leadTimeDays: product.leadTimeDays ?? undefined,
        categoryName: product.productCategories[0]?.category.name,
        updatedAt: product.updatedAt.toISOString(),
      };
    });

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async update(id: string, dto: UpdateAdminInventoryDto, actorProfileId: string) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    const nextStock = dto.stockQuantity ?? existing.stockQuantity;
    const nextThreshold = dto.lowStockThreshold ?? existing.lowStockThreshold ?? 5;
    let nextAvailability = dto.availability ?? existing.availability;

    // Auto-toggle IN_STOCK ↔ LOW_STOCK when stock crosses threshold (unless caller set availability).
    if (dto.availability === undefined) {
      if (
        nextStock <= nextThreshold &&
        (existing.availability === ProductAvailability.IN_STOCK ||
          existing.availability === ProductAvailability.LOW_STOCK)
      ) {
        nextAvailability = ProductAvailability.LOW_STOCK;
      } else if (
        nextStock > nextThreshold &&
        existing.availability === ProductAvailability.LOW_STOCK
      ) {
        nextAvailability = ProductAvailability.IN_STOCK;
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        stockQuantity: nextStock,
        lowStockThreshold: nextThreshold,
        availability: nextAvailability,
        ...(dto.leadTimeDays !== undefined ? { leadTimeDays: dto.leadTimeDays } : {}),
        updatedBy: actorProfileId,
      },
      include: {
        productCategories: {
          include: { category: { select: { name: true } } },
          take: 1,
        },
      },
    });

    const threshold = updated.lowStockThreshold ?? 5;
    const item: AdminInventoryItem = {
      id: updated.id,
      name: updated.name,
      sku: updated.sku,
      slug: updated.slug,
      status: updated.status,
      availability: updated.availability,
      stockQuantity: updated.stockQuantity,
      lowStockThreshold: threshold,
      isLowStock: updated.stockQuantity <= threshold,
      leadTimeDays: updated.leadTimeDays ?? undefined,
      categoryName: updated.productCategories[0]?.category.name,
      updatedAt: updated.updatedAt.toISOString(),
    };

    return item;
  }

  async countLowStock(): Promise<number> {
    const rows = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM products
      WHERE deleted_at IS NULL
        AND (
          availability = 'LOW_STOCK'
          OR stock_quantity <= low_stock_threshold
        )
    `;
    return Number(rows[0]?.count ?? 0);
  }
}
