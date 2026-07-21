import { NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  const prisma = {
    invoice: {
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };
  const customerContext = {
    assertActiveCustomer: jest.fn().mockResolvedValue({ id: 'cust-1' }),
  };
  const service = new InvoicesService(prisma as never, customerContext as never);

  beforeEach(() => jest.clearAllMocks());

  it('lists invoices for the active customer', async () => {
    prisma.invoice.findMany.mockResolvedValue([
      {
        id: 'inv-1',
        invoiceNumber: 'INV-1',
        status: InvoiceStatus.ISSUED,
        totalAmount: 100,
        currency: 'EUR',
        dueDate: new Date('2026-02-01'),
        createdAt: new Date('2026-01-01'),
      },
    ]);
    prisma.invoice.count.mockResolvedValue(1);

    const result = await service.list('profile-1', 1, 20);

    expect(result.total).toBe(1);
    expect(result.items[0]).toMatchObject({
      invoiceNumber: 'INV-1',
      totalAmount: 100,
    });
  });

  it('returns invoice detail', async () => {
    prisma.invoice.findFirst.mockResolvedValue({
      id: 'inv-1',
      invoiceNumber: 'INV-1',
      status: InvoiceStatus.ISSUED,
      orderId: 'ord-1',
      subtotal: 90,
      taxAmount: 5,
      shippingCost: 5,
      totalAmount: 100,
      currency: 'EUR',
      dueDate: new Date('2026-02-01'),
      paidAt: null,
      notes: null,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      items: [
        {
          id: 'ii-1',
          productName: 'Peptide',
          productSku: 'PEP',
          quantity: 2,
          unitPrice: 45,
          totalPrice: 90,
        },
      ],
    });

    const detail = await service.getById('profile-1', 'inv-1');
    expect(detail.items).toHaveLength(1);
    expect(detail.totalAmount).toBe(100);
  });

  it('throws when invoice missing', async () => {
    prisma.invoice.findFirst.mockResolvedValue(null);
    await expect(service.getById('profile-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
