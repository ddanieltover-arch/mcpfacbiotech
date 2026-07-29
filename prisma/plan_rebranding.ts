import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Categories classification
const PEPTIDE_CATEGORIES = [
  'Primary Peptides',
  'PEPTIDES',
  'Growth & Repair',
  'Research Peptides',
  'Peptide M',
  'Peptide T',
  'Cognitive & Neuro',
  'Mitochondrial & Cellular Energy',
  'Metabolic',
  'Immune & Inflammatory',
  'Reproductive & Neuroendocrine',
  'Regeneration & Longevity',
  'Oncology & Cell Fate',
  'Dermal',
];

const ORAL_CATEGORIES = [
  'ORALS',
  'SARMS',
  'SKIN CARE',
  'ANTI-ESTROGEN',
];

async function main() {
  const dbDumpPath = path.join(__dirname, '../all_products_db.json');
  if (!fs.existsSync(dbDumpPath)) {
    console.error('all_products_db.json not found!');
    return;
  }
  const originalProducts = JSON.parse(fs.readFileSync(dbDumpPath, 'utf-8'));
  const originalUrlMap = new Map<string, string>();
  for (const op of originalProducts) {
    if (op.images && op.images[0]?.url) {
      originalUrlMap.set(op.slug, op.images[0].url);
    }
  }

  const products = await prisma.product.findMany({
    include: {
      productCategories: {
        include: {
          category: true,
        },
      },
    },
  });

  const localImagesDir = path.join(__dirname, '../apps/web/public/images/products');
  const localFiles = new Set(fs.readdirSync(localImagesDir));

  const planSummary = products.map((p) => {
    const categoryName = p.productCategories[0]?.category?.name || 'NO_CATEGORY';
    const legacyUrl = originalUrlMap.get(p.slug) || '';
    const hasLegacyAsset = legacyUrl.includes('tbgmkqklkshkjfhcqtzz');

    let action = 'UNKNOWN';
    let fileExtension = 'png';

    if (hasLegacyAsset) {
      action = 'DOWNLOAD_LEGACY';
      fileExtension = legacyUrl.endsWith('.jpg') || legacyUrl.endsWith('.jpeg') ? 'jpg' : 'png';
    } else if (categoryName === 'ACCESSORIES' || p.slug.includes('syringe') || p.slug.includes('cooler') || p.slug.includes('case')) {
      // Accessories/Supplies
      if (p.slug.includes('syringe')) {
        action = 'USE_INSULIN_SYRINGE_IMAGE'; // reuse insulin-syringes-10-pack.png
      } else if (p.slug.includes('cooler')) {
        action = 'USE_COOLER_IMAGE'; // reuse portable-insulin-cooler-case.png
      } else if (p.slug.includes('case')) {
        action = 'USE_TRAVEL_CASE_IMAGE'; // reuse travel-cold-case.png
      } else {
        action = 'USE_GENERIC_SUPPLY_IMAGE';
      }
    } else if (PEPTIDE_CATEGORIES.includes(categoryName)) {
      action = 'RENDER_VIAL';
    } else if (ORAL_CATEGORIES.includes(categoryName)) {
      action = 'RENDER_BOTTLE';
    } else {
      action = 'RENDER_VIAL_FALLBACK';
    }

    // Check if we already have a local file matching the slug
    const localPngExists = localFiles.has(`${p.slug}.png`);
    const localJpgExists = localFiles.has(`${p.slug}.jpg`);
    const alreadyExists = localPngExists || localJpgExists;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: categoryName,
      legacyUrl,
      hasLegacyAsset,
      action,
      alreadyExists,
      existingFile: localPngExists ? `${p.slug}.png` : (localJpgExists ? `${p.slug}.jpg` : 'none'),
    };
  });

  console.log(`Planned actions for ${planSummary.length} products:`);
  
  const actionCounts: Record<string, number> = {};
  for (const p of planSummary) {
    actionCounts[p.action] = (actionCounts[p.action] || 0) + 1;
  }
  console.log('Action counts:', actionCounts);

  // Write plan to JSON file
  fs.writeFileSync(
    path.join(__dirname, 'rebranding_plan.json'),
    JSON.stringify(planSummary, null, 2),
    'utf-8'
  );
  console.log('Wrote plan to rebranding_plan.json');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
