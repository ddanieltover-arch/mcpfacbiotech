'use client';

import { Heart, Scale, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCompareStore } from '@/stores/compare.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { createQuoteFromItems } from '@/lib/commerce-api';

export function ProductActions({
  productId,
  productName,
  productSku,
  unitPrice,
  productImage,
  minimumOrderQuantity = 1,
}: {
  productId: string;
  productName: string;
  productSku: string;
  unitPrice?: number;
  productImage?: string;
  minimumOrderQuantity?: number;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const hasWishlist = useWishlistStore((s) => s.hasItem(productId));
  const toggleCompare = useCompareStore((s) => s.toggleItem);
  const hasCompare = useCompareStore((s) => s.hasItem(productId));
  const isCompareFull = useCompareStore((s) => s.isFull());
  const addToCart = useCartStore((s) => s.addItem);

  const handleWishlist = () => {
    toggleWishlist(productId);
    toast.success(hasWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleCompare = () => {
    const success = toggleCompare(productId);
    if (!success && !hasCompare) {
      toast.error('Compare list is full (max 4 products)');
      return;
    }
    toast.success(hasCompare ? 'Removed from compare' : 'Added to compare');
  };

  const handleAddToCart = async () => {
    if (unitPrice == null) {
      toast.error('Pricing unavailable — request a quote instead');
      return;
    }

    try {
      await addToCart(
        {
          productId,
          productName,
          productSku,
          productImage,
          unitPrice,
        },
        minimumOrderQuantity,
      );
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleRequestQuote = async () => {
    if (!user) {
      router.push(`/login?redirect=/products`);
      return;
    }

    try {
      const quote = await createQuoteFromItems({
        items: [{ productId, quantity: minimumOrderQuantity }],
        notes: unitPrice == null ? 'Unpriced catalog item — pricing requested' : undefined,
      });
      toast.success(`Draft quote ${quote.quoteNumber} created`);
      router.push(`/quotes/${quote.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create quote');
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {unitPrice != null ? (
        <button
          type="button"
          onClick={() => void handleAddToCart()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-deep px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void handleRequestQuote()}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-deep px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
        >
          Request Quote
        </button>
      )}
      <button
        type="button"
        onClick={handleWishlist}
        className={`inline-flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
          hasWishlist
            ? 'border-brand-deep bg-brand-pale text-brand-deep'
            : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
        }`}
        aria-label={hasWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`h-4 w-4 ${hasWishlist ? 'fill-brand-deep' : ''}`} />
      </button>
      <button
        type="button"
        onClick={handleCompare}
        disabled={!hasCompare && isCompareFull}
        className={`inline-flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          hasCompare
            ? 'border-brand-deep bg-brand-pale text-brand-deep'
            : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
        }`}
        aria-label={hasCompare ? 'Remove from compare' : 'Add to compare'}
      >
        <Scale className="h-4 w-4" />
      </button>
    </div>
  );
}
