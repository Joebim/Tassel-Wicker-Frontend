import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientSessionStorage } from "@/utils/storage";

export interface CustomBasketItem {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  variantName?: string; // For product variants
  details?: Record<string, unknown>;
}

export interface CustomBasket {
  id: string;
  basketType: "natural" | "black";
  selectedItems: CustomBasketItem[];
  totalPrice: number;
  createdAt: Date;
}

interface CustomBasketStore {
  currentBasket: CustomBasket | null;
  pendingItems: CustomBasketItem[];
  setBasketType: (type: "natural" | "black") => void;
  addItem: (item: CustomBasketItem) => void;
  removeItem: (itemId: string) => void;
  clearBasket: () => void;
  updateTotalPrice: () => void;
  queueItem: (item: CustomBasketItem) => void;
}

export const useCustomBasketStore = create<CustomBasketStore>()(
  persist(
    (set, get) => ({
      currentBasket: null,
      pendingItems: [],

      setBasketType: (type: "natural" | "black") => {
        // Generate ID only on client side to avoid hydration mismatches
        // This function should only be called on the client after mount
        let basketId: string;
        if (typeof window !== "undefined" && crypto?.randomUUID) {
          basketId = `custom-basket-${crypto.randomUUID()}`;
        } else {
          // Fallback: use a simple counter-based ID (only used if crypto.randomUUID is unavailable)
          // This should never happen in modern browsers, but provides a fallback
          const currentCounter =
            (globalThis as unknown as { __basketCounter?: number })
              .__basketCounter || 0;
          const counter = currentCounter + 1;
          (
            globalThis as unknown as { __basketCounter: number }
          ).__basketCounter = counter;
          basketId = `custom-basket-${counter}`;
        }
        set({
          currentBasket: {
            id: basketId,
            basketType: type,
            selectedItems: [],
            totalPrice: 0,
            createdAt: typeof window !== "undefined" ? new Date() : new Date(0), // Use epoch date during SSR
          },
        });

        const { pendingItems } = get();
        if (pendingItems.length > 0) {
          pendingItems.forEach((item) => {
            const current = get().currentBasket;
            if (!current) return;
            if (current.selectedItems.length >= 5) return;
            const exists = current.selectedItems.some(
              (selected) => selected.id === item.id
            );
            if (exists) return;
            get().addItem(item);
          });
          set({ pendingItems: [] });
        }
      },

      addItem: (item: CustomBasketItem) => {
        const { currentBasket } = get();
        if (!currentBasket) return;

        // Check if item already exists
        const existingItem = currentBasket.selectedItems.find(
          (i) => i.id === item.id
        );
        if (existingItem) return; // Don't add duplicates

        // Check if we've reached the max limit (5 items)
        if (currentBasket.selectedItems.length >= 5) return;

        const updatedItems = [...currentBasket.selectedItems, item];
        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.price,
          0
        );

        set({
          currentBasket: {
            ...currentBasket,
            selectedItems: updatedItems,
            totalPrice,
          },
        });
      },

      removeItem: (itemId: string) => {
        const { currentBasket } = get();
        if (!currentBasket) return;

        const updatedItems = currentBasket.selectedItems.filter(
          (item) => item.id !== itemId
        );
        const totalPrice = updatedItems.reduce(
          (sum, item) => sum + item.price,
          0
        );

        set({
          currentBasket: {
            ...currentBasket,
            selectedItems: updatedItems,
            totalPrice,
          },
        });
      },

      clearBasket: () => {
        set({ currentBasket: null, pendingItems: [] });
      },

      updateTotalPrice: () => {
        const { currentBasket } = get();
        if (!currentBasket) return;

        const totalPrice = currentBasket.selectedItems.reduce(
          (sum, item) => sum + item.price,
          0
        );
        set({
          currentBasket: {
            ...currentBasket,
            totalPrice,
          },
        });
      },

      queueItem: (item: CustomBasketItem) => {
        const { pendingItems } = get();
        if (pendingItems.some((pending) => pending.id === item.id)) {
          return;
        }
        set({ pendingItems: [...pendingItems, item] });
      },
    }),
    {
      name: "custom-basket-storage",
      skipHydration: true, // Skip hydration to prevent SSR mismatches
      storage: {
        getItem: (name: string) => {
          const str = createClientSessionStorage().getItem(name);
          if (!str) return null;
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name: string, value: unknown) => {
          createClientSessionStorage().setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
          createClientSessionStorage().removeItem(name);
        },
      },
    }
  )
);
