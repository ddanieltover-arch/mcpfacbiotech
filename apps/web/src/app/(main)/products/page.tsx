import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductGrid } from '@/components/products/product-grid';
import { CATEGORY_OPTIONS, getProducts, PRODUCTS_PAGE_SIZE } from '@/lib/catalog-api';

export const metadata: Metadata = {
  title: 'Products',
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
  const sort = getParam(params, 'sort') || 'featured';
  const filters = {
    search: getParam(params, 'search') || undefined,
    category: getParam(params, 'category') || undefined,
    availability: getParam(params, 'availability') || undefined,
    sort,
    direction: (sort === 'name' ? 'asc' : 'desc') as 'asc' | 'desc',
  };

  const catalog = await getProducts({
    page: 1,
    limit: PRODUCTS_PAGE_SIZE,
    ...filters,
  });

  const activeCategory = getParam(params, 'category');
  const categoryLabel =
    CATEGORY_OPTIONS.find((category) => category.slug === activeCategory)?.label ?? 'All products';
  const filterKey = [filters.search, filters.category, filters.availability, filters.sort].join('|');

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 88% 10%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14 lg:py-16">
          <nav className="mb-4 text-sm text-neutral-500">
            <Link href="/" className="transition-colors hover:text-brand-deep">
              Home
            </Link>
            <span className="mx-2 text-neutral-300" aria-hidden>
              /
            </span>
            <span className="text-brand-deep">Products</span>
          </nav>

          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Research catalog
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            {categoryLabel}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Research peptides, chemicals, laboratory supplies, and analytical standards with
            transparent specifications and documentation where published.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-sm text-neutral-500">
              {catalog.total > 0
                ? `${catalog.total} products available`
                : 'Catalog is loading or the backend API is unavailable.'}
            </p>
            <Link
              href="/coa"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
            >
              COA library
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <Link
              href="/products"
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !activeCategory
                  ? 'bg-brand-deep text-white'
                  : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-brand-pale hover:text-brand-deep'
              }`}
            >
              All
            </Link>
            {CATEGORY_OPTIONS.map((category) => {
              const active = activeCategory === category.slug;
              return (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand-deep text-white'
                      : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-brand-pale hover:text-brand-deep'
                  }`}
                >
                  {category.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50/80 bg-lab-pattern">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr] lg:gap-10 lg:py-12">
          <ProductFilters searchParams={params} />
          <ProductGrid
            key={filterKey}
            products={catalog.items}
            page={catalog.page}
            totalPages={catalog.totalPages}
            total={catalog.total}
            filters={filters}
          />
        </div>
      </section>
    </>
  );
}
