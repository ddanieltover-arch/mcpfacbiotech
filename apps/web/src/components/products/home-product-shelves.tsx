import {
  CATEGORY_OPTIONS,
  getFeaturedProducts,
  getProducts,
} from '@/lib/catalog-api';
import { ProductShelf } from '@/components/products/product-shelf';

const CATEGORY_SHELVES = CATEGORY_OPTIONS.map((category, index) => ({
  ...category,
  tone: (index % 2 === 0 ? 'muted' : 'default') as 'muted' | 'default',
  description: `Browse ${category.label.toLowerCase()} with transparent specs and documentation where published.`,
}));

async function loadShelfProducts(category?: string, sort = 'newest', limit = 8) {
  const result = await getProducts({
    page: 1,
    limit,
    category,
    sort,
    direction: 'desc',
  });
  return result.items;
}

export async function HomeProductShelves() {
  const [featured, newest, ...categoryResults] = await Promise.all([
    getFeaturedProducts(8).catch(() => []),
    loadShelfProducts(undefined, 'newest', 8),
    ...CATEGORY_SHELVES.map((category) => loadShelfProducts(category.slug, 'featured', 8)),
  ]);

  // Avoid repeating the same SKUs immediately under featured when possible
  const featuredIds = new Set(featured.map((p) => p.id));
  const newestUnique = newest.filter((p) => !featuredIds.has(p.id)).slice(0, 8);
  const newestShelf = newestUnique.length >= 4 ? newestUnique : newest.slice(0, 8);

  return (
    <>
      <ProductShelf
        eyebrow="Featured compounds"
        title="Hand-picked research materials"
        description="Verified catalog highlights with transparent pricing and specifications where published."
        href="/products?sort=featured"
        actionLabel="View featured"
        products={featured}
        tone="default"
      />

      <ProductShelf
        eyebrow="Just added"
        title="Latest catalog additions"
        description="Recently published research materials ready for laboratory procurement."
        href="/products?sort=newest"
        actionLabel="View newest"
        products={newestShelf}
        tone="muted"
      />

      {CATEGORY_SHELVES.map((category, index) => (
        <ProductShelf
          key={category.slug}
          eyebrow="Shop by category"
          title={category.label}
          description={category.description}
          href={`/products?category=${category.slug}`}
          actionLabel={`Shop ${category.label}`}
          products={categoryResults[index] ?? []}
          tone={category.tone}
        />
      ))}
    </>
  );
}
