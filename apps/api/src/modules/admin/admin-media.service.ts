import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminMediaSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminMediaQueryDto } from './dto/admin-query.dto';
import type { CreateAdminMediaDto, UpdateAdminMediaDto } from './dto/admin-mutations.dto';

@Injectable()
export class AdminMediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminMediaQueryDto) {
    const where: Prisma.MediaWhereInput = {
      ...(query.folder ? { folder: query.folder } : {}),
      ...(query.search
        ? {
            OR: [
              { fileName: { contains: query.search, mode: 'insensitive' } },
              { alt: { contains: query.search, mode: 'insensitive' } },
              { folder: { contains: query.search, mode: 'insensitive' } },
              { fileUrl: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toSummary(row)),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<AdminMediaSummary> {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media asset not found');
    }
    return this.toSummary(media);
  }

  async create(dto: CreateAdminMediaDto): Promise<AdminMediaSummary> {
    const created = await this.prisma.media.create({
      data: {
        fileName: dto.fileName.trim(),
        fileUrl: dto.fileUrl.trim(),
        mimeType: dto.mimeType.trim(),
        fileSize: dto.fileSize,
        alt: dto.alt,
        folder: dto.folder?.trim() || 'general',
      },
    });
    return this.toSummary(created);
  }

  async update(id: string, dto: UpdateAdminMediaDto): Promise<AdminMediaSummary> {
    await this.requireMedia(id);

    const updated = await this.prisma.media.update({
      where: { id },
      data: {
        ...(dto.fileName !== undefined ? { fileName: dto.fileName.trim() } : {}),
        ...(dto.fileUrl !== undefined ? { fileUrl: dto.fileUrl.trim() } : {}),
        ...(dto.mimeType !== undefined ? { mimeType: dto.mimeType.trim() } : {}),
        ...(dto.fileSize !== undefined ? { fileSize: dto.fileSize } : {}),
        ...(dto.alt !== undefined ? { alt: dto.alt } : {}),
        ...(dto.folder !== undefined ? { folder: dto.folder.trim() || 'general' } : {}),
      },
    });

    return this.toSummary(updated);
  }

  async remove(id: string): Promise<void> {
    await this.requireMedia(id);
    await this.prisma.media.delete({ where: { id } });
  }

  private async requireMedia(id: string) {
    const existing = await this.prisma.media.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Media asset not found');
    }
  }

  private toSummary(media: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    mimeType: string;
    alt: string | null;
    folder: string;
    uploadedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): AdminMediaSummary {
    return {
      id: media.id,
      fileName: media.fileName,
      fileUrl: media.fileUrl,
      fileSize: media.fileSize ?? undefined,
      mimeType: media.mimeType,
      alt: media.alt ?? undefined,
      folder: media.folder,
      uploadedBy: media.uploadedBy ?? undefined,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    };
  }
}
