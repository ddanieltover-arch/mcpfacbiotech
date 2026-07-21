import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalList, LegalPage, LegalSection } from '@/components/content/legal-page';
import { ResearchUseBanner } from '@/components/marketing';
import { CONTACT_CHANNELS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Terms for using MCPFAC BIOTECH — research-use only products, accounts, pricing, shipping, and liability.',
};

export default function TermsPage() {
  return (
    <LegalPage
      currentPath="/terms"
      title="Terms & Conditions"
      description="Please review these terms before using this website or purchasing research products."
    >
      <LegalSection title="1. Acceptance">
        <p>
          By accessing this website or placing an order, you agree to these Terms & Conditions, our{' '}
          <Link href="/privacy">Privacy Policy</Link>, and <Link href="/cookies">Cookie Policy</Link>.
          If you do not agree, do not use the site or place orders.
        </p>
      </LegalSection>

      <LegalSection title="2. Research-use only">
        <p>
          All products are sold strictly for laboratory research and development. They are{' '}
          <strong>not</strong> for human or animal consumption, diagnosis, therapy, or household use.
          Buyers represent that they are qualified to handle research materials, will follow
          applicable laws in their jurisdiction, and assume regulatory responsibility for import and
          use.
        </p>
        <LegalList
          items={[
            'Not for human or animal consumption',
            'For laboratory and R&D use only',
            'Buyer assumes regulatory responsibility in their jurisdiction',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Eligibility & accounts">
        <p>
          You must be of legal age in your jurisdiction to order. You are responsible for maintaining
          the confidentiality of account credentials and for activity under your account. We may
          suspend accounts that misuse the platform or violate these terms.
        </p>
      </LegalSection>

      <LegalSection title="4. Quotations, pricing & payment">
        <p>
          Quotations are invitations to treat unless expressly confirmed as a binding offer by
          MCPFAC BIOTECH. Prices, taxes, and shipping charges are shown at checkout or on confirmed
          quotations. Checkout supports manual payment methods (including cryptocurrency, card
          instructions, bank transfer, and related rails). Settlement instructions are provided
          after order placement. Orders remain subject to product availability and payment
          confirmation.
        </p>
      </LegalSection>

      <LegalSection title="5. Shipping & customs">
        <p>
          Shipping methods and rates are selected at checkout (see{' '}
          <Link href="/shipping">Shipping Information</Link>). Customers are responsible for ensuring
          products may be lawfully imported for research use into their destination. Customs delays
          and duties are the buyer’s responsibility unless otherwise agreed in writing.
        </p>
      </LegalSection>

      <LegalSection title="6. Documentation">
        <p>
          Specifications and batch documents (COA, MSDS, HPLC) are provided where published. Always
          verify lot identity against documentation before experimental use. See the{' '}
          <Link href="/coa">COA library</Link> and product pages.
        </p>
      </LegalSection>

      <LegalSection title="7. Returns">
        <p>
          Return eligibility for research materials is limited. See our{' '}
          <Link href="/returns">Return Policy</Link> for damaged or incorrect shipment procedures.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <LegalList
          items={[
            'Products are supplied as research materials with the specifications stated at sale',
            'MCPFAC BIOTECH is not liable for misuse, improper storage, or unauthorized applications',
            'Educational content (research briefs, calculator, blog) is not medical or clinical advice',
            'To the fullest extent permitted by law, liability is limited to the purchase price of the affected goods',
          ]}
        />
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          Questions about these terms:{' '}
          <a href={`mailto:${CONTACT_CHANNELS.email}`}>{CONTACT_CHANNELS.email}</a>
        </p>
      </LegalSection>

      <div className="py-7 sm:py-8">
        <ResearchUseBanner />
      </div>
    </LegalPage>
  );
}
