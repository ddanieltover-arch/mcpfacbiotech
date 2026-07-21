'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Beaker, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { createQuoteFromCart } from '@/lib/commerce-api';
import { displayProductSku, formatCurrency } from '@/lib/utils';

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

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 12% 20%, rgba(27, 67, 50, 0.08) 0%, transparent 42%), radial-gradient(circle at 88% 10%, rgba(82, 121, 111, 0.1) 0%, transparent 36%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-14">
          <p className="mb-3 text-sm font-medium uppercase tracking-wide text-brand-natural">
            Procurement
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight text-brand-deep sm:text-5xl">
            Shopping cart
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            Review live catalog items, adjust quantities, then checkout or request a laboratory
            quotation.
          </p>
          {items.length > 0 ? (
            <p className="mt-4 text-sm text-neutral-500">
              {itemCount} item{itemCount === 1 ? '' : 's'} · Subtotal {formatCurrency(subtotal)}
            </p>
          ) : null}
        </div>
      </section>

      <section className="bg-neutral-50/80 bg-lab-pattern py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-neutral-200/80">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pale text-brand-deep">
                <ShoppingCart className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="font-heading text-xl font-semibold text-brand-deep">
                Your cart is empty
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                Add research products from the catalog to continue to checkout or quotation.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-deep px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural"
              >
                Browse products
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
                  <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-pale/40 to-white px-5 py-4 sm:px-6">
                    <h2 className="font-heading text-lg font-semibold text-brand-deep">
                      Cart items
                    </h2>
                  </div>
                  <ul className="divide-y divide-neutral-100 px-5 sm:px-6">
                    {items.map((item) => {
                      const sku = displayProductSku(item.productSku);
                      return (
                        <li
                          key={item.productId}
                          className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-start gap-4">
                            <Link
                              href={
                                item.productSlug ? `/products/${item.productSlug}` : '/products'
                              }
                              className="relative h-20 w-20 shrink-0 overflow-hidden bg-brand-pale/40 ring-1 ring-neutral-200/80"
                            >
                              {item.productImage ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-brand-natural">
                                  <Beaker className="h-8 w-8" strokeWidth={1.25} />
                                </div>
                              )}
                            </Link>
                            <div className="min-w-0">
                              <Link
                                href={
                                  item.productSlug ? `/products/${item.productSlug}` : '/products'
                                }
                                className="font-heading text-base font-semibold text-brand-deep hover:text-brand-natural"
                              >
                                {item.productName}
                              </Link>
                              {sku ? (
                                <p className="mt-0.5 text-xs text-neutral-500">SKU {sku}</p>
                              ) : null}
                              <p className="mt-1 text-sm text-neutral-700">
                                {formatCurrency(item.unitPrice)} each
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="inline-flex items-center overflow-hidden rounded-lg ring-1 ring-neutral-200">
                              <button
                                type="button"
                                className="px-2.5 py-2 text-neutral-600 transition-colors hover:bg-neutral-50"
                                aria-label={`Decrease quantity of ${item.productName}`}
                                onClick={() => {
                                  void updateQuantity(
                                    item.productId,
                                    Math.max(1, item.quantity - 1),
                                  ).catch((error: unknown) => {
                                    toast.error(
                                      error instanceof Error
                                        ? error.message
                                        : 'Quantity update failed',
                                    );
                                  });
                                }}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(event) => {
                                  const next = Number(event.target.value);
                                  if (Number.isFinite(next)) {
                                    void updateQuantity(item.productId, next).catch(
                                      (error: unknown) => {
                                        toast.error(
                                          error instanceof Error
                                            ? error.message
                                            : 'Quantity update failed',
                                        );
                                      },
                                    );
                                  }
                                }}
                                className="w-12 border-x border-neutral-200 bg-white py-2 text-center text-sm outline-none"
                                aria-label={`Quantity for ${item.productName}`}
                              />
                              <button
                                type="button"
                                className="px-2.5 py-2 text-neutral-600 transition-colors hover:bg-neutral-50"
                                aria-label={`Increase quantity of ${item.productName}`}
                                onClick={() => {
                                  void updateQuantity(item.productId, item.quantity + 1).catch(
                                    (error: unknown) => {
                                      toast.error(
                                        error instanceof Error
                                          ? error.message
                                          : 'Quantity update failed',
                                      );
                                    },
                                  );
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="w-24 text-right font-heading text-sm font-bold text-brand-deep">
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
                              className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label={`Remove ${item.productName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/80 sm:p-6">
                  <label
                    htmlFor="cart-notes"
                    className="block font-heading text-sm font-semibold text-brand-deep"
                  >
                    Cart notes
                  </label>
                  <p className="mt-1 text-xs text-neutral-500">
                    Optional notes for quotation or fulfilment (delivery timing, packaging, etc.).
                  </p>
                  <textarea
                    id="cart-notes"
                    value={localNotes}
                    onChange={(event) => setLocalNotes(event.target.value)}
                    onBlur={() => {
                      if (localNotes !== (notes ?? '')) {
                        void setNotes(localNotes).catch((error: unknown) => {
                          toast.error(
                            error instanceof Error ? error.message : 'Notes update failed',
                          );
                        });
                      }
                    }}
                    rows={3}
                    className="mt-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-brand-leaf focus:ring-2 focus:ring-brand-leaf/20"
                    placeholder="Delivery timing, research use notes, packaging preferences…"
                  />
                </div>
              </div>

              <aside className="h-fit overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80 lg:sticky lg:top-28">
                <div className="border-b border-neutral-100 bg-gradient-to-r from-brand-pale/50 to-white px-5 py-4">
                  <h2 className="font-heading text-lg font-semibold text-brand-deep">Summary</h2>
                </div>
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Subtotal</span>
                    <span className="font-heading text-xl font-bold text-brand-deep">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                    Prices are recalculated server-side from the live catalog. Shipping is selected
                    at checkout.
                  </p>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      href="/checkout"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
                    >
                      Checkout
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      disabled={isPending || isSyncing}
                      onClick={handleRequestQuote}
                      className="rounded-lg border-2 border-brand-deep px-4 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-pale disabled:opacity-60"
                    >
                      {isPending ? 'Creating quote…' : 'Request quote'}
                    </button>
                    <Link
                      href="/products"
                      className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-brand-natural transition-colors hover:text-brand-deep"
                    >
                      Continue shopping
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        void clearCart().catch((error: unknown) => {
                          toast.error(error instanceof Error ? error.message : 'Clear failed');
                        });
                      }}
                      className="mt-1 text-sm text-neutral-500 transition-colors hover:text-red-600"
                    >
                      Clear cart
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
