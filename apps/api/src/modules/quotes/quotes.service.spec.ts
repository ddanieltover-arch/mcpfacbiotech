import { ForbiddenException } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  const prisma = {
    quote: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

  const service = new QuotesService(
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
    pricing.loadSellableProduct.mockResolvedValue({
      id: 'prod-amino',
      name: '5-Amino-1MQ',
      sku: '5-AMINO-1MQ',
      unitPrice: 169,
      minimumOrderQty: 1,
    });
  });

  it('creates a draft quote from explicit catalog items', async () => {
    prisma.quote.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      const created = {
        id: 'quote-1',
        quoteNumber: 'QT-20260720-1234',
        status: QuoteStatus.DRAFT,
        subtotal: { toString: () => '169' },
        shippingCost: { toString: () => '0' },
        totalAmount: { toString: () => '169' },
        currency: 'USD',
        notes: null,
        purchaseOrderNum: null,
        expiresAt: null,
        createdAt: new Date('2026-07-20T00:00:00.000Z'),
        updatedAt: new Date('2026-07-20T00:00:00.000Z'),
        items: [
          {
            id: 'qi-1',
            productId: 'prod-amino',
            productName: '5-Amino-1MQ',
            productSku: '5-AMINO-1MQ',
            quantity: 1,
            unitPrice: { toString: () => '169' },
            totalPrice: { toString: () => '169' },
            notes: null,
          },
        ],
        statusHistory: [
          {
            id: 'h-1',
            fromStatus: null,
            toStatus: QuoteStatus.DRAFT,
            note: 'Quote draft created',
            changedBy: 'customer-1',
            createdAt: new Date('2026-07-20T00:00:00.000Z'),
          },
        ],
      };

      prisma.quote.create.mockResolvedValue(created);
      return fn(prisma);
    });

    const result = await service.create('profile-1', {
      items: [{ productId: 'prod-amino', quantity: 1 }],
    });

    expect(result.status).toBe('DRAFT');
    expect(result.totalAmount).toBe(169);
    expect(result.items[0]?.productSku).toBe('5-AMINO-1MQ');
  });

  it('submits a draft quote and clears the cart', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'quote-1',
      customerId: 'customer-1',
      status: QuoteStatus.DRAFT,
      deletedAt: null,
      items: [{ id: 'qi-1' }],
    });

    const submitted = {
      id: 'quote-1',
      quoteNumber: 'QT-20260720-1234',
      status: QuoteStatus.SUBMITTED,
      subtotal: { toString: () => '169' },
      shippingCost: { toString: () => '0' },
      totalAmount: { toString: () => '169' },
      currency: 'USD',
      notes: null,
      purchaseOrderNum: null,
      expiresAt: new Date('2026-08-19T00:00:00.000Z'),
      createdAt: new Date('2026-07-20T00:00:00.000Z'),
      updatedAt: new Date('2026-07-20T00:00:00.000Z'),
      items: [
        {
          id: 'qi-1',
          productId: 'prod-amino',
          productName: '5-Amino-1MQ',
          productSku: '5-AMINO-1MQ',
          quantity: 1,
          unitPrice: { toString: () => '169' },
          totalPrice: { toString: () => '169' },
          notes: null,
        },
      ],
      statusHistory: [],
    };

    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      prisma.quote.update.mockResolvedValue(submitted);
      return fn(prisma);
    });

    cartService.getActiveCartRecord.mockResolvedValue({ id: 'cart-1' });

    const result = await service.submit('profile-1', 'quote-1');

    expect(result.status).toBe('SUBMITTED');
    expect(cartService.clearCartById).toHaveBeenCalledWith('cart-1');
  });

  it('rejects edits when quote is not a draft', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'quote-1',
      customerId: 'customer-1',
      status: QuoteStatus.SUBMITTED,
      deletedAt: null,
    });

    await expect(
      service.update('profile-1', 'quote-1', { notes: 'Nope' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
