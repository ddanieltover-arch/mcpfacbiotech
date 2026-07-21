import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ProductSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { productListInclude, toProductSummary } from '@/modules/products/products.mapper';

const MAX_COMPARE_ITEMS = 4;

@Injectable()
export class CompareService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerContext: CustomerContextService,
  ) {}

  async list(profileId: string): Promise<ProductSummary[]> {
    const customerId = await this.customerContext.getCustomerIdByProfileId(profileId);

    const items = await this.prisma.compareItem.findMany({
      where: { customerId },
      include: {
        product: {
          include: productListInclude,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return items.map((item) => toProductSummary(item.product));
  }

  async add(profileId: string, productId: string): Promise<ProductSummary> {
    const customerId = await this.customerContext.getCustomerIdByProfileId(profileId);

    const currentCount = await this.prisma.compareItem.count({
      where: { customerId },
    });

    if (currentCount >= MAX_COMPARE_ITEMS) {
      throw new BadRequestException(`Compare list is limited to ${MAX_COMPARE_ITEMS} products`);
    }

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

    const existing = await this.prisma.compareItem.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Product is already in the compare list');
    }

    await this.prisma.compareItem.create({
      data: {
        customerId,
        productId,
      },
    });

    return toProductSummary(product);
  }

  async remove(profileId: string, productId: string): Promise<void> {
    const customerId = await this.customerContext.getCustomerIdByProfileId(profileId);

    const existing = await this.prisma.compareItem.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Compare item not found');
    }

    await this.prisma.compareItem.delete({
      where: { id: existing.id },
    });
  }
}
