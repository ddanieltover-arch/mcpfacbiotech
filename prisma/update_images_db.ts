import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_PRODUCT_IMAGES: Record<string, string> = {
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
  console.log('Updating ProductImage records with Supabase URLs...');

  for (const [slug, url] of Object.entries(SUPABASE_PRODUCT_IMAGES)) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (!product) {
      console.log(`Product not found for slug: ${slug}`);
      continue;
    }

    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
    if (primaryImage) {
      await prisma.productImage.update({
        where: { id: primaryImage.id },
        data: { url },
      });
      console.log(`Updated ${slug} -> ${url}`);
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
      console.log(`Created image for ${slug} -> ${url}`);
    }
  }

  console.log('Finished updating database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
