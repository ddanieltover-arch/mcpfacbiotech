import {
  PrismaClient,
  ProductAvailability,
  ProductStatus,
} from '@prisma/client';
import { loadEnvFiles } from './load-env';
import { legacyMapping } from './mapping';
import { loadLegacyDataset } from './load-source';
import {
  col,
  colOptionalString,
  colString,
  isUuid,
  parseBoolean,
  parsePrice,
  slugify,
} from './utils';

loadEnvFiles();

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
    // Prefer direct connection for bulk import (pooler can starve under many round-trips).
    db: {
      url: withPoolSettings(process.env.DIRECT_URL || process.env.DATABASE_URL),
    },
  },
});

const isDryRun = process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');

type ImportStats = {
  categories: number;
  products: number;
  pivots: number;
  images: number;
  variants: number;
  descriptions: number;
  skipped: number;
};

type ExistingProduct = { id: string; sku: string; slug: string };

function mapAvailability(raw: unknown): ProductAvailability {
  const key = String(raw ?? 'in_stock')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');

  const mapped = legacyMapping.availabilityMap[key];
  return (mapped as ProductAvailability | undefined) ?? ProductAvailability.IN_STOCK;
}

function mapStatus(raw: unknown): ProductStatus {
  const key = String(raw ?? 'published')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');

  const mapped = legacyMapping.statusMap[key];
  return (mapped as ProductStatus | undefined) ?? ProductStatus.PUBLISHED;
}

/** Stable SKU derived from legacy UUID — unique and re-importable. */
function legacySku(legacyId: string): string {
  return `LEGACY-${legacyId}`.slice(0, 100);
}

function slugDerivedSku(baseSlug: string): string {
  return baseSlug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/** In-memory unique slug (no DB round-trip). */
function resolveUniqueProductSlug(
  desiredSlug: string,
  legacyId: string,
  occupiedSlugs: Map<string, string>,
  existingProductId?: string,
): string {
  const base = slugify(desiredSlug) || `product-${legacyId.slice(0, 8)}`;
  const ownerId = occupiedSlugs.get(base);

  if (!ownerId || ownerId === existingProductId) return base;

  const fallback =
    slugify(`${base}-${legacyId.slice(0, 8)}`) || `product-${legacyId}`;
  return fallback.slice(0, 300);
}

function findExistingProduct(
  bySku: Map<string, ExistingProduct>,
  bySlug: Map<string, ExistingProduct>,
  sku: string,
  baseSlug: string,
): ExistingProduct | undefined {
  return (
    bySku.get(sku) ??
    bySlug.get(baseSlug) ??
    bySku.get(slugDerivedSku(baseSlug))
  );
}

async function main() {
  const stats: ImportStats = {
    categories: 0,
    products: 0,
    pivots: 0,
    images: 0,
    variants: 0,
    descriptions: 0,
    skipped: 0,
  };

  console.log(
    isDryRun
      ? '\n*** DRY RUN — no writes will be committed ***\n'
      : '\nStarting legacy product import...\n',
  );

  const dataset = await loadLegacyDataset();
  console.log(
    `Loaded: ${dataset.categories.length} categories, ${dataset.products.length} products, ${dataset.images.length} images, ${dataset.descriptions.length} descriptions, ${dataset.variants?.length ?? 0} variants\n`,
  );

  if ((dataset.variants?.length ?? 0) > 0) {
    console.log(
      'Note: variants table has rows. Base import creates one product per products row.\n' +
        '      Variant → packaging/size mapping can be added once we inspect column names.\n',
    );
  }

  const categoryIdMap = new Map<string, string>();
  const productIdMap = new Map<string, string>();

  if (legacyMapping.replaceSampleProducts && !isDryRun) {
    console.log('Removing sample seeded products (LEGACY_REPLACE_SAMPLE_PRODUCTS=true)...');
    await prisma.product.deleteMany({
      where: {
        sku: {
          startsWith: 'MBT-',
        },
      },
    });
  }

  // ── 1. Categories ──────────────────────────────────────────────────────────
  console.log('Importing categories...');
  for (const row of dataset.categories) {
    const legacyId = colString(row, legacyMapping.category.id);
    const name = colString(row, legacyMapping.category.name);

    if (!legacyId || !name || !isUuid(legacyId)) {
      stats.skipped += 1;
      continue;
    }

    const slug =
      slugify(colOptionalString(row, legacyMapping.category.slug) ?? name) ||
      `category-${legacyId.slice(0, 8)}`;

    if (isDryRun) {
      categoryIdMap.set(legacyId, legacyId);
      stats.categories += 1;
      continue;
    }

    const parentLegacyId = colOptionalString(row, legacyMapping.category.parentId);
    const parentId =
      parentLegacyId && isUuid(parentLegacyId)
        ? categoryIdMap.get(parentLegacyId)
        : undefined;

    const category = await prisma.category.upsert({
      where: { slug },
      create: {
        name,
        slug,
        description: colOptionalString(row, legacyMapping.category.description),
        imageUrl: colOptionalString(row, legacyMapping.category.imageUrl),
        parentId,
        sortOrder: Number(col(row, legacyMapping.category.sortOrder) ?? 0),
        isVisible: parseBoolean(col(row, legacyMapping.category.isVisible), true),
      },
      update: {
        name,
        description: colOptionalString(row, legacyMapping.category.description),
        imageUrl: colOptionalString(row, legacyMapping.category.imageUrl),
        parentId,
        sortOrder: Number(col(row, legacyMapping.category.sortOrder) ?? 0),
        isVisible: parseBoolean(col(row, legacyMapping.category.isVisible), true),
        deletedAt: null,
      },
    });

    categoryIdMap.set(legacyId, category.id);
    stats.categories += 1;
  }

  // ── 2. Products ────────────────────────────────────────────────────────────
  console.log('Importing products...');

  const existingProducts = isDryRun
    ? []
    : await prisma.product.findMany({ select: { id: true, sku: true, slug: true } });

  const bySku = new Map(existingProducts.map((p) => [p.sku, p]));
  const bySlug = new Map(existingProducts.map((p) => [p.slug, p]));
  const occupiedSlugs = new Map(existingProducts.map((p) => [p.slug, p.id]));

  // Precompute which products already have image rows (for thumbnail fallback)
  const imageProductIds = new Set(
    dataset.images
      .map((image) => colString(image, legacyMapping.image.productId))
      .filter((id) => isUuid(id)),
  );

  for (const row of dataset.products) {
    const legacyId = colString(row, legacyMapping.product.id);
    const name = colString(row, legacyMapping.product.name);

    // Skip malformed CSV fragments (e.g. multiline description lines mis-parsed as rows)
    if (!legacyId || !name || !isUuid(legacyId)) {
      stats.skipped += 1;
      continue;
    }

    const desiredSlug = colOptionalString(row, legacyMapping.product.slug) ?? name;
    const sku =
      colOptionalString(row, legacyMapping.product.sku) ?? legacySku(legacyId);
    const isActive = parseBoolean(col(row, legacyMapping.product.isVisible), true);
    const stockQuantity = Number(col(row, legacyMapping.product.stockQuantity) ?? 0);
    const status =
      legacyMapping.product.status != null
        ? mapStatus(col(row, legacyMapping.product.status))
        : isActive
          ? ProductStatus.PUBLISHED
          : ProductStatus.DRAFT;
    const availability =
      legacyMapping.product.availability != null
        ? mapAvailability(col(row, legacyMapping.product.availability))
        : stockQuantity <= 0
          ? ProductAvailability.UNAVAILABLE
          : stockQuantity <= 10
            ? ProductAvailability.LOW_STOCK
            : ProductAvailability.IN_STOCK;

    if (isDryRun) {
      productIdMap.set(legacyId, legacyId);
      stats.products += 1;
      continue;
    }

    const productData = {
      sku,
      name,
      casNumber: colOptionalString(row, legacyMapping.product.casNumber),
      molecularFormula: colOptionalString(row, legacyMapping.product.molecularFormula),
      molecularWeight: colOptionalString(row, legacyMapping.product.molecularWeight),
      purity: colOptionalString(row, legacyMapping.product.purity),
      sequence: colOptionalString(row, legacyMapping.product.sequence),
      storage: colOptionalString(row, legacyMapping.product.storage),
      solubility: colOptionalString(row, legacyMapping.product.solubility),
      appearance: colOptionalString(row, legacyMapping.product.appearance),
      shortDescription: colOptionalString(row, legacyMapping.product.shortDescription),
      description: colOptionalString(row, legacyMapping.product.description),
      retailPrice: parsePrice(col(row, legacyMapping.product.retailPrice)),
      wholesalePrice: parsePrice(col(row, legacyMapping.product.wholesalePrice)),
      stockQuantity,
      availability,
      status,
      isVisible: isActive,
      isFeatured: parseBoolean(col(row, legacyMapping.product.isFeatured), false),
      sortOrder: Number(col(row, legacyMapping.product.sortOrder) ?? 0),
      deletedAt: null,
    };

    const baseSlug = slugify(desiredSlug) || `product-${legacyId.slice(0, 8)}`;
    const existing = findExistingProduct(bySku, bySlug, sku, baseSlug);
    const slug = resolveUniqueProductSlug(
      desiredSlug,
      legacyId,
      occupiedSlugs,
      existing?.id,
    );

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: { ...productData, slug },
        })
      : await prisma.product.create({
          data: { ...productData, slug },
        });

    // Keep in-memory indexes in sync for later rows in this run
    if (existing) {
      bySku.delete(existing.sku);
      bySlug.delete(existing.slug);
      occupiedSlugs.delete(existing.slug);
    }
    bySku.set(product.sku, product);
    bySlug.set(product.slug, product);
    occupiedSlugs.set(product.slug, product.id);

    productIdMap.set(legacyId, product.id);

    const legacyCategoryId = colOptionalString(row, legacyMapping.product.categoryId);
    if (legacyCategoryId && isUuid(legacyCategoryId)) {
      const categoryId = categoryIdMap.get(legacyCategoryId);
      if (categoryId) {
        await prisma.productCategoryPivot.upsert({
          where: {
            productId_categoryId: {
              productId: product.id,
              categoryId,
            },
          },
          create: {
            productId: product.id,
            categoryId,
          },
          update: {},
        });
        stats.pivots += 1;
      }
    }

    // Fallback thumbnail when images table has no rows for this product
    const thumbnailUrl = colOptionalString(row, legacyMapping.product.thumbnailUrl);
    if (thumbnailUrl && !imageProductIds.has(legacyId)) {
      const existingThumb = await prisma.productImage.findFirst({
        where: { productId: product.id, url: thumbnailUrl },
        select: { id: true },
      });

      if (!existingThumb) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: thumbnailUrl,
            alt: name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
        stats.images += 1;
      }
    }

    stats.products += 1;
    if (stats.products % 25 === 0) {
      console.log(`  … ${stats.products}/${dataset.products.length} products`);
    }
  }

  // ── 3. Images ──────────────────────────────────────────────────────────────
  console.log('Importing images...');

  const existingImages = isDryRun
    ? []
    : await prisma.productImage.findMany({
        select: { id: true, productId: true, url: true },
      });
  const imageByProductUrl = new Map(
    existingImages.map((image) => [`${image.productId}::${image.url}`, image]),
  );

  for (const row of dataset.images) {
    const legacyProductId = colString(row, legacyMapping.image.productId);
    const url = colOptionalString(row, legacyMapping.image.url);

    const productId = productIdMap.get(legacyProductId);
    if (!productId || !url || !isUuid(legacyProductId)) {
      stats.skipped += 1;
      continue;
    }

    if (isDryRun) {
      stats.images += 1;
      continue;
    }

    const isPrimary = parseBoolean(col(row, legacyMapping.image.isPrimary), false);
    const sortOrder = Number(col(row, legacyMapping.image.sortOrder) ?? 0);
    const alt = colString(row, legacyMapping.image.alt, 'Product image');
    const key = `${productId}::${url}`;
    const existing = imageByProductUrl.get(key);

    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { alt, isPrimary, sortOrder },
      });
    } else {
      const created = await prisma.productImage.create({
        data: {
          productId,
          url,
          alt,
          isPrimary,
          sortOrder,
        },
      });
      imageByProductUrl.set(key, created);
    }

    stats.images += 1;
    if (stats.images % 50 === 0) {
      console.log(`  … ${stats.images} images`);
    }
  }

  // Ensure one primary image per product when none flagged
  if (!isDryRun) {
    const productsWithImages = await prisma.product.findMany({
      where: { images: { some: {} } },
      include: { images: { orderBy: { sortOrder: 'asc' }, select: { id: true, isPrimary: true } } },
    });

    for (const product of productsWithImages) {
      if (!product.images.some((image) => image.isPrimary) && product.images[0]) {
        await prisma.productImage.update({
          where: { id: product.images[0].id },
          data: { isPrimary: true },
        });
      }
    }
  }

  // ── 4. Variants ────────────────────────────────────────────────────────────
  console.log('Importing variants...');
  for (const [index, row] of (dataset.variants ?? []).entries()) {
    const legacyProductId = colString(row, legacyMapping.variant.productId);
    const name = colString(row, legacyMapping.variant.name);
    const value = colString(row, legacyMapping.variant.value);
    const productId = productIdMap.get(legacyProductId);

    if (!productId || !name || !value || !isUuid(legacyProductId)) {
      stats.skipped += 1;
      continue;
    }

    if (isDryRun) {
      stats.variants += 1;
      continue;
    }

    const priceModifier = parsePrice(col(row, legacyMapping.variant.priceModifier)) ?? 0;
    const stockQuantity = Number(col(row, legacyMapping.variant.stockQuantity) ?? 0);
    const sku = colOptionalString(row, legacyMapping.variant.sku);

    await prisma.productVariant.upsert({
      where: {
        productId_name_value: {
          productId,
          name,
          value,
        },
      },
      create: {
        productId,
        name,
        value,
        priceModifier,
        stockQuantity,
        sku,
        sortOrder: index,
        isDefault: index === 0,
      },
      update: {
        priceModifier,
        stockQuantity,
        sku,
        sortOrder: index,
      },
    });

    stats.variants += 1;
    if (stats.variants % 50 === 0) {
      console.log(`  … ${stats.variants} variants`);
    }
  }

  // ── 5. Descriptions (separate table — usually empty for this legacy DB) ─────
  const descriptionsByProduct = new Map<
    string,
    { shortDescription?: string; description?: string }
  >();

  const sortedDescriptions = [...dataset.descriptions].sort((a, b) => {
    const sortA = Number(col(a, legacyMapping.description.sortOrder) ?? 0);
    const sortB = Number(col(b, legacyMapping.description.sortOrder) ?? 0);
    return sortA - sortB;
  });

  for (const row of sortedDescriptions) {
    const legacyProductId = colString(row, legacyMapping.description.productId);
    if (!legacyProductId || !isUuid(legacyProductId)) {
      stats.skipped += 1;
      continue;
    }

    const type = colOptionalString(row, legacyMapping.description.type)?.toLowerCase();
    const shortText = colOptionalString(row, legacyMapping.description.shortDescription);
    const longText = colOptionalString(row, legacyMapping.description.description);

    const current = descriptionsByProduct.get(legacyProductId) ?? {};

    if (type === 'short' && shortText) {
      current.shortDescription = shortText;
    } else if (type === 'long' && longText) {
      current.description = longText;
    } else {
      if (shortText && !current.shortDescription) current.shortDescription = shortText;
      if (longText) {
        current.description = current.description
          ? `${current.description}\n\n${longText}`
          : longText;
      }
    }

    descriptionsByProduct.set(legacyProductId, current);
  }

  for (const [legacyProductId, texts] of descriptionsByProduct.entries()) {
    const productId = productIdMap.get(legacyProductId);
    if (!productId || (!texts.shortDescription && !texts.description)) {
      stats.skipped += 1;
      continue;
    }

    if (isDryRun) {
      stats.descriptions += 1;
      continue;
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        ...(texts.shortDescription ? { shortDescription: texts.shortDescription } : {}),
        ...(texts.description ? { description: texts.description } : {}),
      },
    });

    stats.descriptions += 1;
  }

  console.log('\nImport summary');
  console.log('────────────────');
  console.log(`Categories:   ${stats.categories}`);
  console.log(`Products:     ${stats.products}`);
  console.log(`Pivots:       ${stats.pivots}`);
  console.log(`Images:       ${stats.images}`);
  console.log(`Variants:     ${stats.variants}`);
  console.log(`Descriptions: ${stats.descriptions}`);
  console.log(`Skipped:      ${stats.skipped}`);

  if (isDryRun) {
    console.log('\nDry run complete. Re-run without DRY_RUN=true to write data.');
  } else {
    console.log('\nLegacy import completed successfully.');
  }
}

main()
  .catch((error) => {
    console.error('\nLegacy import failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
