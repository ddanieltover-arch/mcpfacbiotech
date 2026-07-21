import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/products/product-card';
import { getFeaturedProducts } from '@/lib/catalog-api';

export async function FeaturedProductsSection() {
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];

  try {
    products = await getFeaturedProducts(8);
  } catch {
    products = [];
  }

  return (
    <section className="border-y border-neutral-200 bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-natural">
              Featured compounds
            </p>
            <h2 className="font-heading text-2xl font-bold text-brand-deep sm:text-3xl">
              Hand-picked research materials
            </h2>
            <p className="mt-3 max-w-2xl text-neutral-600">
              Verified catalog highlights with transparent pricing and specifications where published.
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
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {products.map((product, index) => (
              <div key={product.id} className={index >= 6 ? 'hidden lg:block' : undefined}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-500">
            Featured products will appear here once the catalog is available.
          </div>
        )}
      </div>
    </section>
  );
}
