import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalList, LegalPage, LegalSection } from '@/components/content/legal-page';
import { CONTACT_CHANNELS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'How MCPFAC BIOTECH uses cookies and similar technologies for sessions, cart, security, and optional analytics.',
};

export default function CookiesPage() {
  return (
    <LegalPage
      currentPath="/cookies"
      title="Cookie Policy"
      description="This site uses cookies and similar technologies to keep sessions secure and support research procurement workflows."
    >
      <LegalSection title="What we use">
        <LegalList
          items={[
            'Essential cookies for authentication, cart session (including guest cart), and security',
            'Preference cookies to remember UI choices where applicable',
            'Analytics cookies (when enabled) to understand aggregate site usage — not to sell personal data',
          ]}
        />
      </LegalSection>

      <LegalSection title="Why they matter for this storefront">
        <p>
          Essential cookies enable login, protected account routes, checkout, and cart persistence
          for laboratory buyers. Disabling them may prevent you from completing research-product
          orders or accessing quotations and invoices.
        </p>
      </LegalSection>

      <LegalSection title="Managing cookies">
        <p>
          You can control cookies through your browser settings. Blocking essential cookies may break
          authentication, checkout, or cart features. For broader privacy practices, see our{' '}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions: <a href={`mailto:${CONTACT_CHANNELS.email}`}>{CONTACT_CHANNELS.email}</a>.
          Related: <Link href="/terms">Terms</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
