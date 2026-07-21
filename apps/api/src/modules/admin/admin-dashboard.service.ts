import { Injectable } from '@nestjs/common';
import type {
  AdminCustomerSummary,
  AdminDashboard,
  AdminOrderSummary,
  AdminQuoteSummary,
} from '@mcpfac/shared-types';
import { OrderStatus, QuoteStatus } from '@prisma/client';
import { PrismaService } from '@/database/prisma.service';
import { decimalToNumber } from '@/modules/products/products.mapper';
import { AdminInventoryService } from './admin-inventory.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: AdminInventoryService,
  ) {}

  async getDashboard(): Promise<AdminDashboard> {
    const [
      products,
      publishedProducts,
      lowStockProducts,
      customers,
      pendingQuotes,
      pendingOrders,
      openOrders,
      invoicesIssued,
      recentOrderRows,
      recentQuoteRows,
      recentCustomerRows,
    ] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({
        where: { deletedAt: null, status: 'PUBLISHED', isVisible: true },
      }),
      this.inventoryService.countLowStock(),
      this.prisma.customer.count({ where: { deletedAt: null } }),
      this.prisma.quote.count({
        where: {
          deletedAt: null,
          status: { in: [QuoteStatus.SUBMITTED, QuoteStatus.UNDER_REVIEW, QuoteStatus.REVISED] },
        },
      }),
      this.prisma.order.count({
        where: { deletedAt: null, status: OrderStatus.PENDING },
      }),
      this.prisma.order.count({
        where: {
          deletedAt: null,
          status: {
            in: [
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.PACKED,
              OrderStatus.SHIPPED,
            ],
          },
        },
      }),
      this.prisma.invoice.count({ where: { status: 'ISSUED' } }),
      this.prisma.order.findMany({
        where: { deletedAt: null },
        include: {
          _count: { select: { items: true } },
          customer: {
            include: {
              profile: { select: { email: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.quote.findMany({
        where: { deletedAt: null },
        include: {
          _count: { select: { items: true } },
          customer: {
            include: {
              profile: { select: { email: true, firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.customer.findMany({
        where: { deletedAt: null },
        include: {
          profile: { select: { email: true, firstName: true, lastName: true } },
          _count: { select: { orders: true, quotes: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const recentOrders: AdminOrderSummary[] = recentOrderRows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: decimalToNumber(order.totalAmount) ?? 0,
      currency: order.currency,
      itemCount: order._count.items,
      customerEmail: order.customer.profile.email,
      customerName: `${order.customer.profile.firstName} ${order.customer.profile.lastName}`.trim(),
      organizationName: order.customer.organizationName ?? undefined,
      paymentMethod: order.paymentMethod,
      shippingMethod: order.shippingMethod,
      createdAt: order.createdAt.toISOString(),
    }));

    const recentQuotes: AdminQuoteSummary[] = recentQuoteRows.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      totalAmount: decimalToNumber(quote.totalAmount) ?? 0,
      currency: quote.currency,
      itemCount: quote._count.items,
      customerEmail: quote.customer.profile.email,
      customerName: `${quote.customer.profile.firstName} ${quote.customer.profile.lastName}`.trim(),
      organizationName: quote.customer.organizationName ?? undefined,
      expiresAt: quote.expiresAt?.toISOString(),
      createdAt: quote.createdAt.toISOString(),
    }));

    const recentCustomers: AdminCustomerSummary[] = recentCustomerRows.map((customer) => ({
      id: customer.id,
      profileId: customer.profileId,
      email: customer.profile.email,
      firstName: customer.profile.firstName,
      lastName: customer.profile.lastName,
      organizationName: customer.organizationName ?? undefined,
      customerGroup: customer.customerGroup,
      country: customer.country ?? undefined,
      isVerified: customer.isVerified,
      isSuspended: customer.isSuspended,
      ordersCount: customer._count.orders,
      quotesCount: customer._count.quotes,
      createdAt: customer.createdAt.toISOString(),
    }));

    return {
      counts: {
        products,
        publishedProducts,
        lowStockProducts,
        customers,
        pendingQuotes,
        pendingOrders,
        openOrders,
        invoicesIssued,
      },
      recentOrders,
      recentQuotes,
      recentCustomers,
    };
  }
}
