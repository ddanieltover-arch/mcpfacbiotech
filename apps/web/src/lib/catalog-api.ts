import type {
  ApiPaginatedResponse,
  ApiResponse,
  Category,
  ProductDetail,
  ProductSummary,
} from '@mcpfac/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

type QueryValue = string | number | boolean | undefined;

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  const url = new URL(`/api/v1${path}`, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function fetchJson<T>(url: string, cache = true): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, cache ? { next: { revalidate: 60 } } : undefined);
  } catch {
    throw new Error(
      `Catalog API is unavailable at ${API_BASE_URL}. Start the backend with "pnpm dev" from the repo root.`,
    );
  }

  if (!response.ok) {
    throw new Error(`Catalog API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

const EMPTY_CATALOG = {
  items: [] as ProductSummary[],
  total: 0,
  page: 1,
  limit: 30,
  totalPages: 0,
};

export const PRODUCTS_PAGE_SIZE = 30;

export type ProductListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  purity?: string;
  availability?: string;
  priceMin?: number;
  priceMax?: number;
  featured?: boolean;
  sort?: string;
  direction?: 'asc' | 'desc';
};

export async function getProducts(params: ProductListParams = {}, options?: { cache?: boolean }) {
  try {
    const response = await fetchJson<ApiPaginatedResponse<ProductSummary>>(
      buildUrl('/products', { limit: PRODUCTS_PAGE_SIZE, ...params }),
      options?.cache ?? true,
    );

    const data = response.data;
    const items = await enrichSummariesWithVariants(data.items ?? [], options?.cache ?? true);
    // #region agent log
    fetch('http://127.0.0.1:7267/ingest/55f7ba81-d8d9-4dd4-98b1-67ce1d44203b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c73b1e'},body:JSON.stringify({sessionId:'c73b1e',runId:'pre-fix',hypothesisId:'A',location:'catalog-api.ts:getProducts',message:'Product list after enrich',data:{apiBase:API_BASE_URL,rawHadVariants:(data.items??[]).filter((i)=>Boolean(i.variants?.length)).length,enrichedWithVariants:items.filter((i)=>Boolean(i.variants?.length)).length,sample:items.slice(0,3).map((i)=>({name:i.name,hasVariants:i.hasVariants,variantCount:i.variants?.length??0,priceMin:i.priceMin,priceMax:i.priceMax}))},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return { ...data, items };
  } catch {
    return { ...EMPTY_CATALOG, limit: params.limit ?? EMPTY_CATALOG.limit };
  }
}

export async function getFeaturedProducts(limit = 6) {
  const response = await fetchJson<ApiResponse<ProductSummary[]>>(
    buildUrl('/products/featured'),
  );

  const items = await enrichSummariesWithVariants(response.data.slice(0, limit), true);
  // #region agent log
  fetch('http://127.0.0.1:7267/ingest/55f7ba81-d8d9-4dd4-98b1-67ce1d44203b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c73b1e'},body:JSON.stringify({sessionId:'c73b1e',runId:'pre-fix',hypothesisId:'A',location:'catalog-api.ts:getFeaturedProducts',message:'Featured list after enrich',data:{count:items.length,withVariants:items.filter((i)=>Boolean(i.variants?.length)).length,sample:items.slice(0,3).map((i)=>({name:i.name,variantCount:i.variants?.length??0}))},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return items;
}

/**
 * Production API may still omit summary.variants while detail returns them.
 * Bridge: hydrate missing variants from /products/:slug (cached).
 */
async function enrichSummariesWithVariants(
  items: ProductSummary[],
  cache = true,
): Promise<ProductSummary[]> {
  const missing = items.filter((item) => !item.variants?.length);
  if (missing.length === 0) {
    return items;
  }

  // #region agent log
  fetch('http://127.0.0.1:7267/ingest/55f7ba81-d8d9-4dd4-98b1-67ce1d44203b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c73b1e'},body:JSON.stringify({sessionId:'c73b1e',runId:'pre-fix',hypothesisId:'A',location:'catalog-api.ts:enrichSummariesWithVariants',message:'List missing variants; hydrating from detail',data:{total:items.length,missing:missing.length,slugs:missing.slice(0,8).map((i)=>i.slug)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const details = await Promise.all(
    missing.map(async (item) => {
      try {
        const response = await fetchJson<ApiResponse<ProductDetail>>(
          buildUrl(`/products/${item.slug}`),
          cache,
        );
        return response.data;
      } catch {
        return null;
      }
    }),
  );

  const byId = new Map(
    details.filter((detail): detail is ProductDetail => Boolean(detail)).map((detail) => [detail.id, detail]),
  );

  return items.map((item) => {
    if (item.variants?.length) {
      return item;
    }
    const detail = byId.get(item.id);
    if (!detail?.variants?.length) {
      return item;
    }

    const sorted = [...detail.variants].sort(
      (a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY),
    );
    const prices = sorted
      .map((variant) => variant.price)
      .filter((price): price is number => price != null && Number.isFinite(price));
    const priceMin = prices.length ? Math.min(...prices) : item.price;
    const priceMax = prices.length ? Math.max(...prices) : item.price;

    return {
      ...item,
      price: priceMin ?? item.price,
      priceMin,
      priceMax,
      hasVariants: true,
      variants: sorted.map((variant) => ({
        id: variant.id,
        name: variant.name,
        value: variant.value,
        price: variant.price,
        isDefault: variant.isDefault,
      })),
    };
  });
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const response = await fetchJson<ApiResponse<ProductDetail>>(buildUrl(`/products/${slug}`));
    return response.data;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetchJson<ApiResponse<Category[]>>(buildUrl('/categories'));
    return response.data ?? [];
  } catch {
    return [];
  }
}

/** Visible catalog categories with at least one published product (excludes empty seed stubs). */
export type CategoryOption = {
  slug: string;
  label: string;
  description?: string;
  productCount: number;
};

export function toCategoryOptions(categories: Category[]): CategoryOption[] {
  const flattened = flattenCategories(categories);

  return flattened
    .filter((category) => category.isVisible && (category.productCount ?? 0) > 0)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        (b.productCount ?? 0) - (a.productCount ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .map((category) => ({
      slug: category.slug,
      label: category.name,
      description: category.description,
      productCount: category.productCount ?? 0,
    }));
}

function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = [];

  for (const category of categories) {
    result.push(category);
    if (category.children?.length) {
      result.push(...flattenCategories(category.children));
    }
  }

  return result;
}

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  return toCategoryOptions(await getCategories());
}

export async function suggestProducts(query: string, limit = 8): Promise<ProductSummary[]> {
  const response = await fetchJson<ApiResponse<ProductSummary[]>>(
    buildUrl('/products/search/suggest', { q: query, limit }),
    false,
  );

  return response.data;
}

export async function getProductsByIds(ids: string[]): Promise<ProductSummary[]> {
  if (ids.length === 0) return [];

  const response = await fetchJson<ApiResponse<ProductSummary[]>>(
    buildUrl('/products/batch', { ids: ids.join(',') }),
    false,
  );

  return enrichSummariesWithVariants(response.data, false);
}

/** @deprecated Use getCategoryOptions() — hardcoded seeds had 0 products in live DB. */
export const CATEGORY_OPTIONS: CategoryOption[] = [];

export const AVAILABILITY_OPTIONS = [
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'MADE_TO_ORDER', label: 'Made to Order' },
  { value: 'BACK_ORDER', label: 'Back Order' },
] as const;

export function formatPrice(price?: number, currency = 'USD'): string {
  if (price == null) return 'Contact for pricing';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatProductPrice(product: {
  price?: number;
  priceMin?: number;
  priceMax?: number;
  hasVariants?: boolean;
}): string {
  const min = product.priceMin ?? product.price;
  const max = product.priceMax ?? product.price;

  if (min == null) return formatPrice(undefined);
  if (max != null && max !== min) {
    return `From ${formatPrice(min)}`;
  }
  return formatPrice(min);
}

export function formatAvailability(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
