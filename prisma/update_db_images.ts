import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(__dirname, 'final_rebranded_urls.json');
  if (!fs.existsSync(filePath)) {
    console.error('final_rebranded_urls.json not found!');
    return;
  }
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`Updating database URLs for ${items.length} products...`);

  let updatedCount = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const { productId, url } = item;
    
    if (i % 10 === 0) {
      console.log(`[${i}/${items.length}] Processing product ID ${productId}...`);
    }

    // Check if productImage already exists for this productId
    const existing = await prisma.productImage.findFirst({
      where: { productId },
    });

    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { url },
      });
    } else {
      await prisma.productImage.create({
        data: {
          productId,
          url,
          alt: 'Product Image',
        },
      });
    }
    updatedCount++;
  }

  console.log(`Successfully updated/created ${updatedCount} database product image records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
