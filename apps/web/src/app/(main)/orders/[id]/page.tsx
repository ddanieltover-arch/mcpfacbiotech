import type { Metadata } from 'next';
import { OrderDetailClient } from './order-detail-client';

export const metadata: Metadata = {
  title: 'Order Detail',
  description: 'View order details, confirm, and access invoices.',
};

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
