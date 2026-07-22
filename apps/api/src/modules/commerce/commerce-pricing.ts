import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ProductAvailability,
  ProductStatus,
  type Product,
  type ProductImage,
  type ProductVariant,
} from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { decimalToNumber, getPrimaryImageUrl } from '@/modules/products/products.mapper';

export type PricedProduct = {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  minimumOrderQty: number;
  imageUrl?: string;
  availability: ProductAvailability;
  variantId?: string;
  variantLabel?: string;
};

type ProductForPricing = Pick<Product, 'id' | 'name' | 'sku' | 'slug' | 'retailPrice'> & {
  images: Array<Pick<ProductImage, 'url' | 'isPrimary'>>;
  variants?: Array<
    Pick<ProductVariant, 'id' | 'name' | 'value' | 'sku' | 'priceModifier' | 'isDefault' | 'sortOrder'>
  >;
};

@Injectable()
export class CommercePricingService {
  constructor(private readonly prisma: PrismaService) {}

  async loadSellableProduct(
    productId: string,
    options?: { requirePrice?: boolean; variantId?: string | null },
  ): Promise<PricedProduct> {
    const requirePrice = options?.requirePrice ?? true;
    const variantId = options?.variantId ?? undefined;

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        status: ProductStatus.PUBLISHED,
        isVisible: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        retailPrice: true,
        minimumOrderQty: true,
        availability: true,
        images: {
          take: 1,
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          select: { url: true, isPrimary: true },
        },
        variants: {
          ...(variantId ? { where: { id: variantId } } : {}),
          orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }],
          take: 1,
          select: {
            id: true,
            name: true,
            value: true,
            sku: true,
            priceModifier: true,
            isDefault: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (
      product.availability === ProductAvailability.UNAVAILABLE ||
      product.availability === ProductAvailability.DISCONTINUED
    ) {
      throw new BadRequestException('Product is not available for purchase');
    }

    const basePrice = decimalToNumber(product.retailPrice);
    let unitPrice = basePrice;
    const resolvedVariant = product.variants[0];
    let sku = product.sku;

    if (variantId && !resolvedVariant) {
      throw new BadRequestException('Selected variant is not valid for this product');
    }

    if (resolvedVariant) {
      if (basePrice == null || !Number.isFinite(basePrice)) {
        unitPrice = undefined;
      } else {
        unitPrice = basePrice + (decimalToNumber(resolvedVariant.priceModifier) ?? 0);
      }
      sku = resolvedVariant.sku || product.sku;
    }

    if (requirePrice && (unitPrice == null || !Number.isFinite(unitPrice))) {
      throw new BadRequestException(
        'Product has no list price — request a quote instead',
      );
    }

    return {
      id: product.id,
      name: product.name,
      sku,
      unitPrice: unitPrice ?? 0,
      minimumOrderQty: product.minimumOrderQty,
      imageUrl: getPrimaryImageUrl(product.images),
      availability: product.availability,
      variantId: resolvedVariant?.id,
      variantLabel: resolvedVariant
        ? `${resolvedVariant.name}: ${resolvedVariant.value}`
        : undefined,
    };
  }

  assertQuantity(product: PricedProduct, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Quantity must be a positive integer');
    }

    if (quantity < product.minimumOrderQty) {
      throw new BadRequestException(
        `Minimum order quantity for ${product.sku} is ${product.minimumOrderQty}`,
      );
    }
  }

  toCartLine(
    cartItemId: string,
    product: ProductForPricing,
    quantity: number,
    variant?: Pick<
      ProductVariant,
      'id' | 'name' | 'value' | 'sku' | 'priceModifier'
    > | null,
  ): {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    productSlug?: string;
    productImage?: string;
    variantId?: string;
    variantLabel?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  } {
    const basePrice = decimalToNumber(product.retailPrice) ?? 0;
    const priceModifier = variant ? decimalToNumber(variant.priceModifier) ?? 0 : 0;
    const unitPrice = basePrice + priceModifier;

    return {
      id: cartItemId,
      productId: product.id,
      productName: product.name,
      productSku: variant?.sku || product.sku,
      productSlug: product.slug,
      productImage: getPrimaryImageUrl(product.images),
      variantId: variant?.id,
      variantLabel: variant ? `${variant.name}: ${variant.value}` : undefined,
      quantity,
      unitPrice,
      totalPrice: Number((unitPrice * quantity).toFixed(2)),
    };
  }
}
