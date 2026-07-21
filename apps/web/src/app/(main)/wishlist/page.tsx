import type { Metadata } from 'next';
import { WishlistPageClient } from './wishlist-page-client';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Review saved research products in your MCPFAC BIOTECH wishlist.',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
