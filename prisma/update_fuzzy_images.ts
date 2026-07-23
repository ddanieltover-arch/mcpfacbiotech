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

function getMatchingImage(name: string, slug: string): string {
  const lowerName = name.toLowerCase();
  const lowerSlug = slug.toLowerCase();

  if (lowerSlug.includes('bpc-157') || lowerName.includes('bpc-157')) return SUPABASE_IMAGES['bpc-157-5mg'];
  if (lowerSlug.includes('tb-500') || lowerName.includes('tb-500')) return SUPABASE_IMAGES['tb-500-5mg'];
  if (lowerSlug.includes('semaglutide') || lowerName.includes('semaglutide')) return SUPABASE_IMAGES['semaglutide-5mg'];
  if (lowerSlug.includes('melanotan') || lowerName.includes('melanotan')) return SUPABASE_IMAGES['melanotan-ii-10mg'];
  if (lowerSlug.includes('metformin') || lowerName.includes('metformin')) return SUPABASE_IMAGES['metformin-hcl-500mg'];
  if (lowerSlug.includes('dmso') || lowerName.includes('dmso')) return SUPABASE_IMAGES['dmso-100ml'];
  if (lowerSlug.includes('pipette') || lowerName.includes('pipette')) return SUPABASE_IMAGES['universal-pipette-tips-1000'];
  if (lowerSlug.includes('centrifuge') || lowerName.includes('centrifuge')) return SUPABASE_IMAGES['centrifuge-tubes-50ml-500'];
  if (lowerSlug.includes('caffeine') || lowerName.includes('caffeine')) return SUPABASE_IMAGES['caffeine-reference-standard-1g'];
  if (lowerSlug.includes('aspirin') || lowerName.includes('aspirin')) return SUPABASE_IMAGES['aspirin-reference-standard-1g'];

  // Default fallback for any remaining product to use BPC-157 / TB-500 rebranded hero images
  return SUPABASE_IMAGES['bpc-157-5mg'];
}

async function main() {
  const products = await prisma.product.findMany({ include: { images: true } });
  console.log(`Matching and updating ${products.length} products with Supabase Storage images...`);

  let updatedCount = 0;
  for (const p of products) {
    const imageUrl = getMatchingImage(p.name, p.slug);
    if (p.images.length > 0) {
      for (const img of p.images) {
        await prisma.productImage.update({
          where: { id: img.id },
          data: { url: imageUrl },
        });
      }
    } else {
      await prisma.productImage.create({
        data: {
          productId: p.id,
          url: imageUrl,
          alt: p.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} products in database with rebranded Supabase Storage URLs!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
