import type {
  Product,
  ProductImage,
  ProductSpecification,
  ProductVariant,
  ProductDocument,
  Document,
  Category,
  Prisma,
} from '@prisma/client';
import type {
  ProductSummary,
  ProductDetail,
  ProductAvailability,
  ProductStatus,
  DocumentType,
} from '@mcpfac/shared-types';

type ProductWithRelations = Product & {
  images: ProductImage[];
  specifications: ProductSpecification[];
  variants?: ProductVariant[];
  productCategories: {
    category: Pick<Category, 'name' | 'slug'>;
  }[];
  productDocuments?: (ProductDocument & { document: Document })[];
};

export function decimalToNumber(value: Prisma.Decimal | null | undefined): number | undefined {
  if (value == null) return undefined;
  return Number(value);
}

export function getPrimaryImageUrl(images: ProductImage[]): string | undefined {
  const primary = images.find((image) => image.isPrimary) ?? images[0];
  return primary?.url;
}

export function toProductSummary(product: ProductWithRelations): ProductSummary {
  const category = product.productCategories[0]?.category;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    casNumber: product.casNumber ?? undefined,
    purity: product.purity ?? undefined,
    price: decimalToNumber(product.retailPrice),
    availability: product.availability as ProductAvailability,
    imageUrl: getPrimaryImageUrl(product.images),
    categoryName: category?.name,
  };
}

export function toProductDetail(
  product: ProductWithRelations,
  relatedProducts: ProductSummary[] = [],
): ProductDetail {
  const summary = toProductSummary(product);

  return {
    ...summary,
    description: product.description ?? undefined,
    shortDescription: product.shortDescription ?? undefined,
    molecularFormula: product.molecularFormula ?? undefined,
    molecularWeight: product.molecularWeight ?? undefined,
    sequence: product.sequence ?? undefined,
    storage: product.storage ?? undefined,
    solubility: product.solubility ?? undefined,
    appearance: product.appearance ?? undefined,
    minimumOrderQuantity: product.minimumOrderQty,
    wholesalePrice: decimalToNumber(product.wholesalePrice),
    distributorPrice: decimalToNumber(product.distributorPrice),
    isFeatured: product.isFeatured,
    status: product.status as ProductStatus,
    images: product.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
      })),
    specifications: product.specifications
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((spec) => ({
        id: spec.id,
        label: spec.label,
        value: spec.value,
        sortOrder: spec.sortOrder,
      })),
    variants: (product.variants ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((variant) => {
        const priceModifier = decimalToNumber(variant.priceModifier) ?? 0;
        const basePrice = decimalToNumber(product.retailPrice);

        return {
          id: variant.id,
          name: variant.name,
          value: variant.value,
          priceModifier,
          price: basePrice != null ? basePrice + priceModifier : undefined,
          stockQuantity: variant.stockQuantity,
          sku: variant.sku ?? undefined,
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder,
        };
      }),
    downloads:
      product.productDocuments?.map((item) => ({
        id: item.document.id,
        name: item.document.title,
        type: item.document.type as DocumentType,
        url: item.document.fileUrl,
        fileSize: item.document.fileSize ?? undefined,
      })) ?? [],
    relatedProducts,
  };
}

export const publishedProductWhere: Prisma.ProductWhereInput = {
  deletedAt: null,
  status: 'PUBLISHED',
  isVisible: true,
};

export const productListInclude = {
  images: {
    orderBy: { sortOrder: 'asc' as const },
  },
  specifications: {
    orderBy: { sortOrder: 'asc' as const },
  },
  productCategories: {
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  },
} satisfies Prisma.ProductInclude;

export const productDetailInclude = {
  ...productListInclude,
  variants: {
    orderBy: { sortOrder: 'asc' as const },
  },
  productDocuments: {
    include: {
      document: true,
    },
  },
} satisfies Prisma.ProductInclude;
