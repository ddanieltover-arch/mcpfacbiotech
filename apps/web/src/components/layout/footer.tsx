'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const productLinks = [
  { name: 'Research Peptides', href: '/products?category=research-peptides' },
  { name: 'Research Chemicals', href: '/products?category=research-chemicals' },
  { name: 'Laboratory Supplies', href: '/products?category=laboratory-supplies' },
  { name: 'Analytical Standards', href: '/products?category=analytical-standards' },
  { name: 'All Products', href: '/products' },
];

const companyLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Research & Development', href: '/research' },
  { name: 'Quality Assurance', href: '/quality' },
  { name: 'Careers', href: '/careers' },
  { name: 'Blog', href: '/blog' },
];

const supportLinks = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Downloads Center', href: '/downloads' },
  { name: 'Shipping Information', href: '/shipping' },
  { name: 'Support Tickets', href: '/support' },
];

const legalLinks = [
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Return Policy', href: '/returns' },
  { name: 'Cookie Policy', href: '/cookies' },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Logo size="sm" className="mb-4" />
            <p className="mb-6 max-w-xs text-sm text-neutral-600">
              Global biotechnology research laboratory and supplier of peptides,
              research chemicals, and laboratory products. Established 2016.
            </p>
            <p className="mb-4 font-heading text-sm font-semibold tracking-wide text-brand-natural">
              Learn • Understand • Grow
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-leaf" />
                <a href="mailto:info@mcpfacbiotech.cn" className="hover:text-brand-deep">
                  info@mcpfacbiotech.cn
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-leaf" />
                <span>+86 (0) XXX-XXXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-leaf" />
                <span>Guangzhou, China</span>
              </div>
            </div>
          </div>

          {/* Links columns */}
          <FooterLinkColumn title="Products" links={productLinks} />
          <FooterLinkColumn title="Company" links={companyLinks} />

          <div>
            <FooterLinkColumn title="Support" links={supportLinks} />
            <div className="mt-8">
              <FooterLinkColumn title="Legal" links={legalLinks} />
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter bar */}
      <div className="border-t border-neutral-200 bg-brand-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
          <div className="text-center md:text-left">
            <h3 className="font-heading text-sm font-semibold text-white">
              Stay updated with the latest research
            </h3>
            <p className="text-xs text-brand-light">
              Subscribe to our newsletter for new products, research articles, and promotions.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full max-w-sm gap-2"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 outline-none transition-colors focus:border-brand-leaf focus:bg-white/15"
              required
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-leaf px-5 py-2 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-light"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-neutral-400 md:flex-row">
          <span>© 2016–{new Date().getFullYear()} MCPFAC BIOTECH. All rights reserved.</span>
          <span>Biotechnology research products — For research use only. Not for human consumption.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { name: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-heading text-sm font-semibold text-neutral-900">{title}</h4>
      <ul className="space-y-2.5">
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
