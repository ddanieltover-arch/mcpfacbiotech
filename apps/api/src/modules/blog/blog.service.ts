import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogPostStatus } from '@prisma/client';
import type { BlogPostDetail, BlogPostSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { parseBlogContent } from '@/modules/admin/blog-content.util';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(): Promise<BlogPostSummary[]> {
    const rows = await this.prisma.blogPost.findMany({
      where: {
        deletedAt: null,
        status: BlogPostStatus.PUBLISHED,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map((row) => this.toSummary(row));
  }

  async getPublishedBySlug(slug: string): Promise<BlogPostDetail> {
    const row = await this.prisma.blogPost.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: BlogPostStatus.PUBLISHED,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
    if (!row) throw new NotFoundException('Blog post not found');
    return this.toDetail(row);
  }

  private toSummary(post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    authorName: string;
    publishedAt: Date | null;
    isFeatured: boolean;
    category: { name: string } | null;
    tags: Array<{ tag: { name: string } }>;
  }): BlogPostSummary {
    const payload = parseBlogContent(post.content);
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? undefined,
      coverImage: post.coverImage ?? undefined,
      authorName: post.authorName,
      publishedAt: post.publishedAt?.toISOString(),
      categoryName: post.category?.name,
      tags: post.tags.map((t) => t.tag.name),
      readingTime: payload.readingTime,
      isFeatured: post.isFeatured,
    };
  }

  private toDetail(post: {
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
    category: { name: string } | null;
    tags: Array<{ tag: { name: string } }>;
  }): BlogPostDetail {
    const payload = parseBlogContent(post.content);
    return {
      ...this.toSummary(post),
      status: post.status,
      content: payload,
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
