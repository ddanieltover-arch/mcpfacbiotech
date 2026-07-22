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

    return response.data;
  } catch {
    return { ...EMPTY_CATALOG, limit: params.limit ?? EMPTY_CATALOG.limit };
  }
}

export async function getFeaturedProducts(limit = 6) {
  const response = await fetchJson<ApiResponse<ProductSummary[]>>(
    buildUrl('/products/featured'),
  );

  return response.data.slice(0, limit);
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

  return response.data;
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
