import type { Metadata } from 'next';
import { OrdersPageClient } from './orders-page-client';

export const metadata: Metadata = {
  title: 'My Orders | MCPFAC BIOTECH',
  description: 'View and track your research product orders.',
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
