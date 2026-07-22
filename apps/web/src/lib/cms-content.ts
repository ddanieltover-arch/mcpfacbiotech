import type { BlogPostDetail, BlogPostSummary, FaqItem } from '@mcpfac/shared-types';
import { BLOG_POSTS, type BlogPost } from '@/lib/blog-posts';
import { FAQ_ITEMS } from '@/lib/marketing-content';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

function staticToSummary(post: BlogPost, index: number): BlogPostSummary {
  return {
    id: `static-${post.slug}`,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    authorName: 'MCPFAC BIOTECH',
    publishedAt: post.publishedAt,
    categoryName: post.category,
    tags: [],
    readingTime: post.readingTime,
    isFeatured: index === 0,
  };
}

function staticToDetail(post: BlogPost): BlogPostDetail {
  return {
    ...staticToSummary(post, 0),
    status: 'PUBLISHED',
    content: { readingTime: post.readingTime, sections: post.sections },
    updatedAt: post.publishedAt,
  };
}

export async function fetchPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/blog`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error(`Blog list failed: ${response.status}`);
    const body = (await response.json()) as { data?: BlogPostSummary[] };
    if (body.data?.length) return body.data;
  } catch {
    // fall back to static seed
  }
  return BLOG_POSTS.map(staticToSummary);
}

export async function fetchPublishedBlogPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const body = (await response.json()) as { data?: BlogPostDetail };
      if (body.data) return body.data;
    }
  } catch {
    // fall back
  }
  const staticPost = BLOG_POSTS.find((post) => post.slug === slug);
  return staticPost ? staticToDetail(staticPost) : null;
}

export async function fetchFaqItems(): Promise<FaqItem[]> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/faq`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error(`FAQ failed: ${response.status}`);
    const body = (await response.json()) as { data?: FaqItem[] };
    if (body.data?.length) return body.data;
  } catch {
    // fall back
  }
  return FAQ_ITEMS.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));
}
