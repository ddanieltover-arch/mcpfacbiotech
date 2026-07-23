import { PrismaClient } from '@prisma/client';
import { seedCategories } from './seed/categories';
import { seedProducts } from './seed/products';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  const categoryIds = await seedCategories(prisma);

  console.log('Seeding products with rebranded Supabase images...');
  await seedProducts(prisma, categoryIds);

  console.log('Product image rebrand seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
