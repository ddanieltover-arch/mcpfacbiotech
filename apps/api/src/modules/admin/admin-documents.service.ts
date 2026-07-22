import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminDocumentSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminDocumentQueryDto } from './dto/admin-query.dto';
import type {
  CreateAdminDocumentDto,
  UpdateAdminDocumentDto,
} from './dto/admin-mutations.dto';

const documentInclude = {
  productDocuments: {
    include: {
      product: {
        select: { id: true, name: true, sku: true, slug: true, deletedAt: true },
      },
    },
  },
} satisfies Prisma.DocumentInclude;

@Injectable()
export class AdminDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminDocumentQueryDto) {
    const approvedFilter =
      query.approved === 'true' ? true : query.approved === 'false' ? false : undefined;

    const where: Prisma.DocumentWhereInput = {
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(approvedFilter !== undefined ? { isApproved: approvedFilter } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { fileName: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              {
                productDocuments: {
                  some: {
                    product: {
                      deletedAt: null,
                      OR: [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { sku: { contains: query.search, mode: 'insensitive' } },
                      ],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: documentInclude,
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toSummary(row)),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<AdminDocumentSummary> {
    const document = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      include: documentInclude,
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return this.toSummary(document);
  }

  async create(dto: CreateAdminDocumentDto): Promise<AdminDocumentSummary> {
    if (dto.productId) {
      await this.assertProductExists(dto.productId);
    }

    const created = await this.prisma.document.create({
      data: {
        title: dto.title.trim(),
        type: dto.type,
        fileUrl: dto.fileUrl.trim(),
        fileName: dto.fileName.trim(),
        permission: dto.permission ?? 'PUBLIC',
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        version: dto.version?.trim() || '1.0',
        language: dto.language?.trim() || 'en',
        description: dto.description,
        isApproved: dto.isApproved ?? false,
        ...(dto.productId
          ? {
              productDocuments: {
                create: { productId: dto.productId },
              },
            }
          : {}),
      },
    });

    return this.getById(created.id);
  }

  async update(id: string, dto: UpdateAdminDocumentDto): Promise<AdminDocumentSummary> {
    await this.requireDocument(id);

    await this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.fileUrl !== undefined ? { fileUrl: dto.fileUrl.trim() } : {}),
        ...(dto.fileName !== undefined ? { fileName: dto.fileName.trim() } : {}),
        ...(dto.permission !== undefined ? { permission: dto.permission } : {}),
        ...(dto.fileSize !== undefined ? { fileSize: dto.fileSize } : {}),
        ...(dto.mimeType !== undefined ? { mimeType: dto.mimeType } : {}),
        ...(dto.version !== undefined ? { version: dto.version.trim() || '1.0' } : {}),
        ...(dto.language !== undefined ? { language: dto.language.trim() || 'en' } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isApproved !== undefined ? { isApproved: dto.isApproved } : {}),
      },
    });

    return this.getById(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.requireDocument(id);
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date(), isApproved: false },
    });
  }

  async attachProduct(documentId: string, productId: string): Promise<AdminDocumentSummary> {
    await this.requireDocument(documentId);
    await this.assertProductExists(productId);

    await this.prisma.productDocument.upsert({
      where: {
        productId_documentId: { productId, documentId },
      },
      create: { productId, documentId },
      update: {},
    });

    return this.getById(documentId);
  }

  async detachProduct(documentId: string, productId: string): Promise<AdminDocumentSummary> {
    await this.requireDocument(documentId);

    const link = await this.prisma.productDocument.findUnique({
      where: { productId_documentId: { productId, documentId } },
    });
    if (!link) {
      throw new NotFoundException('Product is not attached to this document');
    }

    await this.prisma.productDocument.delete({
      where: { id: link.id },
    });

    return this.getById(documentId);
  }

  private async requireDocument(id: string) {
    const existing = await this.prisma.document.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Document not found');
    }
  }

  private async assertProductExists(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
  }

  private toSummary(
    document: Prisma.DocumentGetPayload<{ include: typeof documentInclude }>,
  ): AdminDocumentSummary {
    const products = document.productDocuments
      .filter((link) => !link.product.deletedAt)
      .map((link) => ({
        id: link.product.id,
        name: link.product.name,
        sku: link.product.sku,
        slug: link.product.slug,
      }));

    return {
      id: document.id,
      title: document.title,
      type: document.type,
      permission: document.permission,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
      fileSize: document.fileSize ?? undefined,
      mimeType: document.mimeType ?? undefined,
      version: document.version,
      language: document.language,
      description: document.description ?? undefined,
      isApproved: document.isApproved,
      downloadCount: document.downloadCount,
      productCount: products.length,
      products,
      updatedAt: document.updatedAt.toISOString(),
    };
  }
}
