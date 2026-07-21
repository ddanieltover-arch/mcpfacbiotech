import type { Metadata } from 'next';
import { QuoteDetailClient } from './quote-detail-client';

export const metadata: Metadata = {
  title: 'Quote Detail | MCPFAC BIOTECH',
  description: 'View quotation details and status history.',
};

export default function QuoteDetailPage() {
  return <QuoteDetailClient />;
}
