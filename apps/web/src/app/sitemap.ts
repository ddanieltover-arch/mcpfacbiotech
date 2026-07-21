import type { MetadataRoute } from 'next';
import { getAllBlogSlugs } from '@/lib/blog-posts';
import { getAllResearchSlugs } from '@/lib/research-articles';

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mcpfacbiotech.site';

const STATIC_ROUTES = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/research',
  '/blog',
  '/faq',
  '/coa',
  '/calculator',
  '/quality',
  '/shipping',
  '/downloads',
  '/solutions',
  '/solutions/universities',
  '/solutions/research-labs',
  '/solutions/pharmaceutical',
  '/solutions/distributors',
  '/careers',
  '/support',
  '/terms',
  '/privacy',
  '/returns',
  '/cookies',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE}${path === '/' ? '' : path}`,
    lastModified: now,
    changeFrequency: path === '/' || path === '/products' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/products' ? 0.9 : 0.7,
  }));

  const researchEntries: MetadataRoute.Sitemap = getAllResearchSlugs().map((slug) => ({
    url: `${SITE}/research/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${SITE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticEntries, ...researchEntries, ...blogEntries];
}
