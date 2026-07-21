import { BadRequestException } from '@nestjs/common';
import { ProductAvailability } from '@prisma/client';
import { CartService } from './cart.service';

describe('CartService', () => {
  const prisma = {
    shoppingCart: {
      findFirst: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const customerContext = {
    assertActiveCustomer: jest.fn(),
  };

  const pricing = {
    loadSellableProduct: jest.fn(),
    assertQuantity: jest.fn(),
    toCartLine: jest.fn(),
  };

  const service = new CartService(
    prisma as never,
    customerContext as never,
    pricing as never,
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
      availability: ProductAvailability.IN_STOCK,
    });
    pricing.toCartLine.mockImplementation(
      (id: string, product: { id: string; name: string; sku: string; retailPrice: { toString: () => string } }, quantity: number) => ({
        id,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity,
        unitPrice: Number(product.retailPrice.toString()),
        totalPrice: Number(product.retailPrice.toString()) * quantity,
      }),
    );
  });

  it('adds a priced catalog product to a guest cart', async () => {
    prisma.shoppingCart.findFirst.mockResolvedValue(null);
    prisma.shoppingCart.create.mockResolvedValue({
      id: 'cart-1',
      sessionId: '11111111-1111-4111-8111-111111111111',
      customerId: null,
      isActive: true,
      notes: null,
    });
    prisma.cartItem.findUnique.mockResolvedValue(null);
    prisma.cartItem.create.mockResolvedValue({ id: 'item-1' });
    prisma.shoppingCart.findUniqueOrThrow.mockResolvedValue({
      id: 'cart-1',
      notes: null,
      items: [
        {
          id: 'item-1',
          quantity: 2,
          product: {
            id: 'prod-amino',
            name: '5-Amino-1MQ',
            sku: '5-AMINO-1MQ',
            retailPrice: { toString: () => '169' },
            images: [],
          },
        },
      ],
    });

    const result = await service.addItem(
      'prod-amino',
      2,
      undefined,
      '11111111-1111-4111-8111-111111111111',
    );

    expect(pricing.loadSellableProduct).toHaveBeenCalledWith('prod-amino', {
      requirePrice: true,
    });
    expect(pricing.assertQuantity).toHaveBeenCalled();
    expect(result.itemCount).toBe(2);
    expect(result.subtotal).toBe(338);
    expect(result.items[0]?.productSku).toBe('5-AMINO-1MQ');
  });

  it('merges guest quantities into the customer cart', async () => {
    prisma.shoppingCart.findFirst
      .mockResolvedValueOnce({
        id: 'customer-cart',
        customerId: 'customer-1',
        isActive: true,
        notes: null,
      })
      .mockResolvedValueOnce({
        id: 'guest-cart',
        sessionId: '11111111-1111-4111-8111-111111111111',
        customerId: null,
        isActive: true,
        notes: 'Rush',
        items: [{ productId: 'prod-amino', quantity: 1 }],
      });

    prisma.cartItem.findUnique.mockResolvedValue({
      id: 'existing-item',
      quantity: 1,
    });
    prisma.cartItem.update.mockResolvedValue({});
    prisma.cartItem.deleteMany.mockResolvedValue({});
    prisma.shoppingCart.update.mockResolvedValue({});
    prisma.shoppingCart.findUniqueOrThrow.mockResolvedValue({
      id: 'customer-cart',
      notes: 'Rush',
      items: [
        {
          id: 'existing-item',
          quantity: 2,
          product: {
            id: 'prod-amino',
            name: '5-Amino-1MQ',
            sku: '5-AMINO-1MQ',
            retailPrice: { toString: () => '169' },
            images: [],
          },
        },
      ],
    });

    const result = await service.mergeGuestCart(
      'profile-1',
      '11111111-1111-4111-8111-111111111111',
    );

    expect(result.itemCount).toBe(2);
    expect(prisma.shoppingCart.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'guest-cart' },
        data: { isActive: false },
      }),
    );
  });

  it('rejects invalid guest session ids', async () => {
    await expect(service.addItem('prod-amino', 1, undefined, 'not-a-uuid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});

describe('CartService MOQ', () => {
  it('propagates MOQ failures from pricing', async () => {
    const prisma = {
      shoppingCart: { findFirst: jest.fn(), create: jest.fn(), findUniqueOrThrow: jest.fn() },
      cartItem: { findUnique: jest.fn() },
    };
    const customerContext = { assertActiveCustomer: jest.fn() };
    const pricing = {
      loadSellableProduct: jest.fn().mockResolvedValue({
        id: 'prod-amino',
        sku: '5-AMINO-1MQ',
        minimumOrderQty: 5,
        unitPrice: 169,
      }),
      assertQuantity: jest.fn().mockImplementation(() => {
        throw new BadRequestException('Minimum order quantity for 5-AMINO-1MQ is 5');
      }),
      toCartLine: jest.fn(),
    };

    const service = new CartService(
      prisma as never,
      customerContext as never,
      pricing as never,
    );

    prisma.shoppingCart.findFirst.mockResolvedValue({ id: 'cart-1' });

    await expect(
      service.addItem('prod-amino', 1, undefined, '11111111-1111-4111-8111-111111111111'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
