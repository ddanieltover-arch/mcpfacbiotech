import type { Metadata } from 'next';
import { QuotesPageClient } from './quotes-page-client';

export const metadata: Metadata = {
  title: 'My Quotes',
  description: 'View and track your research product quotations.',
};

export default function QuotesPage() {
  return <QuotesPageClient />;
}
