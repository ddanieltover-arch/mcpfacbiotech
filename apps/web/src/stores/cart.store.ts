import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  lastError?: string;

  addItem: (item: Omit<LocalCartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
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
    productName: item.productName,
    productSku: item.productSku,
    productSlug: item.productSlug,
    productImage: item.productImage,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
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
      lastError: undefined,

      applyServerCart: (cart) => {
        set({
          cartId: cart.id,
          items: toLocalItems(cart.items),
          notes: cart.notes,
          currency: cart.currency,
          lastError: undefined,
        });
      },

      refreshFromServer: async () => {
        set({ isSyncing: true });
        try {
          const cart = await fetchCart();
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
        set({ isSyncing: true });
        try {
          const cart = await mergeCartOnLogin();
          get().applyServerCart(cart);
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to merge cart',
          });
        } finally {
          set({ isSyncing: false });
        }
      },

      addItem: async (item, quantity = 1) => {
        // Optimistic local update
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.productId === item.productId);
          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex]!,
              quantity: updated[existingIndex]!.quantity + quantity,
            };
            return { items: updated, isOpen: true };
          }
          return {
            items: [...state.items, { ...item, quantity }],
            isOpen: true,
          };
        });

        set({ isSyncing: true });
        try {
          const cart = await addCartItem(item.productId, quantity);
          get().applyServerCart(cart);
        } catch (error) {
          await get().refreshFromServer();
          set({
            lastError: error instanceof Error ? error.message : 'Failed to add item',
          });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));

        set({ isSyncing: true });
        try {
          const cart = await removeCartItem(productId);
          get().applyServerCart(cart);
        } catch (error) {
          await get().refreshFromServer();
          set({
            lastError: error instanceof Error ? error.message : 'Failed to remove item',
          });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        }));

        set({ isSyncing: true });
        try {
          const cart = await updateCartItemQuantity(productId, quantity);
          get().applyServerCart(cart);
        } catch (error) {
          await get().refreshFromServer();
          set({
            lastError: error instanceof Error ? error.message : 'Failed to update quantity',
          });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      setNotes: async (notes) => {
        set({ notes });
        set({ isSyncing: true });
        try {
          const cart = await updateCartNotes(notes);
          get().applyServerCart(cart);
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to update notes',
          });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
      },

      clearCart: async () => {
        set({ items: [], notes: undefined, cartId: '' });
        set({ isSyncing: true });
        try {
          const cart = await clearServerCart();
          get().applyServerCart(cart);
        } catch (error) {
          set({
            lastError: error instanceof Error ? error.message : 'Failed to clear cart',
          });
          throw error;
        } finally {
          set({ isSyncing: false });
        }
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
