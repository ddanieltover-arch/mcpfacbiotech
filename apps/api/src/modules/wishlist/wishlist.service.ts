import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProductSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { productListInclude, toProductSummary } from '@/modules/products/products.mapper';

@Injectable()
export class WishlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerContext: CustomerContextService,
  ) {}

  async list(profileId: string): Promise<ProductSummary[]> {
    const customerId = await this.customerContext.getCustomerIdByProfileId(profileId);

    const items = await this.prisma.wishlistItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: productListInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => toProductSummary(item.product));
  }

  async add(profileId: string, productId: string): Promise<ProductSummary> {
    const customerId = await this.customerContext.getCustomerIdByProfileId(profileId);

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
        status: 'PUBLISHED',
        isVisible: true,
      },
      include: productListInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Product is already in the wishlist');
    }

    await this.prisma.wishlistItem.create({
      data: {
        customerId,
        productId,
      },
    });

    return toProductSummary(product);
  }

  async remove(profileId: string, productId: string): Promise<void> {
    const customerId = await this.customerContext.getCustomerIdByProfileId(profileId);

    const existing = await this.prisma.wishlistItem.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: existing.id },
    });
  }
}
