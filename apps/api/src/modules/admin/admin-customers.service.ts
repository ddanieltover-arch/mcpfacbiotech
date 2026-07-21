import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AdminCustomerSummary } from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import type { AdminCustomerQueryDto } from './dto/admin-query.dto';
import type { UpdateAdminCustomerDto } from './dto/admin-mutations.dto';

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: AdminCustomerQueryDto) {
    const suspendedFilter =
      query.suspended === 'true'
        ? true
        : query.suspended === 'false'
          ? false
          : undefined;

    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(query.customerGroup ? { customerGroup: query.customerGroup } : {}),
      ...(suspendedFilter !== undefined ? { isSuspended: suspendedFilter } : {}),
      ...(query.search
        ? {
            OR: [
              { organizationName: { contains: query.search, mode: 'insensitive' } },
              { country: { contains: query.search, mode: 'insensitive' } },
              {
                profile: {
                  OR: [
                    { email: { contains: query.search, mode: 'insensitive' } },
                    { firstName: { contains: query.search, mode: 'insensitive' } },
                    { lastName: { contains: query.search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        include: {
          profile: { select: { email: true, firstName: true, lastName: true } },
          _count: { select: { orders: true, quotes: true } },
        },
        orderBy: { createdAt: query.direction === 'asc' ? 'asc' : 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    const items: AdminCustomerSummary[] = rows.map((customer) => ({
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
      items,
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  }

  async getById(id: string): Promise<AdminCustomerSummary & { notes?: string }> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: { select: { email: true, firstName: true, lastName: true } },
        _count: { select: { orders: true, quotes: true } },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
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
      notes: customer.notes ?? undefined,
    };
  }

  async update(id: string, dto: UpdateAdminCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    await this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.isSuspended !== undefined ? { isSuspended: dto.isSuspended } : {}),
        ...(dto.isVerified !== undefined ? { isVerified: dto.isVerified } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });

    return this.getById(id);
  }
}
