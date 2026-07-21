import type { Metadata } from 'next';
import { SolutionAudiencePage } from '@/components/content/solution-audience-page';
import { SOLUTIONS_NAV } from '@/lib/marketing-content';

const solution = SOLUTIONS_NAV[0];

export const metadata: Metadata = {
  title: 'Solutions for Universities',
  description: 'Research product procurement for universities and academic laboratories.',
};

export default function UniversitiesSolutionsPage() {
  return (
    <SolutionAudiencePage
      currentPath={solution.href}
      title={solution.title}
      description="Support academic research programs with documented materials and straightforward quoting."
      highlights={solution.highlights}
      highlightsTitle="Built for campus procurement"
      cta={solution.cta}
    />
  );
}
