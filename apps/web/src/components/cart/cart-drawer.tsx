'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { formatCurrency } from '@/lib/utils';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-brand-deep" />
                <h2 className="font-heading text-lg font-semibold text-brand-deep">Cart</h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
                  <p className="font-heading text-lg font-semibold text-brand-deep">
                    Your cart is empty
                  </p>
                  <p className="mt-2 text-sm text-neutral-500">
                    Browse the live catalog and add research products.
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setCartOpen(false)}
                    className="mt-5 inline-flex rounded-lg bg-brand-deep px-4 py-2 text-sm font-semibold text-white hover:bg-brand-natural"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.productId} className="border-b border-neutral-100 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{item.productName}</p>
                          <p className="text-xs text-neutral-500">{item.productSku}</p>
                          <p className="mt-1 text-sm text-brand-deep">
                            {formatCurrency(item.unitPrice)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeItem(item.productId)}
                          className="text-xs font-medium text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <label className="sr-only" htmlFor={`qty-${item.productId}`}>
                          Quantity for {item.productName}
                        </label>
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
                          className="w-20 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-neutral-200 px-5 py-4">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold text-brand-deep">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-deep px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-natural"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/cart?quote=1"
                    onClick={() => setCartOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg border border-brand-deep px-4 py-2.5 text-sm font-semibold text-brand-deep hover:bg-brand-pale"
                  >
                    Request Quote
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
