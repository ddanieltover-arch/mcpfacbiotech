import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { CATEGORY_OPTIONS, getFeaturedProducts } from '@/lib/catalog-api';

export async function FeaturedProductsSection() {
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];

  try {
    products = await getFeaturedProducts(6);
  } catch {
    products = [];
  }

  return (
    <section className="border-t border-neutral-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-natural">
              Featured Catalog
            </p>
            <h2 className="font-heading text-3xl font-bold text-brand-deep md:text-4xl">
              Research Products Ready to Ship
            </h2>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Explore verified peptides, analytical standards, and laboratory supplies trusted by
              research institutions worldwide.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-deep hover:text-brand-natural"
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-500">
            Featured products will appear here once the catalog seed is loaded.
          </div>
        )}

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORY_OPTIONS.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-5 text-center transition-colors hover:border-brand-leaf hover:bg-brand-pale/40"
            >
              <p className="font-heading text-sm font-semibold text-brand-deep">{category.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
