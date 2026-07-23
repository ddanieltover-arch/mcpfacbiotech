import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_IMAGES: Record<string, string> = {
  'bpc-157-5mg': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/bpc-157-5mg.png',
  'tb-500-5mg': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/tb-500-5mg.png',
  'semaglutide-5mg': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/semaglutide-5mg.png',
  'melanotan-ii-10mg': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/melanotan-ii-10mg.png',
  'metformin-hcl-500mg': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/metformin-hcl-500mg.png',
  'dmso-100ml': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/dmso-100ml.png',
  'universal-pipette-tips-1000': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/universal-pipette-tips-1000.png',
  'centrifuge-tubes-50ml-500': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/centrifuge-tubes-50ml-500.png',
  'caffeine-reference-standard-1g': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/caffeine-reference-standard-1g.png',
  'aspirin-reference-standard-1g': 'https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/aspirin-reference-standard-1g.png',
};

async function main() {
  console.log('Fast updating product images in database...');

  for (const [slug, url] of Object.entries(SUPABASE_IMAGES)) {
    const updated = await prisma.$executeRawUnsafe(
      `UPDATE product_images SET url = $1 WHERE product_id IN (SELECT id FROM products WHERE slug LIKE $2 OR name ILIKE $3)`,
      url,
      `%${slug.split('-')[0]}%`,
      `%${slug.split('-')[0]}%`
    );
    console.log(`Updated images for '${slug}': ${updated} rows affected.`);
  }

  // Update remaining placeholder images to default branded BPC-157 image
  const defaultUrl = SUPABASE_IMAGES['bpc-157-5mg'];
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
