import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import type { AdminProductSummary, ProductDetail } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import {
  decimalToNumber,
  productDetailInclude,
  toProductDetail,
} from '@/modules/products/products.mapper';
import type { AdminProductQueryDto } from './dto/admin-query.dto';
import type { UpdateAdminProductDto } from './dto/admin-mutations.dto';

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminProductQueryDto) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.availability ? { availability: query.availability } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { casNumber: { contains: query.search, mode: 'insensitive' } },
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
        orderBy: { updatedAt: query.direction === 'asc' ? 'asc' : 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    const items: AdminProductSummary[] = rows.map((product) => {
      const threshold = product.lowStockThreshold ?? 5;
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        status: product.status,
        availability: product.availability,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: threshold,
        isLowStock: product.stockQuantity <= threshold,
        retailPrice: decimalToNumber(product.retailPrice) ?? undefined,
        isFeatured: product.isFeatured,
        isVisible: product.isVisible,
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

  async getById(
    id: string,
  ): Promise<ProductDetail & { stockQuantity: number; isVisible: boolean; lowStockThreshold: number }> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...toProductDetail(product, []),
      stockQuantity: product.stockQuantity,
      isVisible: product.isVisible,
      lowStockThreshold: product.lowStockThreshold ?? 5,
    };
  }

  async update(id: string, dto: UpdateAdminProductDto, actorProfileId: string) {
    const existing = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.shortDescription !== undefined
          ? { shortDescription: dto.shortDescription }
          : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.status !== undefined ? { status: dto.status as ProductStatus } : {}),
        ...(dto.availability !== undefined ? { availability: dto.availability } : {}),
        ...(dto.stockQuantity !== undefined ? { stockQuantity: dto.stockQuantity } : {}),
        ...(dto.lowStockThreshold !== undefined
          ? { lowStockThreshold: dto.lowStockThreshold }
          : {}),
        ...(dto.minimumOrderQty !== undefined
          ? { minimumOrderQty: dto.minimumOrderQty }
          : {}),
        ...(dto.retailPrice !== undefined ? { retailPrice: dto.retailPrice } : {}),
        ...(dto.wholesalePrice !== undefined ? { wholesalePrice: dto.wholesalePrice } : {}),
        ...(dto.distributorPrice !== undefined
          ? { distributorPrice: dto.distributorPrice }
          : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
        updatedBy: actorProfileId,
      },
    });

    return this.getById(id);
  }
}
