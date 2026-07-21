import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mcpfacbiotech.site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/account',
          '/account/',
          '/checkout',
          '/cart',
          '/orders',
          '/quotes',
          '/invoices',
          '/design-system',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
