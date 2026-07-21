import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalList, LegalPage, LegalSection } from '@/components/content/legal-page';
import { ResearchUseBanner } from '@/components/marketing';
import { CONTACT_CHANNELS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Return Policy',
  description:
    'Return and replacement guidelines for MCPFAC BIOTECH research products — damaged or incorrect shipments within 7 days.',
};

export default function ReturnsPage() {
  return (
    <LegalPage
      currentPath="/returns"
      title="Return Policy"
      description="Guidelines for returns, replacements, and shipment issues on research products."
      cta={{ href: '/contact', label: 'Contact support' }}
    >
      <LegalSection title="Research materials & eligibility">
        <p>
          Because many research materials are temperature-sensitive, lyophilized, or restricted,
          opened products generally cannot be restocked or resold. Returns are evaluated case by
          case. If goods arrive <strong>damaged, incorrect, or incomplete</strong>, contact us within{' '}
          <strong>7 days</strong> of delivery with your order number and photos.
        </p>
      </LegalSection>

      <LegalSection title="How to request a return or replacement">
        <LegalList
          items={[
            'Email support with your order number and photos of the issue where relevant',
            'Keep original packaging until the claim is reviewed',
            'Do not return products without written authorization',
            'Include batch / lot numbers when documentation mismatch is claimed',
          ]}
        />
        <p>
          Prefer the <Link href="/contact">contact form</Link> or email{' '}
          <a href={`mailto:${CONTACT_CHANNELS.email}`}>{CONTACT_CHANNELS.email}</a>. You may also
          open a <Link href="/support">support ticket</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Non-returnable items">
        <p>
          Opened vials, custom synthesis, and products that cannot be safely restocked are generally
          non-returnable unless the issue is attributable to shipping damage or fulfillment error
          confirmed by our team.
        </p>
      </LegalSection>

      <LegalSection title="Shipping notes">
        <p>
          Review <Link href="/shipping">Shipping Information</Link> for checkout rates and packaging
          practices. Carrier-related delays outside our control may not qualify for refunds of
          shipping fees.
        </p>
      </LegalSection>

      <div className="py-7 sm:py-8">
        <ResearchUseBanner />
      </div>
    </LegalPage>
  );
}
