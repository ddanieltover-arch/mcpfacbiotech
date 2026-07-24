import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPLETED_SLUGS = new Set([
  // Batch 1
  'bpc-157-5mg', 'tb-500-5mg', 'semaglutide-5mg', 'melanotan-ii-10mg',
  'cjc-1295-with-dac', 'cjc-1295-without-dac', 'ghk-cu-50mg', 'ipamorelin-5mg',
  'epithalon-50mg', 'sermorelin-5mg',

  // Batch 2
  'mots-c-10mg', 'aod-9604-5mg', 'll-37-5mg', 'semax-10mg', 'selank-10mg',
  'oxytocin-5mg', 'pinealon-10mg', 'vesugen-10mg', 'humanin-10mg', 'thymosin-a1-10mg',

  // Batch 3
  'metformin-hcl-500mg', 'dmso-100ml', 'reconstitution-solution-30ml',
  'bacteriostatic-water-30ml', 'acetic-acid-0-6-percent-3ml', 'glutathione-1200mg',
  '5-amino-1mq-50mg', 'nad-plus-500mg', 'caffeine-reference-standard-1g',
  'aspirin-reference-standard-1g',

  // Batch 4
  'universal-pipette-tips-1000', 'centrifuge-tubes-50ml-500', 'portable-insulin-cooler-case',
  'travel-cold-case', 'insulin-syringes-10-pack', 'microcentrifuge-tubes-1-5ml-1000',
  'serological-pipettes-10ml-200', 'petri-dishes-90mm-500', 'lab-nitrile-gloves-box-100',
  'reagent-bottles-250ml-10',

  // Batch 5
  'cagrilintide', 'tirzepatide', 'tesamorelin', 'pt-141', 'dsip',
  'igf-1-lr3', 'hgh-fragment-176-191', 'bpc-157-tb-500-blend', 'kisspeptin-10', 'kpv',

  // Batch 6
  'cjc-1295-dac-ipamorelin', 'hgh-191aa-somatropin', 'mgf', 'peg-mgf',
  'hexarelin', 'ghrp-2', 'ghrp-6', 'bpc-157-arginate-salt', 'n-acetyl-semx-amidate',
  'n-acetyl-selank-amidate',
]);

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });

  const remaining = products.filter(p => !COMPLETED_SLUGS.has(p.slug));
  console.log(`Remaining Products to Rebrand: ${remaining.length}`);
  for (const p of remaining) {
    console.log(`${p.slug} | ${p.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
