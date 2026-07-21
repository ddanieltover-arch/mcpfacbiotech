import type { Metadata } from 'next';
import { InvoicesPageClient } from './invoices-page-client';

export const metadata: Metadata = {
  title: 'My Invoices | MCPFAC BIOTECH',
  description: 'View invoices issued for confirmed orders.',
};

export default function InvoicesPage() {
  return <InvoicesPageClient />;
}
