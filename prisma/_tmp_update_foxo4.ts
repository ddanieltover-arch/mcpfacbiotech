import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const slug = 'foxo4-dri';
const VERSION = '20260731b';
const url = `https://yoojdbprdgjwzfmyjcif.supabase.co/storage/v1/object/public/product-images/${slug}.png?v=${VERSION}`;

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: true },
  });

  if (!product) {
    console.log('Product not found:', slug);
    return;
  }

  console.log('Name:', product.name);
  console.log('Before:', product.images.map((i) => i.url));

  const primary = product.images.find((img) => img.isPrimary) || product.images[0];
  if (primary) {
    const updated = await prisma.productImage.update({
      where: { id: primary.id },
      data: { url, alt: product.name },
    });
    console.log('Updated:', updated.url);
  } else {
    const created = await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        alt: product.name,
        isPrimary: true,
        sortOrder: 0,
      },
    });
    console.log('Created:', created.url);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
