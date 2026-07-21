import { Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import type {
  InvoiceDetail,
  InvoiceItem as InvoiceItemDto,
  InvoiceSummary,
} from '@mcpfac/shared-types';
import { PrismaService } from '@/database/prisma.service';
import { CustomerContextService } from '@/modules/customers/customer-context.service';
import { decimalToNumber } from '@/modules/products/products.mapper';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customerContext: CustomerContextService,
  ) {}

  async list(
    profileId: string,
    page = 1,
    limit = 20,
  ): Promise<{ items: InvoiceSummary[]; total: number; page: number; limit: number }> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({
        where: { customerId: customer.id },
      }),
    ]);

    return {
      items: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        totalAmount: decimalToNumber(invoice.totalAmount) ?? 0,
        currency: invoice.currency,
        dueDate: invoice.dueDate.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getById(profileId: string, invoiceId: string): Promise<InvoiceDetail> {
    const customer = await this.customerContext.assertActiveCustomer(profileId);
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, customerId: customer.id },
      include: {
        items: { orderBy: { productName: 'asc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return this.toDetail(invoice);
  }

  private toDetail(invoice: {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    orderId: string;
    subtotal: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    shippingCost: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    currency: string;
    dueDate: Date;
    paidAt: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productName: string;
      productSku: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
    }>;
  }): InvoiceDetail {
    const items: InvoiceItemDto[] = invoice.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: decimalToNumber(item.unitPrice) ?? 0,
      totalPrice: decimalToNumber(item.totalPrice) ?? 0,
    }));

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      orderId: invoice.orderId,
      subtotal: decimalToNumber(invoice.subtotal) ?? 0,
      taxAmount: decimalToNumber(invoice.taxAmount) ?? 0,
      shippingCost: decimalToNumber(invoice.shippingCost) ?? 0,
      totalAmount: decimalToNumber(invoice.totalAmount) ?? 0,
      currency: invoice.currency,
      dueDate: invoice.dueDate.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      notes: invoice.notes ?? undefined,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      items,
    };
  }
}
