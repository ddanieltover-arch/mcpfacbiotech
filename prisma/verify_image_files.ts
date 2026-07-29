import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  console.log(`Checking local images for ${products.length} products...`);
  const publicDir = path.join(__dirname, '../apps/web/public/images/products');

  let missingCount = 0;
  const missingSlugs: string[] = [];

  for (const p of products) {
    const filePath = path.join(publicDir, `${p.slug}.png`);
    if (!fs.existsSync(filePath)) {
      missingCount++;
      missingSlugs.push(p.slug);
      console.log(`MISSING: ${p.slug} ("${p.name}")`);
    }
  }

  console.log(`\nTotal missing images: ${missingCount}`);
  if (missingCount > 0) {
    console.log('Missing slugs:', missingSlugs);
  } else {
    console.log('All products have corresponding local image files!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
