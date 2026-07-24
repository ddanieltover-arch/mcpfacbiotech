import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });
  console.log(`Total Catalog Products in DB: ${products.length}`);
  for (const p of products) {
    console.log(`${p.slug} | ${p.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
