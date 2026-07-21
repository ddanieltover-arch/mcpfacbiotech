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
  const response = await fetchJson<ApiResponse<Category[]>>(buildUrl('/categories'));
  return response.data;
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

export const CATEGORY_OPTIONS = [
  { slug: 'research-peptides', label: 'Research Peptides' },
  { slug: 'research-chemicals', label: 'Research Chemicals' },
  { slug: 'laboratory-supplies', label: 'Laboratory Supplies' },
  { slug: 'analytical-standards', label: 'Analytical Standards' },
] as const;

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

export function formatAvailability(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
