import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ProductSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  productDetailInclude,
  productListInclude,
  publishedProductWhere,
  toProductDetail,
  toProductSummary,
} from './products.mapper';

@Injectable()
export class ProductsService {
  private static readonly RELATED_PRODUCTS_LIMIT = 4;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
    const where = this.buildWhereClause(query);
    const orderBy = this.buildOrderBy(query.sort, query.direction);

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: productListInclude,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(toProductSummary),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async findFeatured(limit = 6): Promise<ProductSummary[]> {
    const products = await this.prisma.product.findMany({
      where: {
        ...publishedProductWhere,
        isFeatured: true,
      },
      include: productListInclude,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });

    return products.map(toProductSummary);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        ...publishedProductWhere,
        slug,
      },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    const categoryIds = product.productCategories.map((item) => item.categoryId);
    const relatedProducts = await this.findRelatedProducts(product.id, categoryIds);

    return toProductDetail(product, relatedProducts);
  }

  private async findRelatedProducts(
    productId: string,
    categoryIds: string[],
  ): Promise<ProductSummary[]> {
    const limit = ProductsService.RELATED_PRODUCTS_LIMIT;
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { isFeatured: 'desc' },
      { sortOrder: 'asc' },
    ];
    const related = [];

    if (categoryIds.length > 0) {
      const sameCategory = await this.prisma.product.findMany({
        where: {
          ...publishedProductWhere,
          id: { not: productId },
          productCategories: {
            some: {
              categoryId: { in: categoryIds },
            },
          },
        },
        include: productListInclude,
        orderBy,
        take: limit,
      });

      related.push(...sameCategory);
    }

    if (related.length < limit) {
      const excludeIds = [productId, ...related.map((item) => item.id)];
      const backfill = await this.prisma.product.findMany({
        where: {
          ...publishedProductWhere,
          id: { notIn: excludeIds },
        },
        include: productListInclude,
        orderBy,
        take: limit - related.length,
      });

      related.push(...backfill);
    }

    return related.slice(0, limit).map(toProductSummary);
  }

  async suggest(query: string, limit = 8) {
    const trimmed = query.trim();

    const products = await this.prisma.product.findMany({
      where: {
        ...publishedProductWhere,
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { sku: { contains: trimmed, mode: 'insensitive' } },
          { casNumber: { contains: trimmed, mode: 'insensitive' } },
          { molecularFormula: { contains: trimmed, mode: 'insensitive' } },
          { sequence: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      include: productListInclude,
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      take: limit,
    });

    return products.map(toProductSummary);
  }

  async findManyByIds(ids: string[]): Promise<ProductSummary[]> {
    if (ids.length === 0) return [];

    const products = await this.prisma.product.findMany({
      where: {
        ...publishedProductWhere,
        id: { in: ids },
      },
      include: productListInclude,
    });

    const byId = new Map(products.map((product) => [product.id, toProductSummary(product)]));

    return ids
      .map((id) => byId.get(id))
      .filter((product): product is ProductSummary => product != null);
  }

  private buildWhereClause(query: ProductQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      ...publishedProductWhere,
    };

    if (query.featured) {
      where.isFeatured = true;
    }

    if (query.category) {
      where.productCategories = {
        some: {
          category: {
            slug: query.category,
            deletedAt: null,
            isVisible: true,
          },
        },
      };
    }

    if (query.purity) {
      where.purity = { equals: query.purity, mode: 'insensitive' };
    }

    if (query.availability) {
      where.availability = query.availability;
    }

    if (query.priceMin != null || query.priceMax != null) {
      where.retailPrice = {
        ...(query.priceMin != null ? { gte: query.priceMin } : {}),
        ...(query.priceMax != null ? { lte: query.priceMax } : {}),
      };
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { casNumber: { contains: search, mode: 'insensitive' } },
        { molecularFormula: { contains: search, mode: 'insensitive' } },
        { sequence: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    sort?: string,
    direction: 'asc' | 'desc' = 'desc',
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case 'name':
        return [{ name: direction }];
      case 'price':
        return [{ retailPrice: direction }];
      case 'sku':
        return [{ sku: direction }];
      case 'featured':
        return [{ isFeatured: 'desc' }, { sortOrder: 'asc' }];
      default:
        return [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
    }
  }
}
