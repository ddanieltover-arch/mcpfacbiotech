import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { getCategoryOptions } from '@/lib/catalog-api';

/**
 * Public layout with Header and Footer.
 * All public-facing pages use this layout (products, categories, blog, etc.).
 * Auth pages use a separate (auth) route group.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const productCategories = await getCategoryOptions();

  return (
    <div className="flex min-h-dvh flex-col">
      <Header productCategories={productCategories} />
      <main className="flex-1">{children}</main>
      <Footer productCategories={productCategories} />
      <MobileBottomNav />
      <CartDrawer />
    </div>
  );
}
