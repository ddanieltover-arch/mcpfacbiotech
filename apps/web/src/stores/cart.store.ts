import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Shopping cart store per Vol. 3 — Zustand for client state.
 * Handles guest + authenticated carts with persistence.
 */

interface CartStoreItem {
  productId: string;
  productName: string;
  productSku: string;
  productImage?: string;
  unitPrice: number;
  quantity: number;
}

interface CartStore {
  items: CartStoreItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: Omit<CartStoreItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;

  // Computed
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.productId === item.productId);
          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex]!,
              quantity: updated[existingIndex]!.quantity + quantity,
            };
            return { items: updated };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (isOpen) => set({ isOpen }),

      itemCount: () => get().items.reduce((total, item) => total + item.quantity, 0),
      subtotal: () =>
        get().items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    }),
    {
      name: 'mcpfac-cart',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
