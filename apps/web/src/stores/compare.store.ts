import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Compare store — client-side state, max 4 products.
 */

const MAX_COMPARE_ITEMS = 4;

interface CompareStore {
  productIds: string[];
  addItem: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => boolean;
  hasItem: (productId: string) => boolean;
  clearAll: () => void;
  count: () => number;
  isFull: () => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addItem: (productId) => {
        const { productIds } = get();
        if (productIds.length >= MAX_COMPARE_ITEMS) return false;
        if (productIds.includes(productId)) return true;
        set({ productIds: [...productIds, productId] });
        return true;
      },

      removeItem: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        }));
      },

      toggleItem: (productId) => {
        const { productIds } = get();
        if (productIds.includes(productId)) {
          get().removeItem(productId);
          return true;
        }
        return get().addItem(productId);
      },

      hasItem: (productId) => get().productIds.includes(productId),
      clearAll: () => set({ productIds: [] }),
      count: () => get().productIds.length,
      isFull: () => get().productIds.length >= MAX_COMPARE_ITEMS,
    }),
    {
      name: 'mcpfac-compare',
    },
  ),
);
