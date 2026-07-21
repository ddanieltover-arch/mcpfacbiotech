'use client';

import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { NewsletterForm } from '@/components/layout/newsletter-form';
import { CONTACT_CHANNELS } from '@/lib/marketing-content';
import {
  FOOTER_COMPANY_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRODUCT_LINKS,
  FOOTER_SUPPORT_LINKS,
} from '@/lib/site-navigation';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo size="sm" className="mb-4" />
            <p className="mb-6 max-w-xs text-sm text-neutral-600">
              Global biotechnology research laboratory and supplier of peptides, research chemicals,
              and laboratory products. Established 2016.
            </p>
            <p className="mb-4 font-heading text-sm font-semibold tracking-wide text-brand-natural">
              Learn • Understand • Grow
            </p>

            <div className="space-y-2 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-leaf" />
                <a href={`mailto:${CONTACT_CHANNELS.email}`} className="hover:text-brand-deep">
                  {CONTACT_CHANNELS.email}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-leaf" />
                <span>{CONTACT_CHANNELS.address}</span>
              </div>
              <p className="text-xs text-neutral-400">{CONTACT_CHANNELS.hours}</p>
            </div>
          </div>

          <FooterLinkColumn title="Shop" links={[...FOOTER_PRODUCT_LINKS]} />
          <FooterLinkColumn title="Company" links={[...FOOTER_COMPANY_LINKS]} />
          <FooterLinkColumn title="Support" links={[...FOOTER_SUPPORT_LINKS]} />
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-8">
          <FooterLinkColumn title="Legal" links={[...FOOTER_LEGAL_LINKS]} horizontal />
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-brand-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="font-heading text-sm font-semibold text-white">
              Stay updated with the latest research
            </h3>
            <p className="text-xs text-brand-light">
              Subscribe for new products, research articles, and documentation updates.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-neutral-400 md:flex-row">
          <span>© 2016–{new Date().getFullYear()} MCPFAC BIOTECH. All rights reserved.</span>
          <span>
            Biotechnology research products — For research use only. Not for human consumption.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
  horizontal = false,
}: {
  title: string;
  links: { name: string; href: string }[];
  horizontal?: boolean;
}) {
  return (
    <div>
      <h4 className="mb-4 font-heading text-sm font-semibold text-neutral-900">{title}</h4>
      <ul className={horizontal ? 'flex flex-wrap items-center gap-x-5 gap-y-2' : 'space-y-2.5'}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-neutral-500 transition-colors hover:text-brand-deep"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
