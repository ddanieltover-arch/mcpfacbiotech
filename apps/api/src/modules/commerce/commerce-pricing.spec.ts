import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductAvailability, ProductStatus } from '@prisma/client';
import { CommercePricingService } from './commerce-pricing';

describe('CommercePricingService', () => {
  const prisma = {
    product: {
      findFirst: jest.fn(),
    },
  };
  const service = new CommercePricingService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  const baseProduct = {
    id: 'p1',
    name: 'Peptide',
    sku: 'PEP-1',
    slug: 'peptide',
    retailPrice: 12.5,
    minimumOrderQty: 2,
    availability: ProductAvailability.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    isVisible: true,
    images: [{ url: 'https://cdn/x.png', isPrimary: true, sortOrder: 0 }],
  };

  it('loads a sellable priced product', async () => {
    prisma.product.findFirst.mockResolvedValue(baseProduct);
    const result = await service.loadSellableProduct('p1');
    expect(result).toMatchObject({
      id: 'p1',
      unitPrice: 12.5,
      minimumOrderQty: 2,
      imageUrl: 'https://cdn/x.png',
    });
  });

  it('throws when product missing', async () => {
    prisma.product.findFirst.mockResolvedValue(null);
    await expect(service.loadSellableProduct('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects unavailable products', async () => {
    prisma.product.findFirst.mockResolvedValue({
      ...baseProduct,
      availability: ProductAvailability.DISCONTINUED,
    });
    await expect(service.loadSellableProduct('p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects missing price when required', async () => {
    prisma.product.findFirst.mockResolvedValue({
      ...baseProduct,
      retailPrice: null,
    });
    await expect(service.loadSellableProduct('p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('assertQuantity enforces MOQ', () => {
    const product = {
      id: 'p1',
      name: 'Peptide',
      sku: 'PEP-1',
      unitPrice: 10,
      minimumOrderQty: 5,
      availability: ProductAvailability.IN_STOCK,
    };
    expect(() => service.assertQuantity(product, 0)).toThrow(BadRequestException);
    expect(() => service.assertQuantity(product, 3)).toThrow(BadRequestException);
    expect(() => service.assertQuantity(product, 5)).not.toThrow();
  });

  it('toCartLine computes totals', () => {
    const line = service.toCartLine('item-1', baseProduct as never, 3);
    expect(line).toMatchObject({
      id: 'item-1',
      quantity: 3,
      unitPrice: 12.5,
      totalPrice: 37.5,
    });
  });
});
