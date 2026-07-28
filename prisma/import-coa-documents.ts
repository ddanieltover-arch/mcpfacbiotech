/**
 * Import COA PDFs/JPEGs from /COA into apps/web/public/documents
 * and register Document + ProductDocument rows in the live DB.
 *
 * Usage:
 *   pnpm exec ts-node --project prisma/tsconfig.seed.json --transpile-only prisma/import-coa-documents.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, DocumentType, DocumentPermission } from '@prisma/client';

const prisma = new PrismaClient();

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'COA');
const DEST_DIR = path.join(ROOT, 'apps', 'web', 'public', 'documents');

type CoaEntry = {
  /** Filename inside COA/ */
  source: string;
  /** Clean public filename */
  fileName: string;
  title: string;
  description: string;
  /** Product slugs to attach (best catalog matches) */
  productSlugs: string[];
};

const ENTRIES: CoaEntry[] = [
  // ── Freedom Diagnostics (Huatai) PDFs ──────────────────────────────────────
  {
    source: 'Adamax-10.pdf',
    fileName: 'adamax-10mg-coa.pdf',
    title: 'Adamax 10mg COA',
    description: 'Freedom Diagnostics · Lot MA5X521 · Purity 99.91% · Accession Huat2605180434',
    productSlugs: [], // no Adamax SKU in catalog yet
  },
  {
    source: 'BPC-10 (2).pdf',
    fileName: 'bpc-157-10mg-coa-freedom.pdf',
    title: 'BPC-157 10mg COA',
    description: 'Freedom Diagnostics · Lot Blue Cap · Purity 99.85% · Accession Huat2605180449',
    productSlugs: ['bpc-157', 'bpc-157-5mg'],
  },
  {
    source: 'CJCIPA-10 (2).pdf',
    fileName: 'cjc-ipa-5mg-5mg-coa-freedom.pdf',
    title: 'CJC-1295 w/o DAC + Ipamorelin 5mg/5mg COA',
    description: 'Freedom Diagnostics · Lot MC5P454 · Purity 99.95% · Accession Huat2605180440',
    productSlugs: ['cjc-ipa-no-dac', 'cjc-1295-without-dac-ipa-5mg', 'cjc-1295-ipamorelin'],
  },
  {
    source: 'Huat2605180476.pdf',
    fileName: 'glow-70mg-coa.pdf',
    title: 'GLOW 70mg COA',
    description:
      'Freedom Diagnostics · Lot Green Cap · GHK-Cu/BPC-157/TB-500 · Purity 99.88% · Accession Huat2605180476',
    productSlugs: ['glow', 'glow-10mg-70mg-10mg', 'glow-bpc-157-ghk-cu-tb-500-blend'],
  },
  {
    source: 'Huat2605180479.pdf',
    fileName: 'klow-80mg-coa.pdf',
    title: 'KLOW 80mg COA',
    description:
      'Freedom Diagnostics · Lot Yellow Cap · GHK-Cu/KPV/TB-500/BPC-157 · Purity 99.56% · Accession Huat2605180479',
    productSlugs: ['klow', 'klow-10mg-10mg-10mg-50mg'],
  },
  {
    source: 'HuatKPVCOA .pdf',
    fileName: 'kpv-10mg-coa-freedom.pdf',
    title: 'KPV 10mg COA',
    description: 'Freedom Diagnostics · Lot MP5H511 · Purity 99.23% · Accession Huat2605210053',
    productSlugs: ['kpv'],
  },
  {
    source: 'NAD-1000 (2).pdf',
    fileName: 'nad-plus-1000mg-coa.pdf',
    title: 'NAD+ 1000mg COA',
    description: 'Freedom Diagnostics · Lot MN5J297 · Purity 99.94% · Accession Huat2605180431',
    productSlugs: ['nad-plus', 'nad-nicotinamide-adenine-dinucleotide'],
  },
  {
    source: 'Reta-10 (2).pdf',
    fileName: 'retatrutide-10mg-coa-freedom.pdf',
    title: 'Retatrutide (GLP-3RT) 10mg COA',
    description: 'Freedom Diagnostics · Lot MR5E512 · Purity 99.68% · Accession Huat2605180467',
    productSlugs: ['retatrutide', 'peptide-r', 'glp-3-r'],
  },
  {
    source: 'Reta-20 (2).pdf',
    fileName: 'retatrutide-20mg-coa-freedom.pdf',
    title: 'Retatrutide (GLP-3RT) 20mg COA',
    description: 'Freedom Diagnostics · Lot MR5E513 · Purity 99.87% · Accession Huat2605180470',
    productSlugs: ['retatrutide', 'peptide-r-20mg', 'glp-3-r'],
  },
  {
    source: 'Reta-30 (2).pdf',
    fileName: 'retatrutide-30mg-coa-freedom.pdf',
    title: 'Retatrutide (GLP-3RT) 30mg COA',
    description: 'Freedom Diagnostics · Lot MR5E514 · Purity 99.89% · Accession Huat2605180473',
    productSlugs: ['retatrutide', 'glp-3-r'],
  },
  {
    source: 'TB-10 (2).pdf',
    fileName: 'tb-500-10mg-coa.pdf',
    title: 'TB-500 10mg COA',
    description: 'Freedom Diagnostics · Lot MT5B245 · Purity 99.53% · Accession Huat2605180458',
    productSlugs: ['tb-500-10mg', 'tb-500', 'tb-500-tb4', 'tb-500-tb-4'],
  },
  {
    source: 'Tesa-10.pdf',
    fileName: 'tesamorelin-10mg-coa-freedom.pdf',
    title: 'Tesamorelin 10mg COA',
    description: 'Freedom Diagnostics · Lot MT5M546 · Purity 99.54% · Accession Huat2605180461',
    productSlugs: ['tesamorelin', 'tesmorelin'],
  },
  {
    source: 'Tesa-20.pdf',
    fileName: 'tesamorelin-20mg-coa-freedom.pdf',
    title: 'Tesamorelin 20mg COA',
    description: 'Freedom Diagnostics · Lot Clear Blue Cap · Purity 99.88% · Accession Huat2605180464',
    productSlugs: ['tesamorelin', 'tesmorelin'],
  },

  // ── Ethos Analytics (WhatsApp JPEG scans) ──────────────────────────────────
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.48.jpeg',
    fileName: 'tirzepatide-60mg-coa-ethos.jpeg',
    title: 'Tirzepatide 60mg COA',
    description: 'Ethos Analytics · Lot ET-260513-H60 · Sample 26EA0515-037 · Purity >99%',
    productSlugs: ['tirzepatide', 'peptide-t-60mg', 'glp-2-t'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.48 (1).jpeg',
    fileName: 'vip-10mg-coa-ethos.jpeg',
    title: 'VIP 10mg COA',
    description: 'Ethos Analytics · Lot EV-260528-H10 · Sample 26EA0529-019 · Purity >99%',
    productSlugs: ['vip'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.49.jpeg',
    fileName: 'kpv-10mg-coa-ethos.jpeg',
    title: 'KPV 10mg COA',
    description: 'Ethos Analytics · Lot EK-260404-H10 · Sample 26EA0406-027 · Purity >98%',
    productSlugs: ['kpv'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.49 (1).jpeg',
    fileName: 'tesamorelin-10mg-coa-ethos.jpeg',
    title: 'Tesamorelin 10mg COA',
    description: 'Ethos Analytics · Lot ETM-260512-H10 · Sample 26EA0514-032 · Purity >99%',
    productSlugs: ['tesamorelin', 'tesmorelin'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.50.jpeg',
    fileName: 'tirzepatide-5mg-coa-ethos.jpeg',
    title: 'Tirzepatide 5mg COA',
    description: 'Ethos Analytics · Lot ET-260518-H5 · Sample 26EA0522-043 · Purity >99%',
    productSlugs: ['tirzepatide', 'peptide-t', 'glp-2-t'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.50 (1).jpeg',
    fileName: 'ipamorelin-10mg-coa-ethos.jpeg',
    title: 'Ipamorelin 10mg COA',
    description: 'Ethos Analytics · Lot EIP-260513-H10 · Sample 26EA0515-036 · Purity >99%',
    productSlugs: ['ipamorelin'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.50 (2).jpeg',
    fileName: 'ghk-cu-50mg-coa-ethos.jpeg',
    title: 'GHK-Cu 50mg COA',
    description: 'Ethos Analytics · Lot EGHK-260512-H50 · Sample 26EA0514-033 · Purity >99%',
    productSlugs: ['ghk-cu'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.50 (3).jpeg',
    fileName: 'cagrilintide-5mg-coa-ethos.jpeg',
    title: 'Cagrilintide 5mg COA',
    description: 'Ethos Analytics · Lot EC-260416-H5 · Sample 26EA0422-014 · Purity >99%',
    productSlugs: ['cagrilintide'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.51.jpeg',
    fileName: 'tirzepatide-15mg-coa-ethos.jpeg',
    title: 'Tirzepatide (GLP-2Tz) 15mg COA',
    description: 'Ethos Analytics · Lot T15-0326 · Sample 26EA0305-019 · Purity >98%',
    productSlugs: ['tirzepatide', 'peptide-t-15mg', 'glp-2-t'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.51 (1).jpeg',
    fileName: 'retatrutide-10mg-coa-ethos.jpeg',
    title: 'Retatrutide (GLP3Rt) 10mg COA',
    description: 'Ethos Analytics · Lot ER-260327-H10 · Sample 26EA0330-021 · Purity >98%',
    productSlugs: ['retatrutide', 'peptide-r', 'glp-3-r'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.51 (2).jpeg',
    fileName: 'dsip-5mg-coa-ethos.jpeg',
    title: 'DSIP 5mg COA',
    description: 'Ethos Analytics · Lot ED-260326-H5 · Sample 26EA0330-022 · Purity >98%',
    productSlugs: ['dsip', 'dsip-5mg'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.51 (3).jpeg',
    fileName: 'ss-31-10mg-coa-ethos.jpeg',
    title: 'SS-31 10mg COA',
    description: 'Ethos Analytics · Lot ESS-260512-H10 · Sample 26EA0514-029 · Purity >99%',
    productSlugs: ['ss-31'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.52.jpeg',
    fileName: 'retatrutide-20mg-coa-ethos.jpeg',
    title: 'Retatrutide 20mg COA',
    description: 'Ethos Analytics · Lot RT032620H · Sample 26EA0402-019 · Purity >98%',
    productSlugs: ['retatrutide', 'peptide-r-20mg', 'glp-3-r'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.52 (1).jpeg',
    fileName: 'bpc-157-10mg-coa-ethos.jpeg',
    title: 'BPC-157 10mg COA',
    description: 'Ethos Analytics · Lot EB-260518-H10 · Sample 26EA0522-042 · Purity >99%',
    productSlugs: ['bpc-157', 'bpc-157-5mg'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.52 (2).jpeg',
    fileName: 'cjc-ipa-5mg-5mg-coa-ethos.jpeg',
    title: 'CJC/Ipamorelin 5mg/5mg COA',
    description: 'Ethos Analytics · Lot ECI-260512-H10 · Sample 26EA0514-030 · Purity >99%',
    productSlugs: ['cjc-ipa-no-dac', 'cjc-1295-without-dac-ipa-5mg', 'cjc-1295-ipamorelin'],
  },
  {
    source: 'WhatsApp Image 2026-07-28 at 11.57.52 (3).jpeg',
    fileName: 'melanotan-ii-10mg-coa-ethos.jpeg',
    title: 'Melanotan II 10mg COA',
    description: 'Ethos Analytics · Lot MT2-H0426 · Sample 26EA0427-065 · Purity >99%',
    productSlugs: ['melanotan-ii', 'melanotan', 'mt-2-melanotan-2-acetate', 'melanoten-2'],
  },
];

function mimeFor(fileName: string): string {
  if (fileName.toLowerCase().endsWith('.pdf')) return 'application/pdf';
  if (fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.jpg')) {
    return 'image/jpeg';
  }
  return 'application/octet-stream';
}

async function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Missing source folder: ${SOURCE_DIR}`);
  }
  fs.mkdirSync(DEST_DIR, { recursive: true });

  const allProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, name: true },
  });
  const bySlug = new Map(allProducts.map((p) => [p.slug, p]));

  let copied = 0;
  let upserted = 0;
  let linked = 0;
  const missingProducts: string[] = [];
  const missingFiles: string[] = [];

  for (const entry of ENTRIES) {
    const srcPath = path.join(SOURCE_DIR, entry.source);
    if (!fs.existsSync(srcPath)) {
      missingFiles.push(entry.source);
      console.warn(`SKIP missing file: ${entry.source}`);
      continue;
    }

    const destPath = path.join(DEST_DIR, entry.fileName);
    fs.copyFileSync(srcPath, destPath);
    const fileSize = fs.statSync(destPath).size;
    copied += 1;

    const fileUrl = `/documents/${entry.fileName}`;
    const existing = await prisma.document.findFirst({
      where: { fileName: entry.fileName, deletedAt: null },
    });

    let documentId: string;
    if (existing) {
      const updated = await prisma.document.update({
        where: { id: existing.id },
        data: {
          title: entry.title,
          type: DocumentType.COA,
          permission: DocumentPermission.PUBLIC,
          fileUrl,
          fileSize,
          mimeType: mimeFor(entry.fileName),
          description: entry.description,
          isApproved: true,
          deletedAt: null,
        },
      });
      documentId = updated.id;
    } else {
      const created = await prisma.document.create({
        data: {
          title: entry.title,
          type: DocumentType.COA,
          permission: DocumentPermission.PUBLIC,
          fileUrl,
          fileName: entry.fileName,
          fileSize,
          mimeType: mimeFor(entry.fileName),
          description: entry.description,
          isApproved: true,
          version: '1.0',
          language: 'en',
        },
      });
      documentId = created.id;
    }
    upserted += 1;

    const resolvedSlugs: string[] = [];
    for (const slug of entry.productSlugs) {
      const product = bySlug.get(slug);
      if (!product) {
        missingProducts.push(`${entry.fileName} → ${slug}`);
        continue;
      }
      await prisma.productDocument.upsert({
        where: {
          productId_documentId: {
            productId: product.id,
            documentId,
          },
        },
        create: { productId: product.id, documentId },
        update: {},
      });
      linked += 1;
      resolvedSlugs.push(`${product.name} (${slug})`);
    }

    console.log(
      `✓ ${entry.fileName} → ${resolvedSlugs.length ? resolvedSlugs.join(', ') : '(no product link)'}`,
    );
  }

  console.log('\n── Summary ──');
  console.log(`Copied files: ${copied}`);
  console.log(`Documents upserted: ${upserted}`);
  console.log(`Product links: ${linked}`);
  if (missingFiles.length) console.log(`Missing source files: ${missingFiles.join('; ')}`);
  if (missingProducts.length) {
    console.log('Unresolved product slugs:');
    for (const m of missingProducts) console.log(`  - ${m}`);
  }

  const adamax = ENTRIES.find((e) => e.fileName.startsWith('adamax'));
  if (adamax && adamax.productSlugs.length === 0) {
    console.log('\nNote: Adamax 10mg COA registered but no Adamax product exists in catalog.');
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
