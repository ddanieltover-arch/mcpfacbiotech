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
    profile: {
      findUnique: jest.fn().mockResolvedValue({
        email: 'lab@example.com',
        firstName: 'Ada',
        lastName: 'Lab',
      }),
      create: jest.fn(),
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
    role: {
      findUnique: jest.fn(),
    },
    customer: {
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
    mergeGuestCart: jest.fn().mockResolvedValue({ id: 'cart-merged' }),
  };

  const emailService = {
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    sendOrderStatusUpdate: jest.fn().mockResolvedValue(true),
  };

  const service = new OrdersService(
    prisma as never,
    customerContext as never,
    pricing as never,
    cartService as never,
    emailService as never,
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
      customer: {
        profile: { email: 'lab@example.com', firstName: 'Ada', lastName: 'Lab' },
      },
    });

    const result = await service.checkout({
      profileId: 'profile-1',
      dto: { fromCart: true },
    });

    expect(result.status).toBe('PENDING');
    expect(result.items[0]?.productSku).toBe('5-AMINO-1MQ');
    expect(cartService.clearCartById).toHaveBeenCalledWith('cart-1');
  });

  it('creates a pending order for guest checkout from cart', async () => {
    cartService.getActiveCartRecord.mockResolvedValue({
      id: 'cart-guest',
      items: [{ productId: 'prod-amino', quantity: 1 }],
    });
    prisma.profile.findUnique.mockResolvedValue(null);
    prisma.role.findUnique.mockResolvedValue({ id: 'role-guest', name: 'GUEST' });
    prisma.profile.create.mockResolvedValue({ id: 'guest-profile-1' });
    prisma.address.create.mockResolvedValue({ id: 'addr-guest-1' });
    prisma.order.findUnique.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(async (fn: (tx: typeof prisma) => Promise<unknown>) => {
      prisma.order.create.mockResolvedValue({
        id: 'order-guest-1',
        orderNumber: 'ORD-GUEST-001',
      });
      return fn(prisma);
    });
    prisma.order.findFirst.mockResolvedValue({
      id: 'order-guest-1',
      orderNumber: 'ORD-GUEST-001',
      status: OrderStatus.PENDING,
      subtotal: { toString: () => '169' },
      shippingCost: { toString: () => '25' },
      taxAmount: { toString: () => '0' },
      totalAmount: { toString: () => '194' },
      currency: 'USD',
      notes: null,
      purchaseOrderNum: null,
      quoteId: null,
      shippingAddressId: 'addr-guest-1',
      billingAddressId: 'addr-guest-1',
      createdAt: new Date('2026-07-22T00:00:00.000Z'),
      updatedAt: new Date('2026-07-22T00:00:00.000Z'),
      items: [
        {
          id: 'oi-guest-1',
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
      customer: {
        profile: { email: 'guest@example.com', firstName: 'Guest', lastName: 'Buyer' },
      },
      shippingAddress: {
        firstName: 'Guest',
        lastName: 'Buyer',
        addressLine1: '1 Lab Street',
        city: 'Boston',
        postalCode: '02101',
        country: 'United States',
      },
    });

    const result = await service.checkout({
      sessionId: '11111111-1111-4111-8111-111111111111',
      dto: {
        fromCart: true,
        guestEmail: 'guest@example.com',
        shippingAddress: {
          firstName: 'Guest',
          lastName: 'Buyer',
          addressLine1: '1 Lab Street',
          city: 'Boston',
          postalCode: '02101',
          country: 'United States',
        },
      },
    });

    expect(result.status).toBe('PENDING');
    expect(prisma.profile.create).toHaveBeenCalled();
    expect(cartService.mergeGuestCart).toHaveBeenCalledWith(
      'guest-profile-1',
      '11111111-1111-4111-8111-111111111111',
    );
    expect(cartService.clearCartById).toHaveBeenCalledWith('cart-guest');
  });

  it('rejects quote conversion when quote is still draft', async () => {
    prisma.quote.findFirst.mockResolvedValue({
      id: 'quote-1',
      status: QuoteStatus.DRAFT,
      items: [{ productId: 'prod-amino', quantity: 1 }],
    });

    await expect(
      service.checkout({ profileId: 'profile-1', dto: { quoteId: 'quote-1' } }),
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
