import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import type { Category } from '@mcpfac/shared-types';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
        isVisible: true,
        parentId: null,
      },
      include: {
        children: {
          where: {
            deletedAt: null,
            isVisible: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: {
              where: {
                product: {
                  deletedAt: null,
                  status: 'PUBLISHED',
                  isVisible: true,
                },
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map((category) => this.toCategory(category, true));
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
        isVisible: true,
      },
      include: {
        children: {
          where: {
            deletedAt: null,
            isVisible: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            productCategories: {
              where: {
                product: {
                  deletedAt: null,
                  status: 'PUBLISHED',
                  isVisible: true,
                },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    return this.toCategory(category, true);
  }

  private toCategory(
    category: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      imageUrl: string | null;
      parentId: string | null;
      sortOrder: number;
      isVisible: boolean;
      isFeatured: boolean;
      children?: Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        parentId: string | null;
        sortOrder: number;
        isVisible: boolean;
        isFeatured: boolean;
        _count?: { productCategories: number };
      }>;
      _count?: { productCategories: number };
    },
    includeChildren: boolean,
  ): Category {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? undefined,
      imageUrl: category.imageUrl ?? undefined,
      parentId: category.parentId ?? undefined,
      sortOrder: category.sortOrder,
      isVisible: category.isVisible,
      isFeatured: category.isFeatured,
      productCount: category._count?.productCategories,
      children:
        includeChildren && category.children
          ? category.children.map((child) => this.toCategory(child, false))
          : undefined,
    };
  }
}
