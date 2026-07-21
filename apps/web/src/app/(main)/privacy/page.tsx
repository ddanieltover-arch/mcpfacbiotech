import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalList, LegalPage, LegalSection } from '@/components/content/legal-page';
import { CONTACT_CHANNELS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How MCPFAC BIOTECH collects, uses, and protects personal information for research procurement accounts and orders.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      currentPath="/privacy"
      title="Privacy Policy"
      description="We respect your privacy and handle account, order, and inquiry data with care."
    >
      <LegalSection title="Scope">
        <p>
          This policy describes how MCPFAC BIOTECH processes personal data when you browse the site,
          create an account, request quotations, place research-product orders, or contact support.
          Our catalog is intended for laboratory and institutional buyers — not consumer retail of
          finished medicines.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <LegalList
          items={[
            'Account details such as name, email, organization, and shipping / billing addresses',
            'Order, quotation, invoice, and payment-method selection records',
            'Support and contact-form messages (including COA / batch requests)',
            'Technical data such as browser type, device signals, and approximate location for security and operations',
            'Cookie and session data as described in our Cookie Policy',
          ]}
        />
      </LegalSection>

      <LegalSection title="How we use information">
        <p>
          We use personal data to create accounts, process orders and quotations, issue invoices,
          provide customer support, ship research materials, improve the platform, prevent fraud, and
          meet legal or compliance obligations. We do not sell personal information.
        </p>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>
          Service providers that help us operate authentication, hosting, email, analytics (when
          enabled), and logistics may process data on our behalf under contractual safeguards. We may
          disclose information when required by law or to protect rights, safety, and platform
          integrity.
        </p>
      </LegalSection>

      <LegalSection title="International transfers">
        <p>
          We are based in Shenzhen, China, and may process data in other regions where our
          infrastructure or partners operate. Where required, we apply appropriate safeguards for
          cross-border transfers.
        </p>
      </LegalSection>

      <LegalSection title="Security & retention">
        <p>
          We apply reasonable technical and organizational measures to protect personal data and
          retain it only as long as needed for business, legal, and accounting purposes related to
          research procurement records.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on your jurisdiction, you may request access, correction, or deletion of your
          personal data, or object to certain processing. Contact{' '}
          <a href={`mailto:${CONTACT_CHANNELS.email}`}>{CONTACT_CHANNELS.email}</a>. See also our{' '}
          <Link href="/cookies">Cookie Policy</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
