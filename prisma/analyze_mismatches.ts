import * as fs from 'fs';
import * as path from 'path';

interface ProductMapping {
  id: string;
  name: string;
  slug: string;
  category: string;
  imageUrl: string;
}

function main() {
  const filePath = path.join(__dirname, 'product_mappings_output.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  const mappings: ProductMapping[] = JSON.parse(fileContent);

  let outputText = `Analyzing ${mappings.length} mappings...\n`;

  // Group by category
  const categoriesMap: Record<string, ProductMapping[]> = {};
  for (const item of mappings) {
    if (!categoriesMap[item.category]) {
      categoriesMap[item.category] = [];
    }
    categoriesMap[item.category].push(item);
  }

  for (const [catName, items] of Object.entries(categoriesMap)) {
    outputText += `\n========================================\n`;
    outputText += `CATEGORY: ${catName} (${items.length} items)\n`;
    outputText += `========================================\n`;
    
    // We want to print all of them for categories that might be mismatched
    if (['Sterile Supplies', 'Lab Consumables', 'Lab Equipment', 'Lab Safety Supplies', 'Laboratory Glassware', 'Temperature Control', 'Sterile Pipettes', 'Sterile Culture Plates', 'Accessories', 'Supplies', 'Liquid Solutes', 'Oral Tablets', 'Peptide Blends', 'Lyophilized Peptides'].includes(catName) || items.length < 30) {
      for (const item of items) {
        outputText += `  - Name: "${item.name}"\n`;
        outputText += `    Slug: "${item.slug}"\n`;
        outputText += `    Image: "${path.basename(item.imageUrl)}"\n`;
      }
    } else {
      outputText += `  (Showing first 5 items out of ${items.length} to avoid huge output)\n`;
      for (const item of items.slice(0, 5)) {
        outputText += `  - Name: "${item.name}"\n`;
        outputText += `    Slug: "${item.slug}"\n`;
        outputText += `    Image: "${path.basename(item.imageUrl)}"\n`;
      }
    }
  }

  fs.writeFileSync(path.join(__dirname, 'mismatches_summary.txt'), outputText, 'utf-8');
  console.log('Successfully wrote to mismatches_summary.txt');
}

main();
