import type { Metadata } from 'next';
import { SolutionAudiencePage } from '@/components/content/solution-audience-page';
import { SOLUTIONS_NAV } from '@/lib/marketing-content';

const solution = SOLUTIONS_NAV[3];

export const metadata: Metadata = {
  title: 'Solutions for Distributors',
  description: 'Wholesale and partner supply programs for laboratory product distributors.',
};

export default function DistributorsSolutionsPage() {
  return (
    <SolutionAudiencePage
      currentPath={solution.href}
      title={solution.title}
      description="Partner with MCPFAC BIOTECH for wholesale quotations and regional laboratory supply."
      highlights={solution.highlights}
      highlightsTitle="Partner advantages"
      cta={solution.cta}
    />
  );
}
