import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Download, FileText } from 'lucide-react';
import { AvailabilityBadge } from '@/components/products/availability-badge';
import { ProductCardGrid } from '@/components/products/product-card-grid';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductPurchasePanel } from '@/components/products/product-purchase-panel';
import { ResearchUseBanner } from '@/components/marketing';
import { getProductBySlug } from '@/lib/catalog-api';

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
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
  const galleryImages =
    primaryImage && product.images[0]?.id !== primaryImage.id
      ? [primaryImage, ...product.images.filter((image) => image.id !== primaryImage.id)]
      : product.images;

  const metaFields = [
    { label: 'SKU', value: product.sku, mono: true },
    { label: 'CAS Number', value: product.casNumber },
    { label: 'Purity', value: product.purity },
    { label: 'Molecular Formula', value: product.molecularFormula },
    { label: 'Molecular Weight', value: product.molecularWeight },
    { label: 'Storage', value: product.storage },
  ].filter((field) => Boolean(field.value));

  return (
    <>
      <section className="border-b border-neutral-200 bg-gradient-to-br from-brand-pale via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="transition-colors hover:text-brand-deep">
              Home
            </Link>
            <span className="text-neutral-300" aria-hidden>
              /
            </span>
            <Link href="/products" className="transition-colors hover:text-brand-deep">
              Products
            </Link>
            {product.categoryName ? (
              <>
                <span className="text-neutral-300" aria-hidden>
                  /
                </span>
                <span className="text-neutral-600">{product.categoryName}</span>
              </>
            ) : null}
            <span className="text-neutral-300" aria-hidden>
              /
            </span>
            <span className="truncate text-brand-deep">{product.name}</span>
          </nav>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to catalog
          </Link>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <ProductImageGallery images={galleryImages} productName={product.name} />

            <div className="space-y-8">
              <div>
                {product.categoryName ? (
                  <p className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-natural">
                    {product.categoryName}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <h1 className="max-w-xl font-heading text-3xl font-bold tracking-tight text-brand-deep sm:text-4xl">
                    {product.name}
                  </h1>
                  <AvailabilityBadge availability={product.availability} />
                </div>
                {product.shortDescription ? (
                  <p className="mt-4 text-base leading-relaxed text-neutral-600 sm:text-lg">
                    {product.shortDescription}
                  </p>
                ) : null}
              </div>

              <ProductPurchasePanel product={product} />

              {metaFields.length > 0 ? (
                <dl className="grid gap-4 sm:grid-cols-2">
                  {metaFields.map((field) => (
                    <div key={field.label} className="border-l-2 border-brand-leaf pl-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        {field.label}
                      </dt>
                      <dd
                        className={`mt-1 text-sm font-medium text-neutral-900 ${
                          field.mono ? 'font-mono' : ''
                        }`}
                      >
                        {field.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="flex flex-wrap gap-4 text-sm">
                <Link
                  href="/coa"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-natural transition-colors hover:text-brand-deep"
                >
                  COA library
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/shipping"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-natural transition-colors hover:text-brand-deep"
                >
                  Shipping info
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  href="/quality"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-natural transition-colors hover:text-brand-deep"
                >
                  Quality standards
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {(product.description ||
        product.specifications.length > 0 ||
        product.sequence ||
        product.downloads.length > 0) && (
        <section className="bg-neutral-50/80 bg-lab-pattern py-10 sm:py-14">
          <div className="mx-auto max-w-3xl space-y-6 px-4">
            {product.description ? (
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/80 sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-brand-deep sm:text-2xl">
                  Description
                </h2>
                <p className="mt-4 leading-relaxed text-neutral-700">{product.description}</p>
              </article>
            ) : null}

            {product.specifications.length > 0 ? (
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/80 sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-brand-deep sm:text-2xl">
                  Specifications
                </h2>
                <dl className="mt-4 divide-y divide-neutral-100">
                  {product.specifications.map((spec) => (
                    <div key={spec.id} className="grid gap-1 py-3 sm:grid-cols-[220px_1fr] sm:gap-4">
                      <dt className="text-sm font-medium text-neutral-500">{spec.label}</dt>
                      <dd className="text-sm text-neutral-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ) : null}

            {product.sequence ? (
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/80 sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-brand-deep sm:text-2xl">
                  Sequence
                </h2>
                <p className="mt-4 break-all font-mono text-sm leading-relaxed text-neutral-800">
                  {product.sequence}
                </p>
              </article>
            ) : null}

            {product.downloads.length > 0 ? (
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200/80 sm:p-8">
                <h2 className="font-heading text-xl font-semibold text-brand-deep sm:text-2xl">
                  Documentation
                </h2>
                <ul className="mt-4 divide-y divide-neutral-100 overflow-hidden rounded-xl bg-neutral-50 ring-1 ring-neutral-200/70">
                  {product.downloads.map((download) => (
                    <li key={download.id}>
                      <a
                        href={download.url}
                        className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-white"
                      >
                        <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-neutral-800">
                          <FileText className="h-4 w-4 shrink-0 text-brand-deep" aria-hidden />
                          <span className="truncate">{download.name}</span>
                          <span className="shrink-0 text-xs uppercase tracking-wide text-neutral-500">
                            {download.type}
                          </span>
                        </span>
                        <Download className="h-4 w-4 shrink-0 text-brand-natural" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </div>
        </section>
      )}

      {product.relatedProducts.length > 0 ? (
        <section className="bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
                  Related
                </p>
                <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep">
                  Related products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                View all products
              </Link>
            </div>
            <ProductCardGrid
              products={product.relatedProducts.slice(0, 4)}
              className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
            />
          </div>
        </section>
      ) : null}

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner ctaHref="/products" ctaLabel="Continue browsing catalog" />
        </div>
      </section>
    </>
  );
}
