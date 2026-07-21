import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus, QuoteStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const prisma = {
    order: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    quote: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    address: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const customerContext = {
    assertActiveCustomer: jest.fn().mockResolvedValue({
      id: 'customer-1',
      customerGroup: 'RESEARCH',
      isSuspended: false,
    }),
  };

  const pricing = {
    loadSellableProduct: jest.fn().mockResolvedValue({
      id: 'prod-amino',
      name: '5-Amino-1MQ',
      sku: '5-AMINO-1MQ',
      unitPrice: 169,
      minimumOrderQty: 1,
    }),
    assertQuantity: jest.fn(),
  };

  const cartService = {
    getActiveCartRecord: jest.fn(),
    clearCartById: jest.fn(),
  };

  const service = new OrdersService(
    prisma as never,
    customerContext as never,
    pricing as never,
    cartService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    customerContext.assertActiveCustomer.mockResolvedValue({
      id: 'customer-1',
      customerGroup: 'RESEARCH',
      isSuspended: false,
    });
  });

  it('creates a pending order from cart and clears the cart', async () => {
    cartService.getActiveCartRecord.mockResolvedValue({
      id: 'cart-1',
      items: [{ productId: 'prod-amino', quantity: 1 }],
    });
    prisma.order.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const created = {
        id: 'order-1',
        orderNumber: 'ORD-20260720-1234',
      };
      prisma.order.create.mockResolvedValue(created);
      return fn(prisma);
    });
    prisma.order.findFirst.mockResolvedValue({
      id: 'order-1',
      orderNumber: 'ORD-20260720-1234',
      status: OrderStatus.PENDING,
      subtotal: { toString: () => '169' },
      shippingCost: { toString: () => '0' },
      taxAmount: { toString: () => '0' },
      totalAmount: { toString: () => '169' },
      currency: 'USD',
      notes: 'Payment method: BANK_TRANSFER',
      purchaseOrderNum: null,
      quoteId: null,
      shippingAddressId: null,
      billingAddressId: null,
      createdAt: new Date('2026-07-20T00:00:00.000Z'),
      updatedAt: new Date('2026-07-20T00:00:00.000Z'),
      items: [
        {
          id: 'oi-1',
          productId: 'prod-amino',
          productName: '5-Amino-1MQ',
          productSku: '5-AMINO-1MQ',
          quantity: 1,
          unitPrice: { toString: () => '169' },
          totalPrice: { toString: () => '169' },
        },
      ],
      statusHistory: [],
      invoices: [],
    });

    const result = await service.checkout('profile-1', { fromCart: true });

    expect(result.status).toBe('PENDING');
    expect(result.items[0]?.productSku).toBe('5-AMINO-1MQ');
    expect(cartService.clearCartById).toHaveBeenCalledWith('cart-1');
  });

  it('rejects quote conversion when quote is still draft', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'quote-1',
      status: QuoteStatus.DRAFT,
      items: [{ productId: 'prod-amino', quantity: 1 }],
    });

    await expect(
      service.checkout('profile-1', { quoteId: 'quote-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('confirms pending order and issues invoice', async () => {
    prisma.order.findFirst
      .mockResolvedValueOnce({
        id: 'order-1',
        customerId: 'customer-1',
        status: OrderStatus.PENDING,
        deletedAt: null,
        subtotal: 169,
        taxAmount: 0,
        shippingCost: 0,
        totalAmount: 169,
        currency: 'USD',
        items: [
          {
            productName: '5-Amino-1MQ',
            productSku: '5-AMINO-1MQ',
            quantity: 1,
            unitPrice: 169,
            totalPrice: 169,
          },
        ],
        invoices: [],
      })
      .mockResolvedValueOnce({
        id: 'order-1',
        orderNumber: 'ORD-20260720-1234',
        status: OrderStatus.CONFIRMED,
        subtotal: { toString: () => '169' },
        shippingCost: { toString: () => '0' },
        taxAmount: { toString: () => '0' },
        totalAmount: { toString: () => '169' },
        currency: 'USD',
        notes: null,
        purchaseOrderNum: null,
        quoteId: null,
        shippingAddressId: null,
        billingAddressId: null,
        createdAt: new Date('2026-07-20T00:00:00.000Z'),
        updatedAt: new Date('2026-07-20T00:00:00.000Z'),
        items: [],
        statusHistory: [],
        invoices: [{ id: 'inv-1' }],
      });

    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      prisma.invoice.findUnique.mockResolvedValue(null);
      return fn(prisma);
    });

    const result = await service.confirm('profile-1', 'order-1');

    expect(result.status).toBe('CONFIRMED');
    expect(result.invoiceIds).toContain('inv-1');
  });

  it('rejects confirm when order is not pending', async () => {
    prisma.order.findFirst.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CONFIRMED,
      items: [],
      invoices: [],
    });

    await expect(service.confirm('profile-1', 'order-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
