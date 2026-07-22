import { PageTransition } from '@/components/layout/page-transition';

/**
 * Remounts on client navigations within `(main)`.
 * Soft fade applies to marketing/catalog routes only — see PageTransition.
 */
export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
