/**
 * One-off cleanup: delete legacy aggregate variant rows like "5mg, 10mg"
 * when the individual sibling options already exist for the same product.
 */
import { PrismaClient } from '@prisma/client';
import { loadEnvFiles } from './load-env';
import { isRedundantAggregateVariantValue } from './utils';

loadEnvFiles();

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const variants = await prisma.productVariant.findMany({
    select: {
      id: true,
      productId: true,
      name: true,
      value: true,
    },
  });

  const siblingsByProductAttr = new Map<string, Set<string>>();
  for (const variant of variants) {
    const key = `${variant.productId}::${variant.name.trim().toLowerCase()}`;
    const set = siblingsByProductAttr.get(key) ?? new Set<string>();
    set.add(variant.value);
    siblingsByProductAttr.set(key, set);
  }

  const toDelete = variants.filter((variant) => {
    const key = `${variant.productId}::${variant.name.trim().toLowerCase()}`;
    const siblings = siblingsByProductAttr.get(key) ?? new Set<string>();
    return isRedundantAggregateVariantValue(variant.value, siblings);
  });

  console.log(`Found ${toDelete.length} redundant aggregate variant(s).`);
  for (const variant of toDelete) {
    console.log(`  - ${variant.name}: "${variant.value}" (${variant.id})`);
  }

  if (isDryRun || toDelete.length === 0) {
    if (isDryRun) console.log('Dry run — no rows deleted.');
    return;
  }

  const result = await prisma.productVariant.deleteMany({
    where: { id: { in: toDelete.map((variant) => variant.id) } },
  });
  console.log(`Deleted ${result.count} variant row(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
