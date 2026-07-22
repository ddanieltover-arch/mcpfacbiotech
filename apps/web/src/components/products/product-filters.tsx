import Link from 'next/link';
import { Search } from 'lucide-react';
import { AVAILABILITY_OPTIONS, type CategoryOption } from '@/lib/catalog-api';

type ProductFiltersProps = {
  searchParams: Record<string, string | string[] | undefined>;
  categories: CategoryOption[];
};

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function ProductFilters({ searchParams, categories }: ProductFiltersProps) {
  const currentCategory = getParam(searchParams, 'category');
  const currentSearch = getParam(searchParams, 'search');
  const currentAvailability = getParam(searchParams, 'availability');
  const currentSort = getParam(searchParams, 'sort') || 'featured';

  return (
    <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/80 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-natural">Refine</p>
        <h2 className="mt-1 font-heading text-lg font-semibold text-brand-deep">Filters</h2>
      </div>

      <form method="GET" className="space-y-6">
        <div>
          <label htmlFor="search" className="mb-2 block text-sm font-medium text-neutral-700">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="search"
              name="search"
              defaultValue={currentSearch}
              placeholder="Name, SKU, CAS..."
              className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-neutral-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={currentCategory}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="availability" className="mb-2 block text-sm font-medium text-neutral-700">
            Availability
          </label>
          <select
            id="availability"
            name="availability"
            defaultValue={currentAvailability}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          >
            <option value="">Any availability</option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="mb-2 block text-sm font-medium text-neutral-700">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={currentSort}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
          >
            <option value="featured">Featured</option>
            <option value="name">Name (A–Z)</option>
            <option value="price">Price</option>
            <option value="sku">SKU</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
          >
            Apply
          </button>
          <Link
            href="/products"
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Reset
          </Link>
        </div>
      </form>
    </aside>
  );
}
