import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  const prisma = {
    product: { count: jest.fn() },
    customer: { count: jest.fn(), findMany: jest.fn() },
    quote: { count: jest.fn(), findMany: jest.fn() },
    order: { count: jest.fn(), findMany: jest.fn() },
    invoice: { count: jest.fn() },
  };
  const inventoryService = {
    countLowStock: jest.fn().mockResolvedValue(2),
  };
  const service = new AdminDashboardService(prisma as never, inventoryService as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.product.count.mockResolvedValue(10);
    prisma.customer.count.mockResolvedValue(4);
    prisma.quote.count.mockResolvedValue(3);
    prisma.order.count.mockResolvedValue(5);
    prisma.invoice.count.mockResolvedValue(1);
    prisma.order.findMany.mockResolvedValue([
      {
        id: 'o1',
        orderNumber: 'ORD-1',
        status: 'PENDING',
        totalAmount: 50,
        currency: 'EUR',
        createdAt: new Date('2026-01-01'),
        _count: { items: 2 },
        customer: {
          organizationName: 'Lab',
          profile: { email: 'a@b.com', firstName: 'A', lastName: 'B' },
        },
      },
    ]);
    prisma.quote.findMany.mockResolvedValue([]);
    prisma.customer.findMany.mockResolvedValue([]);
  });

  it('aggregates dashboard counts and recent orders', async () => {
    const dashboard = await service.getDashboard();

    expect(dashboard.counts).toMatchObject({
      products: 10,
      lowStockProducts: 2,
      customers: 4,
      invoicesIssued: 1,
    });
    expect(dashboard.recentOrders[0]).toMatchObject({
      orderNumber: 'ORD-1',
      customerEmail: 'a@b.com',
      itemCount: 2,
    });
    expect(inventoryService.countLowStock).toHaveBeenCalled();
  });
});
