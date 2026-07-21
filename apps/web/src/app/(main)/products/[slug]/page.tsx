import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Beaker, Download, FileText } from 'lucide-react';
import { AvailabilityBadge } from '@/components/products/availability-badge';
import { ProductActions } from '@/components/products/product-actions';
import { ProductCard } from '@/components/products/product-card';
import { formatPrice, getProductBySlug } from '@/lib/catalog-api';

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | MCPFAC BIOTECH' };
  }

  return {
    title: `${product.name} | MCPFAC BIOTECH`,
    description: product.shortDescription ?? product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-neutral-500">
          <Link href="/" className="hover:text-brand-deep">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-brand-deep">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-deep">{product.name}</span>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative aspect-square bg-brand-pale/20">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-brand-natural">
                  <Beaker className="h-20 w-20" strokeWidth={1.25} />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 border-t border-neutral-100 p-4">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-neutral-200"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.categoryName && (
                <p className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-natural">
                  {product.categoryName}
                </p>
              )}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="font-heading text-4xl font-bold text-brand-deep">{product.name}</h1>
                <AvailabilityBadge availability={product.availability} />
              </div>
              {product.shortDescription && (
                <p className="mt-4 text-lg text-neutral-600">{product.shortDescription}</p>
              )}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="font-heading text-3xl font-bold text-brand-deep">
                {formatPrice(product.price)}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Minimum order quantity: {product.minimumOrderQuantity}
              </p>
              <div className="mt-5">
                <ProductActions
                  productId={product.id}
                  productName={product.name}
                  productSku={product.sku}
                  unitPrice={product.price}
                  productImage={primaryImage?.url}
                  minimumOrderQuantity={product.minimumOrderQuantity}
                />
              </div>
            </div>

            <dl className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-neutral-500">SKU</dt>
                <dd className="font-mono text-sm font-medium text-neutral-900">{product.sku}</dd>
              </div>
              {product.casNumber && (
                <div>
                  <dt className="text-sm text-neutral-500">CAS Number</dt>
                  <dd className="text-sm font-medium text-neutral-900">{product.casNumber}</dd>
                </div>
              )}
              {product.purity && (
                <div>
                  <dt className="text-sm text-neutral-500">Purity</dt>
                  <dd className="text-sm font-medium text-neutral-900">{product.purity}</dd>
                </div>
              )}
              {product.molecularFormula && (
                <div>
                  <dt className="text-sm text-neutral-500">Molecular Formula</dt>
                  <dd className="text-sm font-medium text-neutral-900">{product.molecularFormula}</dd>
                </div>
              )}
              {product.molecularWeight && (
                <div>
                  <dt className="text-sm text-neutral-500">Molecular Weight</dt>
                  <dd className="text-sm font-medium text-neutral-900">{product.molecularWeight}</dd>
                </div>
              )}
              {product.storage && (
                <div>
                  <dt className="text-sm text-neutral-500">Storage</dt>
                  <dd className="text-sm font-medium text-neutral-900">{product.storage}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {product.description && (
          <section className="mt-10 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="font-heading text-2xl font-semibold text-brand-deep">Description</h2>
            <p className="mt-4 leading-relaxed text-neutral-700">{product.description}</p>
          </section>
        )}

        {product.specifications.length > 0 && (
          <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="font-heading text-2xl font-semibold text-brand-deep">Specifications</h2>
            <dl className="mt-4 divide-y divide-neutral-100">
              {product.specifications.map((spec) => (
                <div key={spec.id} className="grid gap-2 py-3 sm:grid-cols-[240px_1fr]">
                  <dt className="text-sm font-medium text-neutral-500">{spec.label}</dt>
                  <dd className="text-sm text-neutral-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {product.sequence && (
          <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="font-heading text-2xl font-semibold text-brand-deep">Sequence</h2>
            <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-800">{product.sequence}</p>
          </section>
        )}

        {product.downloads.length > 0 && (
          <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="font-heading text-2xl font-semibold text-brand-deep">Documentation</h2>
            <ul className="mt-4 space-y-3">
              {product.downloads.map((download) => (
                <li key={download.id}>
                  <a
                    href={download.url}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 transition-colors hover:bg-brand-pale/40"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium text-neutral-800">
                      <FileText className="h-4 w-4 text-brand-deep" />
                      {download.name}
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                        {download.type}
                      </span>
                    </span>
                    <Download className="h-4 w-4 text-brand-natural" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {product.relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-brand-deep">Related Products</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {product.relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          For research use only. Not for human or veterinary consumption.
        </p>
      </div>
    </div>
  );
}
