/**
 * Sync product retailPrice + variants from https://www.ph-research.store
 * Matches our catalog (same legacy product IDs / slugs).
 *
 * Usage:
 *   npx ts-node --project prisma/tsconfig.seed.json --transpile-only prisma/sync-ph-research-prices.ts
 *   npx ts-node ... prisma/sync-ph-research-prices.ts --dry-run
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loadEnvFiles } from './migrate-legacy/load-env';
import { isRedundantAggregateVariantValue } from './migrate-legacy/utils';

loadEnvFiles();

const BASE = 'https://www.ph-research.store';
const PAGES = 8;
const isDryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');

type PhVariant = {
  id?: string;
  name: string;
  value: string;
  priceModifier: number;
  stock?: number;
  sku?: string | null;
};

type PhProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number | null;
  stock?: number;
  variants: PhVariant[];
};

function withPoolSettings(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '5');
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '60');
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: withPoolSettings(process.env.DIRECT_URL || process.env.DATABASE_URL),
    },
  },
});

/** Decode Next.js flight-data escapes inside __next_f.push payloads. */
function decodeFlightChunk(raw: string): string {
  return raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

/** Normalize multiplication / dash glyphs so variant values match DB. */
function normalizeValue(value: string): string {
  return value
    .replace(/\u00d7/g, '×') // ×
    .replace(/Ã—/g, '×')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSku(sku: unknown): string | null {
  if (sku == null) return null;
  const s = String(sku).trim();
  if (!s || s === 'undefined' || s === 'null' || s === '$undefined') return null;
  return s.slice(0, 100);
}

function toNumber(v: unknown): number | null {
  if (v == null || v === '$undefined' || v === 'undefined') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Extract a balanced `{...}` object starting at `start` (must point at `{`). */
function extractBalancedObject(source: string, start: number): string | null {
  if (source[start] !== '{') return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Extract product objects from RSC HTML. Products appear as
 * {"product":{...}} on listing pages and {"initialProduct":{...}} on detail pages.
 */
function extractProductsFromHtml(html: string): PhProduct[] {
  const products = new Map<string, PhProduct>();
  const pushRe = /self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/g;
  let m: RegExpExecArray | null;
  const decodedParts: string[] = [];

  while ((m = pushRe.exec(html)) !== null) {
    decodedParts.push(decodeFlightChunk(m[1]));
  }
  const blob = decodedParts.join('\n');

  const tryParse = (jsonLike: string): void => {
    try {
      // Flight data uses $undefined which is not valid JSON
      const cleaned = jsonLike
        .replace(/\$undefined/g, 'null')
        .replace(/:\s*undefined\b/g, ':null');
      const obj = JSON.parse(cleaned) as Record<string, unknown>;
      if (!obj || typeof obj !== 'object') return;
      const id = String(obj.id ?? '');
      const slug = String(obj.slug ?? '');
      const name = String(obj.name ?? '');
      if (!id || !slug || !name) return;
      if (!('basePrice' in obj) && !('variants' in obj)) return;

      const rawVariants = Array.isArray(obj.variants) ? obj.variants : [];
      const variants: PhVariant[] = rawVariants
        .map((v) => {
          const row = v as Record<string, unknown>;
          return {
            id: row.id ? String(row.id) : undefined,
            name: String(row.name ?? 'Option').trim() || 'Option',
            value: normalizeValue(String(row.value ?? '')),
            priceModifier: toNumber(row.priceModifier) ?? 0,
            stock: toNumber(row.stock) ?? undefined,
            sku: normalizeSku(row.sku),
          };
        })
        .filter((v) => v.value.length > 0);

      products.set(slug, {
        id,
        name,
        slug,
        basePrice: toNumber(obj.basePrice),
        stock: toNumber(obj.stock) ?? undefined,
        variants,
      });
    } catch {
      // ignore partial matches
    }
  };

  for (const key of ['"product":', '"initialProduct":'] as const) {
    let from = 0;
    while (from < blob.length) {
      const idx = blob.indexOf(key, from);
      if (idx < 0) break;
      const objStart = idx + key.length;
      const json = extractBalancedObject(blob, objStart);
      if (json) tryParse(json);
      from = objStart + 1;
    }
  }

  return [...products.values()];
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; MCPFAC-price-sync/1.0; +https://localhost)',
      accept: 'text/html',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.text();
}

function collectSlugsFromHtml(html: string): string[] {
  const slugs = new Set<string>();
  const re = /\/products\/([a-z0-9][a-z0-9\-]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const slug = m[1];
    if (slug !== 'page') slugs.add(slug);
  }
  return [...slugs];
}

/** Drop legacy aggregate rows like "5mg, 10mg" when individual siblings exist. */
function filterAggregateVariants(variants: PhVariant[]): PhVariant[] {
  const siblingValues = variants.map((v) => v.value);
  return variants.filter(
    (v) => !isRedundantAggregateVariantValue(v.value, siblingValues),
  );
}

async function scrapeCatalog(): Promise<PhProduct[]> {
  const bySlug = new Map<string, PhProduct>();
  const allSlugs = new Set<string>();

  for (let page = 1; page <= PAGES; page += 1) {
    const url = page <= 1 ? `${BASE}/products` : `${BASE}/products?page=${page}`;
    process.stdout.write(`Scraping listing page ${page}/${PAGES}… `);
    const html = await fetchHtml(url);
    for (const slug of collectSlugsFromHtml(html)) allSlugs.add(slug);
    const found = extractProductsFromHtml(html);
    for (const p of found) {
      p.variants = filterAggregateVariants(p.variants);
      bySlug.set(p.slug, p);
    }
    console.log(
      `${found.length} products (unique: ${bySlug.size}, link-slugs: ${allSlugs.size})`,
    );
    await new Promise((r) => setTimeout(r, 350));
  }

  const missing = [...allSlugs].filter((slug) => !bySlug.has(slug)).sort();
  if (missing.length > 0) {
    console.log(
      `\nFetching ${missing.length} product detail pages missing from listing payloads…`,
    );
    for (const [i, slug] of missing.entries()) {
      process.stdout.write(`  [${i + 1}/${missing.length}] ${slug}… `);
      try {
        const html = await fetchHtml(`${BASE}/products/${slug}`);
        const found = extractProductsFromHtml(html);
        const match = found.find((p) => p.slug === slug) ?? found[0];
        if (match) {
          match.variants = filterAggregateVariants(match.variants);
          bySlug.set(match.slug, match);
          console.log(
            `ok ($${match.basePrice ?? '?'}, ${match.variants.length} variants)`,
          );
        } else {
          console.log('no product payload');
        }
      } catch (err) {
        console.log(`fail: ${(err as Error).message}`);
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

function pricesEqual(a: number | null | undefined, b: number | null | undefined): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Math.abs(Number(a) - Number(b)) < 0.005;
}

async function main() {
  console.log(isDryRun ? 'DRY RUN — no DB writes\n' : 'LIVE — updating database\n');

  const catalog = await scrapeCatalog();
  console.log(`\nScraped ${catalog.length} unique products from PH Research\n`);

  const outPath = resolve(process.cwd(), 'prisma/_ph_research_catalog.json');
  writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Wrote snapshot → ${outPath}\n`);

  if (catalog.length < 200) {
    throw new Error(
      `Expected ~234 products, got ${catalog.length}. Aborting — parser likely failed.`,
    );
  }

  const ourProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      retailPrice: true,
      stockQuantity: true,
      variants: {
        select: {
          id: true,
          name: true,
          value: true,
          priceModifier: true,
          stockQuantity: true,
          sku: true,
          sortOrder: true,
        },
      },
    },
  });

  const bySlug = new Map(ourProducts.map((p) => [p.slug, p]));
  const byId = new Map(ourProducts.map((p) => [p.id, p]));

  let matched = 0;
  let priceUpdates = 0;
  let variantUpdates = 0;
  let missingLocal = 0;
  const report: Array<Record<string, unknown>> = [];

  for (const ph of catalog) {
    const local = byId.get(ph.id) ?? bySlug.get(ph.slug);
    if (!local) {
      missingLocal += 1;
      report.push({
        slug: ph.slug,
        status: 'missing_locally',
        phBasePrice: ph.basePrice,
        phVariants: ph.variants.length,
      });
      continue;
    }
    matched += 1;

    const currentRetail = local.retailPrice != null ? Number(local.retailPrice) : null;
    const nextRetail = ph.basePrice;
    const priceChanged = !pricesEqual(currentRetail, nextRetail);

    // Build desired variants (skip empty + aggregate junk rows)
    const desired = filterAggregateVariants(ph.variants).map((v, index) => ({
      name: v.name.trim() || 'Option',
      value: normalizeValue(v.value),
      priceModifier: v.priceModifier,
      stockQuantity: v.stock ?? local.stockQuantity ?? 0,
      sku: normalizeSku(v.sku),
      sortOrder: index,
      isDefault: index === 0,
    }));

    const currentVariants = local.variants.filter(
      (v) =>
        !isRedundantAggregateVariantValue(
          v.value,
          local.variants.map((x) => x.value),
        ),
    );

    const currentKey = (v: {
      name: string;
      value: string;
      priceModifier: unknown;
      sku?: string | null;
    }) =>
      `${v.name}||${normalizeValue(v.value)}||${Number(v.priceModifier)}||${normalizeSku(v.sku) ?? ''}`;

    const currentSig = currentVariants.map(currentKey).sort().join(';;');
    const desiredSig = desired
      .map((v) => `${v.name}||${v.value}||${v.priceModifier}||${v.sku ?? ''}`)
      .sort()
      .join(';;');
    const variantsChanged = currentSig !== desiredSig;

    if (!priceChanged && !variantsChanged) {
      continue;
    }

    report.push({
      slug: local.slug,
      name: local.name,
      price: priceChanged
        ? { from: currentRetail, to: nextRetail }
        : undefined,
      variants: variantsChanged
        ? {
            from: currentVariants.map((v) => ({
              name: v.name,
              value: v.value,
              mod: Number(v.priceModifier),
              sku: v.sku,
            })),
            to: desired.map((v) => ({
              name: v.name,
              value: v.value,
              mod: v.priceModifier,
              sku: v.sku,
            })),
          }
        : undefined,
    });

    if (isDryRun) {
      if (priceChanged) priceUpdates += 1;
      if (variantsChanged) variantUpdates += 1;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      if (priceChanged) {
        await tx.product.update({
          where: { id: local.id },
          data: { retailPrice: nextRetail },
        });
        priceUpdates += 1;
      }

      if (variantsChanged) {
        // Replace variants for this product to exactly match PH Research.
        // Cart items referencing old variants will cascade-null/delete per schema —
        // product_variants are onDelete Cascade from product, cart_items reference variant.
        await tx.productVariant.deleteMany({ where: { productId: local.id } });
        if (desired.length > 0) {
          await tx.productVariant.createMany({
            data: desired.map((v) => ({
              productId: local.id,
              name: v.name,
              value: v.value,
              priceModifier: v.priceModifier,
              stockQuantity: v.stockQuantity,
              sku: v.sku,
              sortOrder: v.sortOrder,
              isDefault: v.isDefault,
            })),
          });
        }
        variantUpdates += 1;
      }
    });
  }

  const reportPath = resolve(process.cwd(), 'prisma/_ph_research_sync_report.json');
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        scraped: catalog.length,
        matched,
        missingLocal,
        priceUpdates,
        variantUpdates,
        dryRun: isDryRun,
        changes: report.filter((r) => r.status !== 'missing_locally' || true),
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log('── Summary ─────────────────────────────────');
  console.log(`  Scraped:          ${catalog.length}`);
  console.log(`  Matched locally:  ${matched}`);
  console.log(`  Missing locally:  ${missingLocal}`);
  console.log(`  Price updates:    ${priceUpdates}`);
  console.log(`  Variant updates:  ${variantUpdates}`);
  console.log(`  Report → ${reportPath}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
