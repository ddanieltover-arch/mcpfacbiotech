const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { PrismaClient } = require('@prisma/client');

function loadEnvFiles(files = ['.env', '.env.local']) {
  for (const file of files) {
    const fullPath = resolve(process.cwd(), file);
    if (!existsSync(fullPath)) continue;
    const content = readFileSync(fullPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null) process.env[key] = value;
    }
  }
}

loadEnvFiles();

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL },
  },
});

async function main() {
  const deleted = await prisma.product.deleteMany({
    where: { sku: { startsWith: 'MBT-' } },
  });
  console.log(`Removed ${deleted.count} leftover sample products (MBT-*)`);

  const [categories, products, images, variants, published, withCategory] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.productImage.count(),
      prisma.productVariant.count(),
      prisma.product.count({
        where: { status: 'PUBLISHED', isVisible: true, deletedAt: null },
      }),
      prisma.product.count({
        where: { productCategories: { some: {} } },
      }),
    ]);

  console.log({
    categories,
    products,
    publishedVisible: published,
    withCategory,
    images,
    variants,
  });

  const sample = await prisma.product.findFirst({
    where: {
      isVisible: true,
      deletedAt: null,
      productCategories: { some: {} },
    },
    include: {
      images: true,
      variants: true,
      productCategories: { include: { category: true } },
    },
    orderBy: { name: 'asc' },
  });

  if (sample) {
    console.log('sample', {
      name: sample.name,
      slug: sample.slug,
      sku: sample.sku,
      price: String(sample.retailPrice),
      images: sample.images.length,
      variants: sample.variants.length,
      category: sample.productCategories[0]?.category?.name,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
