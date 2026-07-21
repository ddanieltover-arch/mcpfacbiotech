'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { createQuoteFromCart } from '@/lib/commerce-api';
import { formatCurrency } from '@/lib/utils';

export function CartPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const items = useCartStore((s) => s.items);
  const notes = useCartStore((s) => s.notes);
  const subtotal = useCartStore((s) => s.subtotal());
  const isSyncing = useCartStore((s) => s.isSyncing);
  const refreshFromServer = useCartStore((s) => s.refreshFromServer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setNotes = useCartStore((s) => s.setNotes);
  const clearCart = useCartStore((s) => s.clearCart);

  const [localNotes, setLocalNotes] = useState(notes ?? '');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void refreshFromServer();
  }, [refreshFromServer]);

  useEffect(() => {
    setLocalNotes(notes ?? '');
  }, [notes]);

  useEffect(() => {
    if (searchParams.get('quote') === '1' && items.length > 0) {
      // Auto-prompt handled by button focus; no auto-submit.
    }
  }, [searchParams, items.length]);

  const handleRequestQuote = () => {
    if (!user) {
      router.push('/login?redirect=/cart?quote=1');
      return;
    }

    if (items.length === 0) {
      toast.error('Add products from the catalog before requesting a quote');
      return;
    }

    startTransition(async () => {
      try {
        if (localNotes !== (notes ?? '')) {
          await setNotes(localNotes);
        }
        const quote = await createQuoteFromCart({ notes: localNotes || undefined });
        toast.success(`Draft quote ${quote.quoteNumber} created`);
        router.push(`/quotes/${quote.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create quote');
      }
    });
  };

  return (
    <div className="bg-neutral-50">
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="font-heading text-4xl font-bold text-brand-deep">Shopping Cart</h1>
          <p className="mt-3 text-neutral-600">
            Review live catalog items, adjust quantities, then request a quotation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <h2 className="font-heading text-xl font-semibold text-brand-deep">Your cart is empty</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Add products from the imported research catalog to continue.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-3 border-b border-neutral-100 pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      href={item.productSlug ? `/products/${item.productSlug}` : '/products'}
                      className="font-medium text-brand-deep hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-neutral-500">{item.productSku}</p>
                    <p className="mt-1 text-sm text-neutral-700">{formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (Number.isFinite(next)) {
                          void updateQuantity(item.productId, next).catch((error: unknown) => {
                            toast.error(
                              error instanceof Error ? error.message : 'Quantity update failed',
                            );
                          });
                        }
                      }}
                      className="w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                      aria-label={`Quantity for ${item.productName}`}
                    />
                    <p className="w-24 text-right text-sm font-semibold text-brand-deep">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        void removeItem(item.productId).catch((error: unknown) => {
                          toast.error(
                            error instanceof Error ? error.message : 'Remove failed',
                          );
                        });
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div>
                <label htmlFor="cart-notes" className="mb-2 block text-sm font-medium text-neutral-700">
                  Cart notes
                </label>
                <textarea
                  id="cart-notes"
                  value={localNotes}
                  onChange={(event) => setLocalNotes(event.target.value)}
                  onBlur={() => {
                    if (localNotes !== (notes ?? '')) {
                      void setNotes(localNotes).catch((error: unknown) => {
                        toast.error(error instanceof Error ? error.message : 'Notes update failed');
                      });
                    }
                  }}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  placeholder="Delivery timing, research use notes, packaging preferences…"
                />
              </div>
            </div>

            <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-deep">Summary</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold text-brand-deep">{formatCurrency(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Prices are recalculated server-side from the live catalog.
              </p>
                <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/checkout"
                  className="rounded-lg bg-brand-deep px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-natural"
                >
                  Checkout
                </Link>
                <button
                  type="button"
                  disabled={isPending || isSyncing}
                  onClick={handleRequestQuote}
                  className="rounded-lg border border-brand-deep px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-pale disabled:opacity-60"
                >
                  {isPending ? 'Creating quote…' : 'Request Quote'}
                </button>
                <Link
                  href="/products"
                  className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void clearCart().catch((error: unknown) => {
                      toast.error(error instanceof Error ? error.message : 'Clear failed');
                    });
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
