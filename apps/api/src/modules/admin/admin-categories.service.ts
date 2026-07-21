import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminCategorySummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminCategoryQueryDto } from './dto/admin-query.dto';
import type {
  CreateAdminCategoryDto,
  UpsertAdminCategoryDto,
} from './dto/admin-mutations.dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 280);
}

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminCategoryQueryDto) {
    const visibleFilter =
      query.visible === 'true' ? true : query.visible === 'false' ? false : undefined;

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
      ...(query.parentId === 'null'
        ? { parentId: null }
        : query.parentId
          ? { parentId: query.parentId }
          : {}),
      ...(visibleFilter !== undefined ? { isVisible: visibleFilter } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: {
          parent: { select: { name: true } },
          _count: {
            select: {
              children: { where: { deletedAt: null } },
              productCategories: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    const items: AdminCategorySummary[] = rows.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      imageUrl: category.imageUrl ?? undefined,
      parentId: category.parentId ?? undefined,
      parentName: category.parent?.name,
      sortOrder: category.sortOrder,
      isVisible: category.isVisible,
      isFeatured: category.isFeatured,
      productCount: category._count.productCategories,
      childrenCount: category._count.children,
      updatedAt: category.updatedAt.toISOString(),
    }));

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<AdminCategorySummary> {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: { select: { name: true } },
        _count: {
          select: {
            children: { where: { deletedAt: null } },
            productCategories: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      imageUrl: category.imageUrl ?? undefined,
      parentId: category.parentId ?? undefined,
      parentName: category.parent?.name,
      sortOrder: category.sortOrder,
      isVisible: category.isVisible,
      isFeatured: category.isFeatured,
      productCount: category._count.productCategories,
      childrenCount: category._count.children,
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  async create(dto: CreateAdminCategoryDto): Promise<AdminCategorySummary> {
    const slug = await this.ensureUniqueSlug(dto.slug?.trim() || slugify(dto.name));

    if (dto.parentId) {
      await this.assertParentExists(dto.parentId);
    }

    const created = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isVisible: dto.isVisible ?? true,
        isFeatured: dto.isFeatured ?? false,
      },
    });

    return this.getById(created.id);
  }

  async update(id: string, dto: UpsertAdminCategoryDto): Promise<AdminCategorySummary> {
    const existing = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (dto.parentId === id) {
      throw new BadRequestException('Category cannot be its own parent');
    }

    if (dto.parentId) {
      await this.assertParentExists(dto.parentId);
    }

    let slug = existing.slug;
    if (dto.slug !== undefined) {
      slug = await this.ensureUniqueSlug(dto.slug.trim() || slugify(dto.name ?? existing.name), id);
    } else if (dto.name !== undefined && dto.name.trim() !== existing.name) {
      slug = await this.ensureUniqueSlug(slugify(dto.name), id);
    }

    await this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        slug,
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId || null } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
      },
    });

    return this.getById(id);
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { children: { where: { deletedAt: null } } } },
      },
    });

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (existing._count.children > 0) {
      throw new BadRequestException('Reassign or delete child categories first');
    }

    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isVisible: false },
    });
  }

  private async assertParentExists(parentId: string) {
    const parent = await this.prisma.category.findFirst({
      where: { id: parentId, deletedAt: null },
      select: { id: true },
    });
    if (!parent) {
      throw new BadRequestException('Parent category not found');
    }
  }

  private async ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = base || 'category';
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
      const existing = await this.prisma.category.findFirst({
        where: {
          slug: candidate,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });
      if (!existing) return candidate;
    }
    throw new ConflictException('Unable to allocate a unique category slug');
  }
}
