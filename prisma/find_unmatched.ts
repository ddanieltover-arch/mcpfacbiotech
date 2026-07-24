import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true },
  });

  const images = await prisma.productImage.findMany({
    select: { productId: true, url: true }
  });

  const imgMap = new Map();
  for (const img of images) {
    imgMap.set(img.productId, img.url);
  }

  console.log(`Total DB Products: ${products.length}`);
  let nonSupabase = 0;
  for (const p of products) {
    const url = imgMap.get(p.id) || '';
    if (!url.includes('yoojdbprdgjwzfmyjcif.supabase.co')) {
      console.log(`UNMATCHED / NON-SUPABASE: ID=${p.id}, name='${p.name}', slug='${p.slug}', url='${url}'`);
      nonSupabase++;
    }
  }

  console.log(`Total products without Supabase URL: ${nonSupabase}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
