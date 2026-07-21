import { NotFoundException } from '@nestjs/common';
import { ProductAvailability } from '@prisma/client';
import { AdminInventoryService } from './admin-inventory.service';

describe('AdminInventoryService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const service = new AdminInventoryService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty page when low-stock filter finds no ids', async () => {
    prisma.$queryRaw.mockResolvedValue([]);

    const result = await service.list({
      page: 1,
      limit: 20,
      direction: 'desc',
      lowStockOnly: 'true',
    });

    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
    expect(prisma.product.findMany).not.toHaveBeenCalled();
  });

  it('auto-sets LOW_STOCK when stock drops to threshold', async () => {
    prisma.product.findFirst.mockResolvedValue({
      id: 'p1',
      stockQuantity: 10,
      lowStockThreshold: 5,
      availability: ProductAvailability.IN_STOCK,
      leadTimeDays: null,
    });
    prisma.product.update.mockResolvedValue({
      id: 'p1',
      name: 'Peptide',
      sku: 'SKU',
      slug: 'peptide',
      status: 'PUBLISHED',
      stockQuantity: 3,
      lowStockThreshold: 5,
      availability: ProductAvailability.LOW_STOCK,
      leadTimeDays: null,
      updatedAt: new Date('2026-01-01'),
      productCategories: [],
    });

    const result = await service.update('p1', { stockQuantity: 3 }, 'admin-1');

    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stockQuantity: 3,
          availability: ProductAvailability.LOW_STOCK,
        }),
      }),
    );
    expect(result.isLowStock).toBe(true);
  });

  it('lists inventory without low-stock filter', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'p1',
        name: 'Peptide',
        sku: 'SKU',
        slug: 'peptide',
        status: 'PUBLISHED',
        availability: ProductAvailability.IN_STOCK,
        stockQuantity: 10,
        lowStockThreshold: 5,
        leadTimeDays: 3,
        updatedAt: new Date('2026-01-01'),
        productCategories: [{ category: { name: 'Research' } }],
      },
    ]);
    prisma.product.count.mockResolvedValue(1);

    const result = await service.list({
      page: 1,
      limit: 20,
      direction: 'desc',
    });

    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      sku: 'SKU',
      isLowStock: false,
      categoryName: 'Research',
    });
  });

  it('auto-sets IN_STOCK when stock rises above threshold', async () => {
    prisma.product.findFirst.mockResolvedValue({
      id: 'p1',
      stockQuantity: 2,
      lowStockThreshold: 5,
      availability: ProductAvailability.LOW_STOCK,
      leadTimeDays: null,
    });
    prisma.product.update.mockResolvedValue({
      id: 'p1',
      name: 'Peptide',
      sku: 'SKU',
      slug: 'peptide',
      status: 'PUBLISHED',
      stockQuantity: 20,
      lowStockThreshold: 5,
      availability: ProductAvailability.IN_STOCK,
      leadTimeDays: null,
      updatedAt: new Date('2026-01-01'),
      productCategories: [],
    });

    const result = await service.update('p1', { stockQuantity: 20 }, 'admin-1');
    expect(result.isLowStock).toBe(false);
    expect(prisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ availability: ProductAvailability.IN_STOCK }),
      }),
    );
  });

  it('countLowStock returns numeric count', async () => {
    prisma.$queryRaw.mockResolvedValue([{ count: 3n }]);
    await expect(service.countLowStock()).resolves.toBe(3);
  });
});
