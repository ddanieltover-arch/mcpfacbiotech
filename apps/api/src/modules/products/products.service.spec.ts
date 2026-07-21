import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductAvailability, ProductStatus } from '@prisma/client';

describe('ProductsService', () => {
  const prisma = {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const service = new ProductsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated product summaries', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'product-1',
        name: 'BPC-157 5mg',
        slug: 'bpc-157-5mg',
        sku: 'MBT-BPC157-5MG',
        casNumber: null,
        purity: '≥98%',
        retailPrice: { toString: () => '89' },
        availability: ProductAvailability.IN_STOCK,
        images: [{ id: 'img-1', url: '/image.jpg', alt: 'BPC-157', isPrimary: true, sortOrder: 0 }],
        specifications: [],
        productCategories: [{ category: { name: 'Research Peptides', slug: 'research-peptides' } }],
      },
    ]);
    prisma.product.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 12, direction: 'desc' });

    expect(result.total).toBe(1);
    expect(result.items[0]?.name).toBe('BPC-157 5mg');
    expect(result.items[0]?.price).toBe(89);
  });

  it('throws when product slug is not found', async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    await expect(service.findBySlug('missing-product')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns search suggestions for published products', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'product-2',
        name: 'TB-500 5mg',
        slug: 'tb-500-5mg',
        sku: 'MBT-TB500-5MG',
        casNumber: null,
        purity: '≥98%',
        retailPrice: { toString: () => '95' },
        availability: ProductAvailability.IN_STOCK,
        status: ProductStatus.PUBLISHED,
        images: [],
        specifications: [],
        productCategories: [],
      },
    ]);

    const result = await service.suggest('tb-500', 5);

    expect(result).toHaveLength(1);
    expect(result[0]?.sku).toBe('MBT-TB500-5MG');
  });
});
