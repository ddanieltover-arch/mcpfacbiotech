import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

/**
 * Public layout with Header and Footer.
 * All public-facing pages use this layout (products, categories, blog, etc.).
 * Auth pages use a separate (auth) route group.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
