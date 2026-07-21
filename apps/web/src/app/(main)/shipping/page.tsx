import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, Package, Plane, Shield } from 'lucide-react';
import { SHIPPING_METHOD_OPTIONS } from '@mcpfac/shared-types';
import { MarketingSection, ResearchUseBanner } from '@/components/marketing';
import { formatPrice } from '@/lib/catalog-api';
import { SHIPPING_EXPECTATIONS } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Shipping Information',
  description:
    'MCPFAC BIOTECH shipping tiers, dispatch windows, packaging, and customs guidance for laboratory orders.',
};

export default function ShippingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 88% 10%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Logistics
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Shipping information
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Transparent checkout rates, typical dispatch windows, and packaging practices for
            research laboratory deliveries.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-deep px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-natural hover:shadow-lg"
            >
              Browse catalog
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center rounded-lg border-2 border-brand-deep px-6 py-3 text-sm font-semibold text-brand-deep transition-all hover:bg-brand-deep hover:text-white"
            >
              Shipping FAQ
            </Link>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Checkout methods"
        title="Rates that match the cart"
        description="Select a shipping method during checkout. These rates match live cart totals — no surprise carrier markup at payment time."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {SHIPPING_METHOD_OPTIONS.map((method, index) => (
            <div
              key={method.value}
              className="border-t-2 border-brand-leaf bg-neutral-50 px-5 py-6 sm:px-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-xs font-bold tracking-widest text-brand-leaf">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-2 font-heading text-xl font-bold text-brand-deep">
                    {method.label}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">{method.eta}</p>
                </div>
                <p className="font-heading text-2xl font-bold text-brand-deep">
                  {formatPrice(method.price)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                {method.value === 'STANDARD'
                  ? 'Best for routine laboratory restocks when transit time is flexible.'
                  : 'Preferred when receiving docks need faster turnaround on confirmed orders.'}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-neutral-500">
          Promotional free-shipping thresholds may be announced separately; until then, the rates
          above apply at checkout.
        </p>
      </MarketingSection>

      <section className="border-y border-neutral-200 bg-neutral-50 py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Dispatch window
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              Prepared in 24–48 hours
            </h2>
            <p className="mt-4 text-neutral-600">
              Most in-stock orders are prepared within a <strong className="text-brand-deep">24–48 hour</strong>{' '}
              window on business days when inventory allows. Priority Express shortens transit after
              dispatch; it does not replace stock verification or quality review before shipment.
            </p>
            <div className="mt-6 flex items-start gap-3 text-sm text-neutral-600">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-leaf" aria-hidden />
              <span>Business-day preparation when stock and documentation checks allow.</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              What to expect
            </p>
            <ul className="mt-4 space-y-4">
              {SHIPPING_EXPECTATIONS.map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="font-heading text-sm font-bold tracking-widest text-brand-leaf">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm leading-relaxed text-neutral-700 sm:text-base">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <MarketingSection
        eyebrow="Packaging & handling"
        title="Protective packing for research materials"
        description="Lyophilized peptides and temperature-sensitive materials ship in packaging designed for laboratory receiving."
        action={{ href: '/returns', label: 'Return policy' }}
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
              <Package className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold text-brand-deep">
                Cold-chain & desiccation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Cold-chain or desiccated containment is used where product storage requirements
                demand it. See product pages for specific handling notes.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-pale text-brand-deep">
              <Shield className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold text-brand-deep">
                Damaged or incorrect
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                Contact support within 7 days with your order number and photos. See our{' '}
                <Link
                  href="/returns"
                  className="font-medium text-brand-deep underline-offset-2 hover:underline"
                >
                  return policy
                </Link>{' '}
                for next steps.
              </p>
            </div>
          </div>
        </div>
      </MarketingSection>

      <section className="border-t border-neutral-200 bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-natural">
              Customs & destinations
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-brand-deep sm:text-3xl">
              International research shipments
            </h2>
            <p className="mt-4 text-neutral-600">
              International shipments may be subject to local import rules. Customers are responsible
              for ensuring products are permitted for import into their jurisdiction for research use
              only. Contact us before ordering if you need destination guidance.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                Contact support
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 font-semibold text-brand-natural transition-colors hover:text-brand-deep"
              >
                View FAQ
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-8">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <Plane className="h-5 w-5 text-brand-leaf" aria-hidden />
            </div>
            <h2 className="font-heading text-xl font-bold sm:text-2xl">Ready to order?</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Choose Standard or Priority Express at checkout after you confirm SKUs and
              documentation for your laboratory protocol.
            </p>
            <Link
              href="/checkout"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-pale"
            >
              Go to checkout
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-brand-pale via-white to-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <ResearchUseBanner />
        </div>
      </section>
    </>
  );
}
