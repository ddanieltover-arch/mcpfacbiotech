import type { Metadata } from 'next';
import { ComparePageClient } from './compare-page-client';

export const metadata: Metadata = {
  title: 'Compare Products | MCPFAC BIOTECH',
  description: 'Compare research products side-by-side across purity, CAS, pricing, and availability.',
};

export default function ComparePage() {
  return <ComparePageClient />;
}
