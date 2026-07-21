import { PrismaClient } from '@prisma/client';
import { seedRoles } from './seed/roles';
import { seedPermissions } from './seed/permissions';
import { seedCategories } from './seed/categories';
import { seedProducts } from './seed/products';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles...');
  await seedRoles(prisma);

  console.log('Seeding permissions...');
  await seedPermissions(prisma);

  console.log('Seeding categories...');
  const categoryIds = await seedCategories(prisma);

  console.log('Seeding products...');
  await seedProducts(prisma, categoryIds);

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
