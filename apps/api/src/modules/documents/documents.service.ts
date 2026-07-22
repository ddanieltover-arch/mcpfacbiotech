import { Injectable } from '@nestjs/common';
import { DocumentType, Prisma } from '@prisma/client';
import type { DocumentSearchResult } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public search for approved PUBLIC documents (COA library).
   * Matches title, file name, description, or linked product SKU/name.
   */
  async search(params: {
    q?: string;
    type?: DocumentType;
    limit?: number;
  }): Promise<DocumentSearchResult[]> {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
    const q = params.q?.trim();

    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      isApproved: true,
      permission: 'PUBLIC',
      ...(params.type ? { type: params.type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { fileName: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              {
                productDocuments: {
                  some: {
                    product: {
                      deletedAt: null,
                      OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { sku: { contains: q, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const rows = await this.prisma.document.findMany({
      where,
      include: {
        productDocuments: {
          include: {
            product: {
              select: { name: true, sku: true, slug: true, deletedAt: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return rows.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      version: doc.version,
      description: doc.description ?? undefined,
      products: doc.productDocuments
        .filter((link) => !link.product.deletedAt)
        .map((link) => ({
          name: link.product.name,
          sku: link.product.sku,
          slug: link.product.slug,
        })),
    }));
  }
}
