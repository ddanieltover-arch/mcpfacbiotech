/**
 * Legacy Supabase → MCPFAC BIOTECH schema mapping
 *
 * STEP 1: In Supabase (old project), open Table Editor and note exact table + column names.
 * STEP 2: Update the values below to match your legacy database.
 * STEP 3: Run `pnpm db:migrate-legacy:dry-run` first, then `pnpm db:migrate-legacy`.
 *
 * If you exported CSV/JSON instead of connecting live, place files in:
 *   prisma/migrate-legacy/data/categories.json
 *   prisma/migrate-legacy/data/products.json
 *   prisma/migrate-legacy/data/images.json
 *   prisma/migrate-legacy/data/descriptions.json
 * and set source.mode = 'json' below.
 */

import { loadEnvFiles } from './load-env';

loadEnvFiles();

export type LegacySourceMode = 'database' | 'json';

export const legacyMapping = {
  /** 'database' reads from SOURCE_DATABASE_URL; 'json' reads from prisma/migrate-legacy/data/ */
  source: {
    /** Prefer file import when SOURCE_DATABASE_URL is unavailable */
    mode: (process.env.LEGACY_SOURCE_MODE ?? 'json') as LegacySourceMode,
  },

  /**
   * Legacy table names — matched to the old Supabase public schema:
   * categories, products, images, variants (+ optional description source)
   */
  tables: {
    categories: process.env.LEGACY_TABLE_CATEGORIES ?? 'categories',
    products: process.env.LEGACY_TABLE_PRODUCTS ?? 'products',
    images: process.env.LEGACY_TABLE_IMAGES ?? 'images',
    /** Set to empty string if descriptions live on products (no separate table) */
    descriptions: process.env.LEGACY_TABLE_DESCRIPTIONS ?? '',
    /** Loaded for inspection / future variant migration; not required for base import */
    variants: process.env.LEGACY_TABLE_VARIANTS ?? 'variants',
  },

  /** Column names — matches legacy `categories` table */
  category: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    parentId: 'parent_id',
    sortOrder: 'sort_order',
    /** Legacy schema has no is_visible — importer defaults to true */
    isVisible: undefined as string | undefined,
    imageUrl: 'image_url',
  },

  /** Column names — matches legacy `products` table */
  product: {
    id: 'id',
    /** Legacy has no SKU — importer generates LEGACY-{uuid} */
    sku: undefined as string | undefined,
    name: 'name',
    slug: 'slug',
    categoryId: 'category_id',
    casNumber: 'cas_number',
    molecularFormula: 'molecular_formula',
    molecularWeight: 'molecular_weight',
    purity: undefined as string | undefined,
    sequence: 'sequence',
    storage: undefined as string | undefined,
    solubility: undefined as string | undefined,
    appearance: undefined as string | undefined,
    shortDescription: 'short_desc',
    description: 'description',
    retailPrice: 'base_price',
    wholesalePrice: undefined as string | undefined,
    stockQuantity: 'stock',
    availability: undefined as string | undefined,
    status: undefined as string | undefined,
    /** Maps is_active → isVisible + PUBLISHED/DRAFT */
    isVisible: 'is_active',
    isFeatured: 'is_featured',
    sortOrder: undefined as string | undefined,
    /** Used as fallback primary image when images table has none */
    thumbnailUrl: 'thumbnail_url',
  },

  /** Column names — matches legacy `images` table */
  image: {
    id: 'id',
    productId: 'product_id',
    url: 'url',
    alt: 'alt_text',
    /** Legacy schema has no is_primary — importer picks first by sort_order */
    isPrimary: undefined as string | undefined,
    sortOrder: 'sort_order',
  },

  /**
   * Column names on the legacy product_descriptions table.
   * Descriptions live on products (short_desc / description) — leave table empty.
   */
  description: {
    id: 'id',
    productId: 'product_id',
    shortDescription: 'short_description',
    description: 'description',
    sortOrder: 'sort_order',
    type: 'type',
  },

  /** Column names — matches legacy `variants` table */
  variant: {
    id: 'id',
    productId: 'product_id',
    name: 'name',
    value: 'value',
    priceModifier: 'price_modifier',
    stockQuantity: 'stock',
    sku: 'sku',
  },

  /** Map legacy availability strings to Prisma enum values */
  availabilityMap: {
    in_stock: 'IN_STOCK',
    instock: 'IN_STOCK',
    available: 'IN_STOCK',
    low_stock: 'LOW_STOCK',
    made_to_order: 'MADE_TO_ORDER',
    back_order: 'BACK_ORDER',
    pre_order: 'PRE_ORDER',
    unavailable: 'UNAVAILABLE',
    discontinued: 'DISCONTINUED',
  } as Record<string, string>,

  /** Map legacy status strings to Prisma enum values */
  statusMap: {
    draft: 'DRAFT',
    pending: 'PENDING_REVIEW',
    pending_review: 'PENDING_REVIEW',
    published: 'PUBLISHED',
    active: 'PUBLISHED',
    archived: 'ARCHIVED',
  } as Record<string, string>,

  /**
   * When true, sample/demo products from prisma/seed/products.ts are skipped
   * and only legacy data is kept. When false, legacy products upsert alongside seed data.
   */
  replaceSampleProducts: parseBooleanEnv(process.env.LEGACY_REPLACE_SAMPLE_PRODUCTS, false),
};

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null) return defaultValue;
  return ['true', '1', 'yes'].includes(value.toLowerCase());
}
