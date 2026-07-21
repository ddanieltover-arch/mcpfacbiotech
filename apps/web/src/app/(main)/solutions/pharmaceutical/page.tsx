import type { Metadata } from 'next';
import { SolutionAudiencePage } from '@/components/content/solution-audience-page';
import { SOLUTIONS_NAV } from '@/lib/marketing-content';

const solution = SOLUTIONS_NAV[2];

export const metadata: Metadata = {
  title: 'Solutions for Pharma Companies',
  description: 'Specification-led research materials for pharmaceutical R&D teams.',
};

export default function PharmaceuticalSolutionsPage() {
  return (
    <SolutionAudiencePage
      currentPath={solution.href}
      title={solution.title}
      description="Support early research and analytical workflows with documentation-ready procurement."
      highlights={solution.highlights}
      highlightsTitle="Enterprise-ready purchasing"
      cta={solution.cta}
    />
  );
}
