import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AccountDashboard,
  AccountProfile,
  AddressSummary,
  InvoiceSummary,
  OrderSummary,
  QuoteSummary,
  UserRole,
} from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { decimalToNumber } from '@/modules/products/products.mapper';
import type { UpdateAccountProfileDto, UpsertAddressDto } from './dto/account.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerContext: CustomerContextService,
  ) {}

  async getDashboard(profileId: string): Promise<AccountDashboard> {
    const profile = await this.getProfile(profileId);
    const customer = await this.customerContext.assertActiveCustomer(profileId);

    const [
      ordersCount,
      quotesCount,
      invoicesCount,
      wishlistCount,
      addressesCount,
      recentOrders,
      recentQuotes,
      recentInvoices,
    ] = await Promise.all([
      this.prisma.order.count({ where: { customerId: customer.id, deletedAt: null } }),
      this.prisma.quote.count({ where: { customerId: customer.id, deletedAt: null } }),
      this.prisma.invoice.count({ where: { customerId: customer.id } }),
      this.prisma.wishlistItem.count({ where: { customerId: customer.id } }),
      this.prisma.address.count({ where: { profileId, deletedAt: null } }),
      this.prisma.order.findMany({
        where: { customerId: customer.id, deletedAt: null },
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.quote.findMany({
        where: { customerId: customer.id, deletedAt: null },
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.invoice.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const orders: OrderSummary[] = recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: decimalToNumber(order.totalAmount) ?? 0,
      currency: order.currency,
      itemCount: order._count.items,
      createdAt: order.createdAt.toISOString(),
    }));

    const quotes: QuoteSummary[] = recentQuotes.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      status: quote.status,
      totalAmount: decimalToNumber(quote.totalAmount) ?? 0,
      currency: quote.currency,
      itemCount: quote._count.items,
      expiresAt: quote.expiresAt?.toISOString(),
      createdAt: quote.createdAt.toISOString(),
    }));

    const invoices: InvoiceSummary[] = recentInvoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      totalAmount: decimalToNumber(invoice.totalAmount) ?? 0,
      currency: invoice.currency,
      dueDate: invoice.dueDate.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
    }));

    return {
      profile,
      counts: {
        orders: ordersCount,
        quotes: quotesCount,
        invoices: invoicesCount,
        wishlist: wishlistCount,
        addresses: addressesCount,
      },
      recentOrders: orders,
      recentQuotes: quotes,
      recentInvoices: invoices,
    };
  }

  async getProfile(profileId: string): Promise<AccountProfile> {
    const row = await this.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        customer: true,
        userRoles: { include: { role: true } },
      },
    });

    if (!row || !row.customer) {
      throw new NotFoundException('Account profile not found. Sync your account first.');
    }

    const primaryRole = row.userRoles[0]?.role.name ?? 'CUSTOMER';

    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone ?? undefined,
      role: primaryRole as UserRole,
      customerId: row.customer.id,
      customerGroup: row.customer.customerGroup,
      organizationName: row.customer.organizationName ?? undefined,
      department: row.customer.department ?? undefined,
      country: row.customer.country ?? undefined,
      isVerified: row.customer.isVerified,
      isSuspended: row.customer.isSuspended,
    };
  }

  async updateProfile(
    profileId: string,
    dto: UpdateAccountProfileDto,
  ): Promise<AccountProfile> {
    await this.customerContext.assertActiveCustomer(profileId);

    await this.prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: profileId },
        data: {
          ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
          ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone || null } : {}),
        },
      });

      await tx.customer.update({
        where: { profileId },
        data: {
          ...(dto.organizationName !== undefined
            ? { organizationName: dto.organizationName || null }
            : {}),
          ...(dto.department !== undefined ? { department: dto.department || null } : {}),
          ...(dto.country !== undefined ? { country: dto.country || null } : {}),
        },
      });
    });

    return this.getProfile(profileId);
  }

  async listAddresses(profileId: string): Promise<AddressSummary[]> {
    await this.customerContext.assertActiveCustomer(profileId);

    const addresses = await this.prisma.address.findMany({
      where: { profileId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses.map((address) => this.toAddressSummary(address));
  }

  async createAddress(profileId: string, dto: UpsertAddressDto): Promise<AddressSummary> {
    await this.customerContext.assertActiveCustomer(profileId);

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { profileId, deletedAt: null },
        data: { isDefault: false },
      });
    }

    const created = await this.prisma.address.create({
      data: {
        profileId,
        label: dto.label,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationName: dto.organizationName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        stateProvince: dto.stateProvince,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault ?? false,
      },
    });

    return this.toAddressSummary(created);
  }

  async updateAddress(
    profileId: string,
    addressId: string,
    dto: UpsertAddressDto,
  ): Promise<AddressSummary> {
    await this.customerContext.assertActiveCustomer(profileId);

    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, profileId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { profileId, deletedAt: null, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        label: dto.label,
        firstName: dto.firstName,
        lastName: dto.lastName,
        organizationName: dto.organizationName,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        stateProvince: dto.stateProvince,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault ?? existing.isDefault,
      },
    });

    return this.toAddressSummary(updated);
  }

  async deleteAddress(profileId: string, addressId: string): Promise<void> {
    await this.customerContext.assertActiveCustomer(profileId);

    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, profileId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date(), isDefault: false },
    });
  }

  private toAddressSummary(address: {
    id: string;
    label: string | null;
    firstName: string;
    lastName: string;
    organizationName: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateProvince: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
  }): AddressSummary {
    return {
      id: address.id,
      label: address.label ?? undefined,
      firstName: address.firstName,
      lastName: address.lastName,
      organizationName: address.organizationName ?? undefined,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? undefined,
      city: address.city,
      stateProvince: address.stateProvince ?? undefined,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone ?? undefined,
      isDefault: address.isDefault,
    };
  }
}
