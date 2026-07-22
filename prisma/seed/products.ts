import type { PrismaClient } from '@prisma/client';
import { ProductAvailability, ProductStatus, DocumentPermission, DocumentType } from '@prisma/client';

type SeedProduct = {
  sku: string;
  slug: string;
  name: string;
  categorySlug: string;
  casNumber?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  purity?: string;
  sequence?: string;
  storage?: string;
  solubility?: string;
  appearance?: string;
  shortDescription: string;
  description: string;
  retailPrice: number;
  wholesalePrice?: number;
  availability: ProductAvailability;
  isFeatured?: boolean;
  sortOrder?: number;
  imageLabel: string;
  specifications: { label: string; value: string }[];
  documents?: { title: string; type: DocumentType; fileName: string }[];
};

const PRODUCTS: SeedProduct[] = [
  {
    sku: 'MBT-BPC157-5MG',
    slug: 'bpc-157-5mg',
    name: 'BPC-157 5mg',
    categorySlug: 'research-peptides',
    sequence: 'GEPPPGKPADDAGLV',
    purity: '≥98%',
    storage: '-20°C',
    solubility: 'Sterile water',
    appearance: 'White lyophilized powder',
    shortDescription: 'Body protection compound peptide for tissue regeneration research.',
    description:
      'BPC-157 is a synthetic peptide studied for its regenerative properties in laboratory models. Supplied as lyophilized powder with COA and HPLC verification.',
    retailPrice: 89.0,
    wholesalePrice: 72.0,
    availability: ProductAvailability.IN_STOCK,
    isFeatured: true,
    sortOrder: 1,
    imageLabel: 'BPC-157',
    specifications: [
      { label: 'Form', value: 'Lyophilized powder' },
      { label: 'Unit Size', value: '5 mg' },
      { label: 'Purity', value: '≥98% (HPLC)' },
    ],
    documents: [
      { title: 'BPC-157 COA', type: DocumentType.COA, fileName: 'bpc-157-coa.pdf' },
      { title: 'BPC-157 HPLC Report', type: DocumentType.HPLC, fileName: 'bpc-157-hplc.pdf' },
    ],
  },
  {
    sku: 'MBT-TB500-5MG',
    slug: 'tb-500-5mg',
    name: 'TB-500 5mg',
    categorySlug: 'research-peptides',
    sequence: 'ACSDKPVGSGKGKN',
    purity: '≥98%',
    storage: '-20°C',
    solubility: 'Bacteriostatic water',
    appearance: 'White lyophilized powder',
    shortDescription: 'Thymosin beta-4 fragment for cellular mobility research.',
    description:
      'TB-500 is supplied for in-vitro research investigating cellular migration and tissue repair pathways in controlled laboratory settings.',
    retailPrice: 95.0,
    wholesalePrice: 78.0,
    availability: ProductAvailability.IN_STOCK,
    isFeatured: true,
    sortOrder: 2,
    imageLabel: 'TB-500',
    specifications: [
      { label: 'Form', value: 'Lyophilized powder' },
      { label: 'Unit Size', value: '5 mg' },
      { label: 'Purity', value: '≥98% (HPLC)' },
    ],
  },
  {
    sku: 'MBT-SEMA-5MG',
    slug: 'semaglutide-5mg',
    name: 'Semaglutide 5mg',
    categorySlug: 'research-peptides',
    purity: '≥99%',
    storage: '-20°C',
    solubility: 'Sterile water',
    appearance: 'White lyophilized powder',
    shortDescription: 'GLP-1 receptor agonist peptide for metabolic pathway research.',
    description:
      'Research-grade semaglutide peptide for laboratory investigation of GLP-1 receptor signaling and metabolic regulation models.',
    retailPrice: 149.0,
    wholesalePrice: 125.0,
    availability: ProductAvailability.LOW_STOCK,
    isFeatured: true,
    sortOrder: 3,
    imageLabel: 'Semaglutide',
    specifications: [
      { label: 'Form', value: 'Lyophilized powder' },
      { label: 'Unit Size', value: '5 mg' },
      { label: 'Purity', value: '≥99% (HPLC)' },
    ],
  },
  {
    sku: 'MBT-MELANOTAN-II-10MG',
    slug: 'melanotan-ii-10mg',
    name: 'Melanotan II 10mg',
    categorySlug: 'research-peptides',
    purity: '≥98%',
    storage: '-20°C',
    solubility: 'Bacteriostatic water',
    appearance: 'White lyophilized powder',
    shortDescription: 'Synthetic melanocortin peptide for receptor binding studies.',
    description:
      'Melanotan II is provided for controlled receptor binding and signaling research in accredited laboratory environments.',
    retailPrice: 79.0,
    availability: ProductAvailability.IN_STOCK,
    sortOrder: 4,
    imageLabel: 'Melanotan II',
    specifications: [
      { label: 'Form', value: 'Lyophilized powder' },
      { label: 'Unit Size', value: '10 mg' },
    ],
  },
  {
    sku: 'MBT-METFORMIN-500MG',
    slug: 'metformin-hcl-500mg',
    name: 'Metformin HCl 500mg',
    categorySlug: 'research-chemicals',
    casNumber: '1115-70-4',
    molecularFormula: 'C4H11N5·HCl',
    molecularWeight: '165.62 g/mol',
    purity: '≥99%',
    storage: 'Room temperature',
    appearance: 'White crystalline powder',
    shortDescription: 'Biguanide compound for glucose metabolism research.',
    description:
      'Metformin hydrochloride supplied as analytical-grade powder for metabolic and cellular energy pathway studies.',
    retailPrice: 45.0,
    availability: ProductAvailability.IN_STOCK,
    isFeatured: true,
    sortOrder: 1,
    imageLabel: 'Metformin',
    specifications: [
      { label: 'Grade', value: 'Research grade' },
      { label: 'Unit Size', value: '500 mg' },
    ],
    documents: [
      { title: 'Metformin MSDS', type: DocumentType.MSDS, fileName: 'metformin-msds.pdf' },
    ],
  },
  {
    sku: 'MBT-DMSO-100ML',
    slug: 'dmso-100ml',
    name: 'DMSO 100mL',
    categorySlug: 'research-chemicals',
    casNumber: '67-68-5',
    molecularFormula: 'C2H6OS',
    molecularWeight: '78.13 g/mol',
    purity: '≥99.9%',
    storage: 'Room temperature, sealed',
    appearance: 'Clear colorless liquid',
    shortDescription: 'High-purity dimethyl sulfoxide solvent for laboratory use.',
    description:
      'Pharmaceutical-grade DMSO solvent suitable for peptide reconstitution, cryopreservation, and analytical sample preparation.',
    retailPrice: 32.0,
    availability: ProductAvailability.IN_STOCK,
    sortOrder: 2,
    imageLabel: 'DMSO',
    specifications: [
      { label: 'Volume', value: '100 mL' },
      { label: 'Purity', value: '≥99.9%' },
    ],
  },
  {
    sku: 'MBT-PIPETTE-TIPS-1000',
    slug: 'universal-pipette-tips-1000',
    name: 'Universal Pipette Tips (1000 pcs)',
    categorySlug: 'laboratory-supplies',
    shortDescription: 'Low-retention universal fit pipette tips for 10–1000 µL.',
    description:
      'RNase/DNase-free pipette tips with low retention surface, compatible with major pipette brands for routine laboratory workflows.',
    retailPrice: 58.0,
    availability: ProductAvailability.IN_STOCK,
    sortOrder: 1,
    imageLabel: 'Pipette Tips',
    specifications: [
      { label: 'Quantity', value: '1000 tips' },
      { label: 'Volume Range', value: '10–1000 µL' },
    ],
  },
  {
    sku: 'MBT-CENTRIFUGE-50ML',
    slug: 'centrifuge-tubes-50ml-500',
    name: 'Centrifuge Tubes 50mL (500 pcs)',
    categorySlug: 'laboratory-supplies',
    shortDescription: 'Conical centrifuge tubes with leak-proof caps.',
    description:
      'Graduated 50 mL centrifuge tubes manufactured from clear polypropylene for sample processing and storage.',
    retailPrice: 74.0,
    availability: ProductAvailability.MADE_TO_ORDER,
    sortOrder: 2,
    imageLabel: 'Centrifuge Tubes',
    specifications: [
      { label: 'Capacity', value: '50 mL' },
      { label: 'Quantity', value: '500 tubes' },
    ],
  },
  {
    sku: 'MBT-CAFFEINE-STD-1G',
    slug: 'caffeine-reference-standard-1g',
    name: 'Caffeine Reference Standard 1g',
    categorySlug: 'analytical-standards',
    casNumber: '58-08-2',
    molecularFormula: 'C8H10N4O2',
    molecularWeight: '194.19 g/mol',
    purity: '≥99.8%',
    storage: 'Room temperature, desiccated',
    appearance: 'White powder',
    shortDescription: 'Certified caffeine reference material for analytical validation.',
    description:
      'Traceable caffeine reference standard for HPLC/GC method validation, system suitability, and quantitative analysis.',
    retailPrice: 120.0,
    availability: ProductAvailability.IN_STOCK,
    isFeatured: true,
    sortOrder: 1,
    imageLabel: 'Caffeine Standard',
    specifications: [
      { label: 'Certification', value: 'COA included' },
      { label: 'Unit Size', value: '1 g' },
    ],
    documents: [
      {
        title: 'Caffeine Standard COA',
        type: DocumentType.COA,
        fileName: 'caffeine-standard-coa.pdf',
      },
    ],
  },
  {
    sku: 'MBT-ASPIRIN-STD-1G',
    slug: 'aspirin-reference-standard-1g',
    name: 'Aspirin Reference Standard 1g',
    categorySlug: 'analytical-standards',
    casNumber: '50-78-2',
    molecularFormula: 'C9H8O4',
    molecularWeight: '180.16 g/mol',
    purity: '≥99.5%',
    storage: 'Room temperature',
    appearance: 'White crystalline powder',
    shortDescription: 'Acetylsalicylic acid reference standard for QC laboratories.',
    description:
      'Analytical reference standard suitable for pharmaceutical QC, method development, and inter-lab comparison studies.',
    retailPrice: 98.0,
    availability: ProductAvailability.IN_STOCK,
    sortOrder: 2,
    imageLabel: 'Aspirin Standard',
    specifications: [
      { label: 'Certification', value: 'COA included' },
      { label: 'Unit Size', value: '1 g' },
    ],
  },
];

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

function imageUrl(slug: string, label: string): string {
  if (SUPABASE_PRODUCT_IMAGES[slug]) {
    return SUPABASE_PRODUCT_IMAGES[slug];
  }
  const encoded = encodeURIComponent(label);
  return `https://placehold.co/600x600/1B4332/FFFFFF?text=${encoded}`;
}

export async function seedProducts(
  prisma: PrismaClient,
  categoryIds: Record<string, string>,
): Promise<void> {
  for (const product of PRODUCTS) {
    const categoryId = categoryIds[product.categorySlug];
    if (!categoryId) {
      throw new Error(`Missing category seed for slug: ${product.categorySlug}`);
    }

    const record = await prisma.product.upsert({
      where: { sku: product.sku },
      create: {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        casNumber: product.casNumber,
        molecularFormula: product.molecularFormula,
        molecularWeight: product.molecularWeight,
        purity: product.purity,
        sequence: product.sequence,
        storage: product.storage,
        solubility: product.solubility,
        appearance: product.appearance,
        shortDescription: product.shortDescription,
        description: product.description,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        availability: product.availability,
        status: ProductStatus.PUBLISHED,
        isVisible: true,
        isFeatured: product.isFeatured ?? false,
        sortOrder: product.sortOrder ?? 0,
        stockQuantity: 100,
        minimumOrderQty: 1,
      },
      update: {
        slug: product.slug,
        name: product.name,
        casNumber: product.casNumber,
        molecularFormula: product.molecularFormula,
        molecularWeight: product.molecularWeight,
        purity: product.purity,
        sequence: product.sequence,
        storage: product.storage,
        solubility: product.solubility,
        appearance: product.appearance,
        shortDescription: product.shortDescription,
        description: product.description,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        availability: product.availability,
        status: ProductStatus.PUBLISHED,
        isVisible: true,
        isFeatured: product.isFeatured ?? false,
        sortOrder: product.sortOrder ?? 0,
        deletedAt: null,
      },
    });

    await prisma.productCategoryPivot.upsert({
      where: {
        productId_categoryId: {
          productId: record.id,
          categoryId,
        },
      },
      create: {
        productId: record.id,
        categoryId,
      },
      update: {},
    });

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: record.id, isPrimary: true },
    });

    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          productId: record.id,
          url: imageUrl(product.slug, product.imageLabel),
          alt: product.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    } else {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: {
          url: imageUrl(product.slug, product.imageLabel),
          alt: product.name,
        },
      });
    }

    for (const [index, spec] of product.specifications.entries()) {
      const existingSpec = await prisma.productSpecification.findFirst({
        where: {
          productId: record.id,
          label: spec.label,
        },
      });

      if (existingSpec) {
        await prisma.productSpecification.update({
          where: { id: existingSpec.id },
          data: {
            value: spec.value,
            sortOrder: index,
          },
        });
      } else {
        await prisma.productSpecification.create({
          data: {
            productId: record.id,
            label: spec.label,
            value: spec.value,
            sortOrder: index,
          },
        });
      }
    }

    for (const doc of product.documents ?? []) {
      let document = await prisma.document.findFirst({
        where: { fileName: doc.fileName },
      });

      if (document) {
        document = await prisma.document.update({
          where: { id: document.id },
          data: {
            title: doc.title,
            type: doc.type,
            permission: DocumentPermission.PUBLIC,
            fileUrl: `/documents/${doc.fileName}`,
            isApproved: true,
          },
        });
      } else {
        document = await prisma.document.create({
          data: {
            title: doc.title,
            type: doc.type,
            permission: DocumentPermission.PUBLIC,
            fileUrl: `/documents/${doc.fileName}`,
            fileName: doc.fileName,
            isApproved: true,
          },
        });
      }

      await prisma.productDocument.upsert({
        where: {
          productId_documentId: {
            productId: record.id,
            documentId: document.id,
          },
        },
        create: {
          productId: record.id,
          documentId: document.id,
        },
        update: {},
      });
    }
  }
}
