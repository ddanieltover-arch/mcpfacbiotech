import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { CartItem, CartSummary } from '@mcpfac/shared-types';
import {
  addCartItem,
  clearServerCart,
  fetchCart,
  mergeCartOnLogin,
  removeCartItem,
  updateCartItemQuantity,
  updateCartNotes,
} from '@/lib/commerce-api';

type LocalCartItem = {
  productId: string;
  productName: string;
  productSku: string;
  productSlug?: string;
  productImage?: string;
  variantId?: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
};

interface CartStore {
  items: LocalCartItem[];
  cartId: string;
  notes?: string;
  currency: string;
  isOpen: boolean;
  isSyncing: boolean;
  pendingSyncs: number;
  lastError?: string;

  addItem: (item: Omit<LocalCartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  setNotes: (notes: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
  mergeOnLogin: () => Promise<void>;
  applyServerCart: (cart: CartSummary) => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;

  itemCount: () => number;
  subtotal: () => number;
}

function toLocalItems(items: CartItem[]): LocalCartItem[] {
  return items.map((item) => ({
    productId: item.productId,
    productName: item.variantLabel
      ? `${item.productName} (${item.variantLabel})`
      : item.productName,
    productSku: item.productSku,
    productSlug: item.productSlug,
    productImage: item.productImage,
    variantId: item.variantId,
    variantLabel: item.variantLabel,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
  }));
}

function sameLine(
  a: { productId: string; variantId?: string },
  b: { productId: string; variantId?: string },
) {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

/** Keep selected dosage labels/prices when the live API still omits variant fields. */
function mergeServerItemsWithLocal(
  serverItems: LocalCartItem[],
  previousItems: LocalCartItem[],
): LocalCartItem[] {
  return serverItems.map((serverItem) => {
    const local =
      previousItems.find((item) => sameLine(item, serverItem)) ??
      previousItems.find(
        (item) =>
          item.productId === serverItem.productId &&
          !serverItem.variantId &&
          Boolean(item.variantId),
      );

    if (!local?.variantLabel || serverItem.variantLabel) {
      return serverItem;
    }

    return {
      ...serverItem,
      variantId: local.variantId,
      variantLabel: local.variantLabel,
      productName: local.productName,
      unitPrice: local.unitPrice,
    };
  });
}

/** Serialize cart API writes so stale responses cannot overwrite newer local state. */
let syncChain: Promise<void> = Promise.resolve();
let appliedSyncSeq = 0;
let issuedSyncSeq = 0;

function enqueueSync(task: (seq: number) => Promise<void>): Promise<void> {
  const seq = ++issuedSyncSeq;
  const run = syncChain.then(async () => {
    try {
      await task(seq);
    } finally {
      // chain continues even if task throws
    }
  });
  syncChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

type CartSet = (
  partial: Partial<CartStore> | ((state: CartStore) => Partial<CartStore>),
) => void;

function beginSync(set: CartSet) {
  // Increment immediately (before the async queue runs) so drawer refresh cannot race.
  set((state) => ({
    isSyncing: true,
    pendingSyncs: state.pendingSyncs + 1,
  }));
}

function endSync(set: CartSet) {
  set((state) => ({
    isSyncing: state.pendingSyncs <= 1 ? false : true,
    pendingSyncs: Math.max(0, state.pendingSyncs - 1),
  }));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: '',
      notes: undefined,
      currency: 'USD',
      isOpen: false,
      isSyncing: false,
      pendingSyncs: 0,
      lastError: undefined,

      applyServerCart: (cart) => {
        const previousItems = get().items;
        set({
          cartId: cart.id,
          items: mergeServerItemsWithLocal(toLocalItems(cart.items), previousItems),
          notes: cart.notes,
          currency: cart.currency,
          lastError: undefined,
        });
      },

      refreshFromServer: async () => {
        // Never clobber optimistic state while writes are still draining.
        if (get().pendingSyncs > 0 || get().isSyncing) {
          return;
        }

        set({ isSyncing: true });
        try {
          const cart = await fetchCart();
          if (get().pendingSyncs > 0) {
            return;
          }
          get().applyServerCart(cart);
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to load cart',
          });
        } finally {
          set({ isSyncing: false });
        }
      },

      mergeOnLogin: async () => {
        beginSync(set);
        await enqueueSync(async (seq) => {
          try {
            const cart = await mergeCartOnLogin();
            if (seq >= appliedSyncSeq) {
              appliedSyncSeq = seq;
              get().applyServerCart(cart);
            }
          } catch (error) {
            set({
              lastError: error instanceof Error ? error.message : 'Failed to merge cart',
            });
          } finally {
            endSync(set);
          }
        });
      },

      addItem: async (item, quantity = 1) => {
        beginSync(set);

        // Optimistic local update — UI updates immediately; sync is still awaited by callers.
        set((state) => {
          const idx = state.items.findIndex((i) => sameLine(i, item));
          if (idx >= 0) {
            const updated = [...state.items];
            updated[idx] = {
              ...updated[idx]!,
              quantity: updated[idx]!.quantity + quantity,
            };
            return { items: updated, isOpen: true, lastError: undefined };
          }
          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
            lastError: undefined,
          };
        });

        await enqueueSync(async (seq) => {
          try {
            const cart = await addCartItem(item.productId, quantity, item.variantId);
            if (seq >= appliedSyncSeq) {
              appliedSyncSeq = seq;
              get().applyServerCart(cart);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to add item';
            set((state) => {
              let idx = state.items.findIndex((i) => sameLine(i, item));
              if (idx < 0) {
                idx = state.items.findIndex((i) => i.productId === item.productId);
              }
              if (idx < 0) {
                return { lastError: message };
              }
              const current = state.items[idx]!;
              const nextQty = current.quantity - quantity;
              const items =
                nextQty <= 0
                  ? state.items.filter((_, i) => i !== idx)
                  : state.items.map((line, i) =>
                      i === idx ? { ...line, quantity: nextQty } : line,
                    );
              return { lastError: message, items };
            });
            toast.error(message);
            throw error;
          } finally {
            endSync(set);
          }
        });
      },

      removeItem: async (productId, variantId) => {
        const snapshot = get().items;
        beginSync(set);
        set((state) => ({
          items: state.items.filter((i) => !sameLine(i, { productId, variantId })),
        }));

        await enqueueSync(async (seq) => {
          try {
            const cart = await removeCartItem(productId, variantId);
            if (seq >= appliedSyncSeq) {
              appliedSyncSeq = seq;
              get().applyServerCart(cart);
            }
          } catch (error) {
            set({
              lastError: error instanceof Error ? error.message : 'Failed to remove item',
              items: snapshot,
            });
            throw error;
          } finally {
            endSync(set);
          }
        });
      },

      updateQuantity: async (productId, quantity, variantId) => {
        if (quantity <= 0) {
          await get().removeItem(productId, variantId);
          return;
        }

        const snapshot = get().items;
        beginSync(set);
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, { productId, variantId }) ? { ...i, quantity } : i,
          ),
        }));

        await enqueueSync(async (seq) => {
          try {
            const cart = await updateCartItemQuantity(productId, quantity, variantId);
            if (seq >= appliedSyncSeq) {
              appliedSyncSeq = seq;
              get().applyServerCart(cart);
            }
          } catch (error) {
            set({
              lastError: error instanceof Error ? error.message : 'Failed to update quantity',
              items: snapshot,
            });
            throw error;
          } finally {
            endSync(set);
          }
        });
      },

      setNotes: async (notes) => {
        set({ notes });
        beginSync(set);
        await enqueueSync(async (seq) => {
          try {
            const cart = await updateCartNotes(notes);
            if (seq >= appliedSyncSeq) {
              appliedSyncSeq = seq;
              get().applyServerCart(cart);
            }
          } catch (error) {
            set({
              lastError: error instanceof Error ? error.message : 'Failed to update notes',
            });
            throw error;
          } finally {
            endSync(set);
          }
        });
      },

      clearCart: async () => {
        set({ items: [], notes: undefined, cartId: '' });
        beginSync(set);
        await enqueueSync(async (seq) => {
          try {
            const cart = await clearServerCart();
            if (seq >= appliedSyncSeq) {
              appliedSyncSeq = seq;
              get().applyServerCart(cart);
            }
          } catch (error) {
            set({
              lastError: error instanceof Error ? error.message : 'Failed to clear cart',
            });
            throw error;
          } finally {
            endSync(set);
          }
        });
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (isOpen) => set({ isOpen }),

      itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
      subtotal: () =>
        get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    }),
    {
      name: 'mcpfac-cart',
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        notes: state.notes,
        currency: state.currency,
      }),
    },
  ),
);
