import { CATEGORY_OPTIONS } from '@/lib/catalog-api';

/** Shared public navigation (CONTENT-9). */

export const PRODUCT_NAV_CHILDREN = [
  { name: 'All Products', href: '/products' },
  ...CATEGORY_OPTIONS.map((category) => ({
    name: category.label,
    href: `/products?category=${category.slug}`,
  })),
] as const;

export const SOLUTION_NAV_CHILDREN = [
  {
    name: 'For Universities',
    href: '/solutions/universities',
    description: 'Academic procurement and multi-line quotations',
  },
  {
    name: 'For Research Labs',
    href: '/solutions/research-labs',
    description: 'Catalog supply with clear specifications',
  },
  {
    name: 'For Pharma Companies',
    href: '/solutions/pharmaceutical',
    description: 'Documentation-ready R&D purchasing',
  },
  {
    name: 'For Distributors',
    href: '/solutions/distributors',
    description: 'Wholesale quoting and partner support',
  },
] as const;

export const RESOURCE_NAV_CHILDREN = [
  { name: 'Research Library', href: '/research' },
  { name: 'Blog', href: '/blog' },
  { name: 'FAQ', href: '/faq' },
  { name: 'COA Library', href: '/coa' },
  { name: 'Peptide Calculator', href: '/calculator' },
  { name: 'Quality Assurance', href: '/quality' },
  { name: 'Downloads', href: '/downloads' },
] as const;

export const MAIN_NAV = [
  {
    name: 'Products',
    href: '/products',
    children: PRODUCT_NAV_CHILDREN,
  },
  {
    name: 'Solutions',
    href: '/solutions',
    children: SOLUTION_NAV_CHILDREN,
  },
  {
    name: 'Resources',
    href: '/research',
    children: RESOURCE_NAV_CHILDREN,
  },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
] as const;

export const FOOTER_PRODUCT_LINKS = [
  ...CATEGORY_OPTIONS.map((category) => ({
    name: category.label,
    href: `/products?category=${category.slug}`,
  })),
  { name: 'All Products', href: '/products' },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Research Library', href: '/research' },
  { name: 'Blog', href: '/blog' },
  { name: 'Quality Assurance', href: '/quality' },
  { name: 'Careers', href: '/careers' },
] as const;

export const FOOTER_SUPPORT_LINKS = [
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'COA Library', href: '/coa' },
  { name: 'Peptide Calculator', href: '/calculator' },
  { name: 'Downloads Center', href: '/downloads' },
  { name: 'Shipping Information', href: '/shipping' },
  { name: 'Support Tickets', href: '/support' },
] as const;

export const FOOTER_LEGAL_LINKS = [
  { name: 'Terms & Conditions', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Return Policy', href: '/returns' },
  { name: 'Cookie Policy', href: '/cookies' },
] as const;

export const HEADER_TOP_LINKS = [
  { name: 'FAQ', href: '/faq' },
  { name: 'COA', href: '/coa' },
  { name: 'Calculator', href: '/calculator' },
  { name: 'Shipping', href: '/shipping' },
  { name: 'Support', href: '/support' },
] as const;
