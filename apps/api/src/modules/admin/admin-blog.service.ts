import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlogPostStatus, Prisma } from '@prisma/client';
import type {
  AdminBlogPostSummary,
  BlogPostContentPayload,
} from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminBlogQueryDto } from './dto/admin-query.dto';
import type { CreateAdminBlogPostDto, UpdateAdminBlogPostDto } from './dto/admin-mutations.dto';
import { parseBlogContent, serializeBlogContent, slugifyLabel } from './blog-content.util';

@Injectable()
export class AdminBlogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminBlogQueryDto) {
    const where: Prisma.BlogPostWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { excerpt: { contains: query.search, mode: 'insensitive' } },
              { authorName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toSummary(row)),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<AdminBlogPostSummary> {
    const post = await this.prisma.blogPost.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return this.toSummary(post);
  }

  async create(dto: CreateAdminBlogPostDto): Promise<AdminBlogPostSummary> {
    const slug = slugifyLabel(dto.slug || dto.title);
    if (!slug) throw new BadRequestException('Slug is required');

    await this.assertSlugAvailable(slug);

    const categoryId = await this.resolveCategoryId(dto.categoryName);
    const content = this.normalizeContent(dto.content, dto.readingTime);
    const status = dto.status ?? BlogPostStatus.DRAFT;
    const publishedAt =
      status === BlogPostStatus.PUBLISHED
        ? dto.publishedAt
          ? new Date(dto.publishedAt)
          : new Date()
        : dto.publishedAt
          ? new Date(dto.publishedAt)
          : null;

    const created = await this.prisma.blogPost.create({
      data: {
        title: dto.title.trim(),
        slug,
        excerpt: dto.excerpt?.trim() || null,
        content: serializeBlogContent(content),
        coverImage: dto.coverImage?.trim() || null,
        authorName: (dto.authorName ?? 'MCPFAC BIOTECH').trim(),
        status,
        publishedAt,
        isFeatured: dto.isFeatured ?? false,
        categoryId,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return this.toSummary(created);
  }

  async update(id: string, dto: UpdateAdminBlogPostDto): Promise<AdminBlogPostSummary> {
    const existing = await this.requirePost(id);

    if (dto.slug && slugifyLabel(dto.slug) !== existing.slug) {
      await this.assertSlugAvailable(slugifyLabel(dto.slug), id);
    }

    const nextStatus = dto.status ?? existing.status;
    let publishedAt = existing.publishedAt;
    if (dto.publishedAt !== undefined) {
      publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    } else if (
      nextStatus === BlogPostStatus.PUBLISHED &&
      existing.status !== BlogPostStatus.PUBLISHED &&
      !publishedAt
    ) {
      publishedAt = new Date();
    }

    const categoryId =
      dto.categoryName !== undefined
        ? await this.resolveCategoryId(dto.categoryName)
        : existing.categoryId;

    let contentRaw = existing.content;
    if (dto.content !== undefined || dto.readingTime !== undefined) {
      const current = parseBlogContent(existing.content);
      const next = this.normalizeContent(
        dto.content ?? JSON.stringify(current.sections),
        dto.readingTime ?? current.readingTime,
      );
      contentRaw = serializeBlogContent(next);
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.slug !== undefined ? { slug: slugifyLabel(dto.slug) } : {}),
        ...(dto.excerpt !== undefined ? { excerpt: dto.excerpt.trim() || null } : {}),
        ...(dto.coverImage !== undefined ? { coverImage: dto.coverImage.trim() || null } : {}),
        ...(dto.authorName !== undefined ? { authorName: dto.authorName.trim() } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        content: contentRaw,
        publishedAt,
        categoryId,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });

    return this.toSummary(updated);
  }

  async remove(id: string): Promise<void> {
    await this.requirePost(id);
    await this.prisma.blogPost.update({
      where: { id },
      data: { deletedAt: new Date(), status: BlogPostStatus.ARCHIVED },
    });
  }

  private async requirePost(id: string) {
    const existing = await this.prisma.blogPost.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Blog post not found');
    return existing;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const conflict = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (conflict) throw new ConflictException(`Slug “${slug}” is already in use`);
  }

  private async resolveCategoryId(categoryName?: string | null): Promise<string | null> {
    if (!categoryName?.trim()) return null;
    const name = categoryName.trim();
    const slug = slugifyLabel(name);
    const category = await this.prisma.blogCategory.upsert({
      where: { slug },
      create: { name, slug },
      update: { name },
    });
    return category.id;
  }

  private normalizeContent(
    content: string,
    readingTime?: string,
  ): BlogPostContentPayload {
    const trimmed = content.trim();
    if (!trimmed) {
      throw new BadRequestException('Content is required');
    }

    try {
      const parsed = JSON.parse(trimmed) as BlogPostContentPayload | BlogContentSectionLike[];
      if (Array.isArray(parsed)) {
        return { readingTime, sections: parsed.map(normalizeSection) };
      }
      if (parsed?.sections && Array.isArray(parsed.sections)) {
        return {
          readingTime: readingTime ?? parsed.readingTime,
          sections: parsed.sections.map(normalizeSection),
        };
      }
    } catch {
      // plain text
    }

    const fallback = parseBlogContent(trimmed);
    return { readingTime: readingTime ?? fallback.readingTime, sections: fallback.sections };
  }

  private toSummary(post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    authorName: string;
    status: BlogPostStatus;
    publishedAt: Date | null;
    isFeatured: boolean;
    updatedAt: Date;
    deletedAt: Date | null;
    category: { name: string } | null;
    tags: Array<{ tag: { name: string } }>;
  }): AdminBlogPostSummary {
    const payload = parseBlogContent(post.content);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? undefined,
      coverImage: post.coverImage ?? undefined,
      authorName: post.authorName,
      status: post.status,
      publishedAt: post.publishedAt?.toISOString(),
      categoryName: post.category?.name,
      tags: post.tags.map((row) => row.tag.name),
      readingTime: payload.readingTime,
      isFeatured: post.isFeatured,
      content: payload,
      updatedAt: post.updatedAt.toISOString(),
      deletedAt: post.deletedAt?.toISOString(),
    };
  }
}

type BlogContentSectionLike = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

function normalizeSection(section: BlogContentSectionLike) {
  return {
    heading: (section.heading ?? 'Section').trim() || 'Section',
    paragraphs: Array.isArray(section.paragraphs)
      ? section.paragraphs.map((p) => String(p).trim()).filter(Boolean)
      : [],
    ...(section.bullets?.length
      ? { bullets: section.bullets.map((b) => String(b).trim()).filter(Boolean) }
      : {}),
  };
}
