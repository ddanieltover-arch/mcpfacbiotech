import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: {
      productCategories: {
        include: {
          category: true,
        },
      },
      images: true,
    },
  });

  console.log(`Loaded ${products.length} products.`);

  const summary = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.productCategories[0]?.category?.name || 'NO_CATEGORY',
    imageUrl: p.images[0]?.url || 'NO_IMAGE',
  }));

  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(__dirname, 'product_mappings_output.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  );
  console.log('Successfully wrote to product_mappings_output.json');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
