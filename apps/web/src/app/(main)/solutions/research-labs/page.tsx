import type { Metadata } from 'next';
import { SolutionAudiencePage } from '@/components/content/solution-audience-page';
import { SOLUTIONS_NAV } from '@/lib/marketing-content';

const solution = SOLUTIONS_NAV[1];

export const metadata: Metadata = {
  title: 'Solutions for Research Labs',
  description: 'Supply solutions for independent and institutional research laboratories.',
};

export default function ResearchLabsSolutionsPage() {
  return (
    <SolutionAudiencePage
      currentPath={solution.href}
      title={solution.title}
      description="Keep experiments moving with dependable catalog availability and clear product specifications."
      highlights={solution.highlights}
      highlightsTitle="What labs get"
      cta={solution.cta}
    />
  );
}
