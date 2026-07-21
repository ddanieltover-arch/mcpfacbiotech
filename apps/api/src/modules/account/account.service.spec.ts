import { NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';

describe('AccountService', () => {
  const prisma = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    customer: {
      update: jest.fn(),
    },
    order: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    quote: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    invoice: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    wishlistItem: {
      count: jest.fn(),
    },
    address: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
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

  const service = new AccountService(prisma as never, customerContext as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns dashboard counts and recent activity', async () => {
    prisma.profile.findUnique.mockResolvedValue({
      id: 'profile-1',
      email: 'lab@example.com',
      firstName: 'Ada',
      lastName: 'Researcher',
      phone: null,
      userRoles: [{ role: { name: 'CUSTOMER' } }],
      customer: {
        id: 'customer-1',
        customerGroup: 'RESEARCH',
        organizationName: 'MCPFAC Lab',
        department: null,
        country: 'DE',
        isVerified: true,
        isSuspended: false,
      },
    });
    prisma.order.count.mockResolvedValue(2);
    prisma.quote.count.mockResolvedValue(1);
    prisma.invoice.count.mockResolvedValue(1);
    prisma.wishlistItem.count.mockResolvedValue(3);
    prisma.address.count.mockResolvedValue(1);
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        orderNumber: 'ORD-1',
        status: 'PENDING',
        totalAmount: { toString: () => '169' },
        currency: 'USD',
        createdAt: new Date('2026-07-20T00:00:00.000Z'),
        _count: { items: 1 },
      },
    ]);
    prisma.quote.findMany.mockResolvedValue([]);
    prisma.invoice.findMany.mockResolvedValue([]);

    const result = await service.getDashboard('profile-1');

    expect(result.profile.firstName).toBe('Ada');
    expect(result.counts.orders).toBe(2);
    expect(result.counts.wishlist).toBe(3);
    expect(result.recentOrders[0]?.orderNumber).toBe('ORD-1');
  });

  it('throws when profile is missing', async () => {
    prisma.profile.findUnique.mockResolvedValue(null);

    await expect(service.getProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
