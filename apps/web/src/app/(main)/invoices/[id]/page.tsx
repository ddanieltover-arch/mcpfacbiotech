import type { Metadata } from 'next';
import { InvoiceDetailClient } from './invoice-detail-client';

export const metadata: Metadata = {
  title: 'Invoice Detail',
  description: 'View invoice line items and payment terms.',
};

export default function InvoiceDetailPage() {
  return <InvoiceDetailClient />;
}
