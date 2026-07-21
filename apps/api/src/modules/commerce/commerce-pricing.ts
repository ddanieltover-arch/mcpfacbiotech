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
};

type ProductForPricing = Product & { images: ProductImage[] };

@Injectable()
export class CommercePricingService {
  constructor(private readonly prisma: PrismaService) {}

  async loadSellableProduct(
    productId: string,
    options?: { requirePrice?: boolean },
  ): Promise<PricedProduct> {
    const requirePrice = options?.requirePrice ?? true;

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        status: ProductStatus.PUBLISHED,
        isVisible: true,
      },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
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

    const unitPrice = decimalToNumber(product.retailPrice);

    if (requirePrice && (unitPrice == null || !Number.isFinite(unitPrice))) {
      throw new BadRequestException(
        'Product has no list price — request a quote instead',
      );
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: unitPrice ?? 0,
      minimumOrderQty: product.minimumOrderQty,
      imageUrl: getPrimaryImageUrl(product.images),
      availability: product.availability,
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
  ): {
    id: string;
    productId: string;
    productName: string;
    productSku: string;
    productSlug?: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  } {
    const unitPrice = decimalToNumber(product.retailPrice) ?? 0;

    return {
      id: cartItemId,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productSlug: product.slug,
      productImage: getPrimaryImageUrl(product.images),
      quantity,
      unitPrice,
      totalPrice: Number((unitPrice * quantity).toFixed(2)),
    };
  }
}
