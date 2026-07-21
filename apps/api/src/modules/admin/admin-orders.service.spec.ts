import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { AdminOrdersService } from './admin-orders.service';

describe('AdminOrdersService', () => {
  const prisma = {
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const service = new AdminOrdersService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid status transitions', async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
      items: [],
      invoices: [],
    });

    await expect(
      service.updateStatus('order-1', 'admin-1', {
        status: OrderStatus.PENDING,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms pending order and issues invoice', async () => {
    const pending = {
      id: 'order-1',
      customerId: 'customer-1',
      status: OrderStatus.PENDING,
      subtotal: 100,
      taxAmount: 0,
      shippingCost: 0,
      totalAmount: 100,
      currency: 'USD',
      items: [
        {
          productName: 'Peptide A',
          productSku: 'SKU-1',
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100,
        },
      ],
      invoices: [],
    };

    prisma.order.findFirst
      .mockResolvedValueOnce(pending)
      .mockResolvedValueOnce({
        ...pending,
        status: OrderStatus.CONFIRMED,
        orderNumber: 'ORD-1',
        notes: null,
        purchaseOrderNum: null,
        quoteId: null,
        shippingAddressId: null,
        billingAddressId: null,
        internalNotes: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        statusHistory: [],
        invoices: [{ id: 'inv-1' }],
        customer: {
          profile: { email: 'a@b.com', firstName: 'Ada', lastName: 'Lab' },
        },
        items: [
          {
            id: 'item-1',
            productId: 'p1',
            productName: 'Peptide A',
            productSku: 'SKU-1',
            quantity: 1,
            unitPrice: 100,
            totalPrice: 100,
          },
        ],
      });

    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<void>) => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      await fn(prisma);
    });

    const result = await service.updateStatus('order-1', 'admin-1', {
      status: OrderStatus.CONFIRMED,
      note: 'Approved by ops',
    });

    expect(prisma.order.update).toHaveBeenCalled();
    expect(prisma.invoice.create).toHaveBeenCalled();
    expect(result.status).toBe(OrderStatus.CONFIRMED);
  });

  it('lists orders', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        orderNumber: 'ORD-1',
        status: OrderStatus.PENDING,
        totalAmount: 100,
        currency: 'EUR',
        paymentMethod: 'BITCOIN',
        shippingMethod: 'STANDARD',
        createdAt: new Date('2026-01-01'),
        _count: { items: 1 },
        customer: {
          organizationName: 'Lab',
          profile: { email: 'a@b.com', firstName: 'Ada', lastName: 'Lab' },
        },
      },
    ]);
    prisma.order.count.mockResolvedValue(1);

    const result = await service.list({ page: 1, limit: 20, direction: 'desc' });
    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      orderNumber: 'ORD-1',
      customerEmail: 'a@b.com',
      itemCount: 1,
      paymentMethod: 'BITCOIN',
      shippingMethod: 'STANDARD',
    });
  });

  it('getById throws when missing', async () => {
    prisma.order.findFirst.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when order is missing', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.updateStatus('missing', 'admin-1', { status: OrderStatus.CONFIRMED }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
