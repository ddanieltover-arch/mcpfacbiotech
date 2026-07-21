import type { Metadata } from 'next';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductGrid } from '@/components/products/product-grid';
import { CATEGORY_OPTIONS, getProducts } from '@/lib/catalog-api';

export const metadata: Metadata = {
  title: 'Products | MCPFAC BIOTECH',
  description:
    'Browse research peptides, research chemicals, laboratory supplies, and analytical standards from MCPFAC BIOTECH.',
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Number(getParam(params, 'page') || '1');

  const catalog = await getProducts({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: 12,
    search: getParam(params, 'search') || undefined,
    category: getParam(params, 'category') || undefined,
    availability: getParam(params, 'availability') || undefined,
    sort: getParam(params, 'sort') || 'featured',
    direction: getParam(params, 'sort') === 'name' ? 'asc' : 'desc',
  });

  const activeCategory = getParam(params, 'category');
  const categoryLabel =
    CATEGORY_OPTIONS.find((category) => category.slug === activeCategory)?.label ?? 'All Products';

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <nav className="mb-3 text-sm text-neutral-500">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-brand-deep">Products</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold text-brand-deep">{categoryLabel}</h1>
          <p className="mt-3 max-w-3xl text-neutral-600">
            Enterprise-grade biotechnology research products with verified documentation, batch
            traceability, and global laboratory delivery.
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {catalog.total > 0
              ? `${catalog.total} products available`
              : 'Catalog is loading or the backend API is unavailable. Run "pnpm dev" from the repo root.'}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[280px_1fr]">
        <ProductFilters searchParams={params} />
        <ProductGrid
          products={catalog.items}
          page={catalog.page}
          totalPages={catalog.totalPages}
          searchParams={params}
        />
      </div>
    </div>
  );
}
