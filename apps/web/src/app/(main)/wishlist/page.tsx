import type { Metadata } from 'next';
import { WishlistPageClient } from './wishlist-page-client';

export const metadata: Metadata = {
  title: 'Wishlist | MCPFAC BIOTECH',
  description: 'Review saved research products in your MCPFAC BIOTECH wishlist.',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
