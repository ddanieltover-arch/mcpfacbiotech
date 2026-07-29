import * as fs from 'fs';
import * as path from 'path';

function main() {
  const dbDumpPath = path.join(__dirname, '../all_products_db.json');
  if (!fs.existsSync(dbDumpPath)) {
    console.error('all_products_db.json not found!');
    return;
  }
  const products = JSON.parse(fs.readFileSync(dbDumpPath, 'utf-8'));

  console.log(`Original DB Dump has ${products.length} products.`);

  const legacyAssets = products.filter((p: any) => {
    const images = p.images || [];
    return images.some((img: any) => img.url && img.url.includes('tbgmkqklkshkjfhcqtzz'));
  });

  console.log(`Found ${legacyAssets.length} products with legacy assets:`);
  for (const p of legacyAssets) {
    console.log(`- ID: ${p.id}`);
    console.log(`  Name: "${p.name}"`);
    console.log(`  Slug: "${p.slug}"`);
    console.log(`  Images:`, p.images);
  }
}

main();
