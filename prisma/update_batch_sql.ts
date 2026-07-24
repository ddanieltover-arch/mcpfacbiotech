import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_BASE = 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images';

const ALL_SLUGS = [
  // Batch 1
  'bpc-157-5mg',
  'tb-500-5mg',
  'semaglutide-5mg',
  'melanotan-ii-10mg',
  'cjc-1295-with-dac',
  'cjc-1295-without-dac',
  'ghk-cu-50mg',
  'ipamorelin-5mg',
  'epithalon-50mg',
  'sermorelin-5mg',

  // Batch 2
  'mots-c-10mg',
  'aod-9604-5mg',
  'll-37-5mg',
  'semax-10mg',
  'selank-10mg',
  'oxytocin-5mg',
  'pinealon-10mg',
  'vesugen-10mg',
  'humanin-10mg',
  'thymosin-a1-10mg',

  // Batch 3
  'metformin-hcl-500mg',
  'dmso-100ml',
  'reconstitution-solution-30ml',
  'bacteriostatic-water-30ml',
  'acetic-acid-0-6-percent-3ml',
  'glutathione-1200mg',
  '5-amino-1mq-50mg',
  'nad-plus-500mg',
  'caffeine-reference-standard-1g',
  'aspirin-reference-standard-1g',

  // Batch 4
  'universal-pipette-tips-1000',
  'centrifuge-tubes-50ml-500',
  'portable-insulin-cooler-case',
  'travel-cold-case',
  'insulin-syringes-10-pack',
  'microcentrifuge-tubes-1-5ml-1000',
  'serological-pipettes-10ml-200',
  'petri-dishes-90mm-500',
  'lab-nitrile-gloves-box-100',
  'reagent-bottles-250ml-10',

  // Batch 5
  'cagrilintide',
  'tirzepatide',
  'tesamorelin',
  'pt-141',
  'dsip',
  'igf-1-lr3',
  'hgh-fragment-176-191',
  'bpc-157-tb-500-blend',
  'kisspeptin-10',
  'kpv',

  // Batch 6
  'cjc-1295-dac-ipamorelin',
  'hgh-191aa-somatropin',
  'mgf',
  'peg-mgf',
  'hexarelin',
  'ghrp-2',
  'ghrp-6',
  'bpc-157-arginate-salt',
  'n-acetyl-semx-amidate',
  'n-acetyl-selank-amidate',

  // Batch 7
  'anavar-10mg-60-tablets',
  'mk-677-10mg-50-tablets',
  'rad140-10mg-50-tablets',
  'gw-501516-10mg-50-tablets',
  'cialis-25mg-50-tablets',
  'methylene-blue',
  'aicar-10mg-50-tablets',
  'lipo-c',
  'follistatin-344',
  'glow-bpc-157-ghk-cu-tb-500-blend',

  // Batch 8
  'ss-31',
  'lipo-b',
  'aicar',
  'fat-blaster-lc526',
  'snap-8-10mg',
  'bac-water',
  'tb-500-10mg',
  'bpc-157-tb-500-5mg-5mg',
  'dsip-10mg',
  'epitalon-50mg',

  // Batch 9
  'follistatin-315',
  'foxo4-dri',
  'gdf-8',
  'hcg',
  'hmg',
  'ibutamorin',
  'livagen',
  'ovagen',
  'pnc-27',
  'prostamax',

  // Batch 10
  'slu-pp-332',
  'thymalin',
  'thymogen',
  'vilon',
  'vip',
  'tudca',
  'bam15',
  'cortagen',
  'chonluten',
  'cerebrolysin',

  // Batch 11
  'cardarine',
  'andarine',
  'stenabolic',
  'ostarine',
  'ligandrol',
  'yks11',
  'testolone',
  's-23',
  'sr9011',
  'ac-262',

  // Batch 12
  'humanin',
  'lipo-c-injection',
  'super-shred-blend',
  'glow-blend-10mg',
  'bpc-157-tb-500-10mg',
  'recovery-stack',
  'skinny-shot-blend',
  'nad-plus-1000mg',
  'glutathione-600mg',
  'semaglutide-10mg',

  // Batch 13
  'tirzepatide-15mg',
  'tesamorelin-5mg',
  'cagrilintide-10mg',
  'retatrutide-5mg',
  'pt-141-5mg',
  'bpc-157-10mg',
  'tb-500-2mg',
  'semaglutide-2mg',
  'ghk-cu-100mg',
  'epitalon-10mg',

  // Batch 14
  'igf-1-des-1mg',
  'peg-mgf-2mg',
  'cjc-1295-2mg',
  'hexarelin-2mg',
  'ghrp-2-5mg',
  'ghrp-6-5mg',
  'ipamorelin-2mg',
  'sermorelin-2mg',
  'mots-c-5mg',
  'aod-9604-2mg',

  // Batch 15
  'semax-30mg',
  'selank-30mg',
  'll-37-10mg',
  'humanin-20mg',
  'oxytocin-10mg',
  'pinealon-20mg',
  'vesugen-20mg',
  'thymosin-a1-5mg',
  'epithalon-20mg',
  'bpc-157-tb-500-20mg',

  // Batch 16
  'cagrilintide-2-5mg',
  'retatrutide-10mg',
  'tirzepatide-5mg',
  'tesamorelin-2mg',
  'pt-141-10mg',
  'dsip-2mg',
  'hgh-fragment-176-191-2mg',
  'kisspeptin-10-5mg',
  'kpv-5mg',
  'bpc-157-arginate-salt-5mg',

  // Batch 17
  'cjc-1295-dac-ipamorelin-10mg',
  'hgh-191aa-100iu',
  'mgf-5mg',
  'peg-mgf-10mg',
  'n-acetyl-semx-amidate-10mg',
  'n-acetyl-selank-amidate-10mg',
  'glow-blend-20mg',
  'recovery-stack-ultra',
  'skinny-shot-blend-pro',
  'super-shred-blend-max',

  // Batch 18
  'bpc-157-tb-500-blend-10mg',
  'bpc-157-arginate-salt-10mg',
  'aod-9604-10mg',
  'll-37-20mg',
  'mots-c-20mg',
  'oxytocin-20mg',
  'pinealon-30mg',
  'vesugen-30mg',
  'thymosin-a1-20mg',
  'epithalon-30mg',

  // Batch 19
  'humanin-30mg',
  'cagrilintide-15mg',
  'retatrutide-15mg',
  'tirzepatide-20mg',
  'tesamorelin-10mg',
  'pt-141-15mg',
  'dsip-15mg',
  'hgh-fragment-176-191-10mg',
  'kisspeptin-10-10mg',
  'kpv-10mg',

  // Batch 20
  'cjc-1295-dac-ipamorelin-20mg',
  'hgh-191aa-200iu',
  'mgf-10mg',
  'peg-mgf-20mg',
  'n-acetyl-semx-amidate-20mg',
  'n-acetyl-selank-amidate-20mg',
  'glow-blend-30mg',
  'recovery-stack-max',
  'skinny-shot-blend-ultra',
  'super-shred-blend-pro',

  // Batch 21
  'bpc-157-arginate-salt-20mg',
  'aod-9604-15mg',
  'll-37-30mg',
  'mots-c-30mg',
  'oxytocin-30mg',
  'pinealon-50mg',
  'vesugen-50mg',
  'thymosin-a1-30mg',
  'epithalon-50mg-vial',
  'bpc-157-tb-500-30mg',

  // Batch 22
  'humanin-50mg',
  'cagrilintide-20mg',
  'retatrutide-20mg',
  'tirzepatide-30mg',
  'tesamorelin-15mg',
  'pt-141-20mg',
  'dsip-20mg',
  'hgh-fragment-176-191-15mg',
  'kisspeptin-10-15mg',
  'kpv-15mg',

  // Batch 23
  'cjc-1295-dac-ipamorelin-30mg',
  'hgh-191aa-300iu',
  'mgf-20mg',
  'peg-mgf-30mg',
  'n-acetyl-semx-amidate-30mg',
  'n-acetyl-selank-amidate-30mg',
  'glow-blend-50mg',
  'recovery-stack-pro',
  'skinny-shot-blend-max',
  'super-shred-blend-ultra',

  // Batch 24
  'bpc-157-tb-500-blend-50mg',
  'bpc-157-arginate-salt-30mg',
  'aod-9604-20mg',
  'll-37-50mg',
  'mots-c-50mg',
  'oxytocin-50mg',
  'pinealon-100mg',
  'vesugen-100mg',
  'thymosin-a1-50mg',
  'epithalon-100mg-vial',

  // Batch 25
  'humanin-100mg',
  'cagrilintide-30mg',
  'retatrutide-30mg',
  'tirzepatide-50mg',
  'tesamorelin-20mg',
  'pt-141-30mg',
  'dsip-30mg',
  'hgh-fragment-176-191-20mg',
  'kisspeptin-10-20mg',
  'kpv-20mg',
];

async function main() {
  console.log('Fast updating product images in database for Batches 1 to 25...');

  for (const slug of ALL_SLUGS) {
    const url = `${SUPABASE_BASE}/${slug}.png`;
    const keyword = slug.split('-')[0];
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE product_images SET url = $1 WHERE product_id IN (SELECT id FROM products WHERE slug LIKE $2 OR name ILIKE $3)`,
      url,
      `%${keyword}%`,
      `%${keyword}%`
    );
    console.log(`Updated images for '${slug}': ${updated} rows affected.`);
  }

  // Update remaining placehold.co / peptidepeak fallback images to bpc-157-5mg
  const defaultUrl = `${SUPABASE_BASE}/bpc-157-5mg.png`;
  const count = await prisma.$executeRawUnsafe(
    `UPDATE product_images SET url = $1 WHERE url LIKE '%placehold.co%' OR url LIKE '%peptidepeak.online%'`,
    defaultUrl
  );
  console.log(`Updated fallback images: ${count} rows affected.`);

  console.log('SQL Fast Update Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
