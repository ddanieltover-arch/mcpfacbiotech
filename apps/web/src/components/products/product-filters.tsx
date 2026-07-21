import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AVAILABILITY_OPTIONS, CATEGORY_OPTIONS } from '@/lib/catalog-api';

type ProductFiltersProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function ProductFilters({ searchParams }: ProductFiltersProps) {
  const currentCategory = getParam(searchParams, 'category');
  const currentSearch = getParam(searchParams, 'search');
  const currentAvailability = getParam(searchParams, 'availability');
  const currentSort = getParam(searchParams, 'sort') || 'featured';

  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-brand-deep" />
        <h2 className="font-heading text-lg font-semibold text-brand-deep">Filters</h2>
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
          <p className="mb-2 text-sm font-medium text-neutral-700">Category</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="radio"
                name="category"
                value=""
                defaultChecked={!currentCategory}
                className="text-brand-deep focus:ring-brand-leaf"
              />
              All categories
            </label>
            {CATEGORY_OPTIONS.map((category) => (
              <label key={category.slug} className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  defaultChecked={currentCategory === category.slug}
                  className="text-brand-deep focus:ring-brand-leaf"
                />
                {category.label}
              </label>
            ))}
          </div>
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
