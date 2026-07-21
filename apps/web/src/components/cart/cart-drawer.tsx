'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Beaker, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { displayProductSku, formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const refreshFromServer = useCartStore((s) => s.refreshFromServer);

  useEffect(() => {
    if (isOpen) {
      void refreshFromServer();
    }
  }, [isOpen, refreshFromServer]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCartOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setCartOpen]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-40 bg-brand-deep/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="border-b border-neutral-200 bg-gradient-to-r from-brand-pale/50 to-white px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-deep text-white">
                      <ShoppingCart className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-heading text-lg font-semibold text-brand-deep">Cart</h2>
                      <p className="text-xs text-neutral-500">
                        {itemCount === 0
                          ? 'No items yet'
                          : `${itemCount} item${itemCount === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-white hover:text-brand-deep"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="rounded-2xl bg-neutral-50 px-6 py-10 text-center ring-1 ring-neutral-200/80">
                  <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-pale text-brand-deep">
                    <ShoppingCart className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="font-heading text-lg font-semibold text-brand-deep">
                    Your cart is empty
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Browse the research catalog and add materials for quotation or checkout.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setCartOpen(false)}
                    className="mt-5 inline-flex rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {items.map((item) => {
                    const sku = displayProductSku(item.productSku);
                    return (
                      <li key={item.productId} className="py-4 first:pt-0">
                        <div className="flex items-start gap-3">
                          <Link
                            href={item.productSlug ? `/products/${item.productSlug}` : '/products'}
                            onClick={() => setCartOpen(false)}
                            className="relative h-16 w-16 shrink-0 overflow-hidden bg-brand-pale/40 ring-1 ring-neutral-200/80"
                          >
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-brand-natural">
                                <Beaker className="h-6 w-6" strokeWidth={1.25} />
                              </div>
                            )}
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <Link
                                  href={
                                    item.productSlug ? `/products/${item.productSlug}` : '/products'
                                  }
                                  onClick={() => setCartOpen(false)}
                                  className="block truncate font-heading text-sm font-semibold text-brand-deep hover:text-brand-natural"
                                >
                                  {item.productName}
                                </Link>
                                {sku ? (
                                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                                    SKU {sku}
                                  </p>
                                ) : null}
                                <p className="mt-1 text-sm font-medium text-brand-deep">
                                  {formatCurrency(item.unitPrice)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => void removeItem(item.productId)}
                                className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                aria-label={`Remove ${item.productName}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="inline-flex items-center overflow-hidden rounded-lg ring-1 ring-neutral-200">
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-50"
                                  aria-label={`Decrease quantity of ${item.productName}`}
                                  onClick={() =>
                                    void updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                                  }
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <input
                                  id={`qty-${item.productId}`}
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(event) => {
                                    const next = Number(event.target.value);
                                    if (Number.isFinite(next)) {
                                      void updateQuantity(item.productId, next);
                                    }
                                  }}
                                  className="w-10 border-x border-neutral-200 bg-white py-1.5 text-center text-sm outline-none"
                                  aria-label={`Quantity for ${item.productName}`}
                                />
                                <button
                                  type="button"
                                  className="px-2.5 py-1.5 text-neutral-600 transition-colors hover:bg-neutral-50"
                                  aria-label={`Increase quantity of ${item.productName}`}
                                  onClick={() =>
                                    void updateQuantity(item.productId, item.quantity + 1)
                                  }
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-sm font-semibold text-brand-deep">
                                {formatCurrency(item.unitPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-200 bg-neutral-50/80 px-5 py-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Subtotal</span>
                  <span className="font-heading text-lg font-bold text-brand-deep">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <p className="mb-4 text-xs text-neutral-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-natural"
                  >
                    View cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg border-2 border-brand-deep px-4 py-2.5 text-sm font-semibold text-brand-deep transition-colors hover:bg-white"
                  >
                    Quick checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
