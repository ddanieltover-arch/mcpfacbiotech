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
  console.log('Syncing all products in database with rebranded Supabase Storage URLs...');

  const allProducts = await prisma.product.findMany({
    include: { images: true },
  });

  console.log(`Found ${allProducts.length} total products in database.`);

  for (const product of allProducts) {
    const slug = product.slug;
    const url = SUPABASE_IMAGES[slug];
    if (!url) {
      console.log(`No Supabase image mapping for product: '${product.name}' (slug: ${slug})`);
      continue;
    }

    if (product.images.length > 0) {
      for (const img of product.images) {
        await prisma.productImage.update({
          where: { id: img.id },
          data: { url },
        });
      }
      console.log(`[UPDATED] '${product.name}' (${slug}) -> ${url}`);
    } else {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          alt: product.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
      console.log(`[CREATED] '${product.name}' (${slug}) -> ${url}`);
    }
  }

  console.log('\nAll database products updated successfully!');
}

main()
  .catch((e) => {
    console.error('Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
