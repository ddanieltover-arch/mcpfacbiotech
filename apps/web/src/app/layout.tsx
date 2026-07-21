import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MCPFAC BIOTECH — Biotechnology Research Products & Laboratory Supplies',
    template: '%s | MCPFAC BIOTECH',
  },
  description:
    'MCPFAC BIOTECH is a global biotechnology research laboratory and supplier of peptides, ' +
    'research chemicals, and laboratory products. Serving research institutions, universities, ' +
    'and pharmaceutical companies worldwide. Learn • Understand • Grow.',
  keywords: [
    'biotechnology',
    'research chemicals',
    'peptides',
    'laboratory supplies',
    'research products',
    'COA',
    'MSDS',
    'HPLC',
    'MCPFAC BIOTECH',
    'B2B laboratory',
    'research laboratory',
    'peptide manufacturer',
  ],
  authors: [{ name: 'MCPFAC BIOTECH' }],
  creator: 'MCPFAC BIOTECH',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'MCPFAC BIOTECH',
    title: 'MCPFAC BIOTECH — Biotechnology Research Products',
    description:
      'Global biotechnology research laboratory and supplier of peptides, research chemicals, ' +
      'and laboratory products.',
    images: [
      {
        url: '/og-image.jpg',
        width: 512,
        height: 512,
        alt: 'MCPFAC BIOTECH — Learn • Understand • Grow',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'MCPFAC BIOTECH — Biotechnology Research Products',
    description:
      'Global biotechnology research laboratory and supplier of peptides, research chemicals, ' +
      'and laboratory products.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-white font-sans text-neutral-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
