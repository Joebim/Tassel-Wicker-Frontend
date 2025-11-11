import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useToastStore } from "./toastStore";
import { createClientStorage } from "@/utils/storage";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  quantity: number;
  variantName?: string; // For product variants
  customItems?: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
  }>; // For custom baskets
  basketItems?: Array<{
    name: string;
    image: string;
    category: string;
  }>; // For normal baskets (The Dee Basket, The Duro Basket)
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: Omit<CartItem, "quantity">) => {
        const items = get().items;
        const existingItem = items.find((i: CartItem) => i.id === item.id);

        if (existingItem) {
          set({
            items: items.map((i: CartItem) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
          useToastStore.getState().addToast({
            type: "success",
            title: "Item Updated",
            message: `${item.name} quantity increased`,
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
          useToastStore.getState().addToast({
            type: "success",
            title: "Added to Cart",
            message: `${item.name} has been added to your cart`,
          });
        }
      },

      removeItem: (id: string) => {
        const items = get().items;
        const itemToRemove = items.find((item: CartItem) => item.id === id);

        set({
          items: items.filter((item: CartItem) => item.id !== id),
        });

        if (itemToRemove) {
          useToastStore.getState().addToast({
            type: "info",
            title: "Item Removed",
            message: `${itemToRemove.name} has been removed from your cart`,
          });
        }
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item: CartItem) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
        useToastStore.getState().addToast({
          type: "info",
          title: "Cart Cleared",
          message: "All items have been removed from your cart",
        });
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total: number, item: CartItem) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total: number, item: CartItem) => total + item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
      skipHydration: true, // Skip hydration to prevent SSR mismatches
      storage: createClientStorage(),
    }
  )
);
