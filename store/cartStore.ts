import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useToastStore } from "./toastStore";
import { createClientStorage } from "@/utils/storage";
import { useAuthStore } from "./authStore";

export interface CartItem {
  id: string;
  productId?: string; // Product ID for backend sync
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
  lastSyncedAt?: string; // Last sync timestamp
  addItem: (item: Omit<CartItem, "quantity">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
  syncWithServer: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      lastSyncedAt: undefined,

      addItem: async (item: Omit<CartItem, "quantity">) => {
        const { user, token } = useAuthStore.getState();
        const isAuthenticated = !!user && !!token;
        const items = get().items;
        const existingItem = items.find((i: CartItem) => i.id === item.id);

        // Optimistically update local state
        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map((i: CartItem) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...items, { ...item, quantity: 1 }];
        }
        set({ items: newItems });

        // If authenticated, sync with backend
        if (isAuthenticated) {
          try {
            const { addCartItem } = await import("@/services/cartService");
            // Extract productId from id if it's in format "productId-variantSlug", otherwise use id
            const productId =
              item.productId ||
              (item.id.includes("-") ? item.id.split("-")[0] : item.id);
            const cartItem: any = {
              id: item.id,
              productId: productId,
              name: item.name,
              price: item.price,
              image: item.image,
              category: item.category,
              description: item.description,
              variantName: item.variantName,
              customItems: item.customItems,
              basketItems: item.basketItems,
            };
            // Pass quantity: 1 for new items, or existing quantity + 1 if item already exists
            const quantityToAdd = existingItem ? existingItem.quantity + 1 : 1;
            const response = await addCartItem(cartItem, quantityToAdd);
            // Update with server response to ensure consistency
            set({ items: response.cart.items });
          } catch (error) {
            // Revert on error
            set({ items });
            useToastStore.getState().addToast({
              type: "error",
              title: "Failed to Add Item",
              message:
                error instanceof Error
                  ? error.message
                  : "Could not add item to cart",
            });
            return;
          }
        }

        useToastStore.getState().addToast({
          type: "success",
          title: existingItem ? "Item Updated" : "Added to Cart",
          message: existingItem
            ? `${item.name} quantity increased`
            : `${item.name} has been added to your cart`,
        });
      },

      removeItem: async (id: string) => {
        const { user, token } = useAuthStore.getState();
        const isAuthenticated = !!user && !!token;
        const items = get().items;
        const itemToRemove = items.find((item: CartItem) => item.id === id);

        // Optimistically update local state
        const newItems = items.filter((item: CartItem) => item.id !== id);
        set({ items: newItems });

        // If authenticated, sync with backend
        if (isAuthenticated) {
          try {
            const { removeCartItem } = await import("@/services/cartService");
            const response = await removeCartItem(id);
            // Update with server response to ensure consistency
            set({ items: response.cart.items });
          } catch (error) {
            // Revert on error
            set({ items });
            useToastStore.getState().addToast({
              type: "error",
              title: "Failed to Remove Item",
              message:
                error instanceof Error
                  ? error.message
                  : "Could not remove item from cart",
            });
            return;
          }
        }

        if (itemToRemove) {
          useToastStore.getState().addToast({
            type: "info",
            title: "Item Removed",
            message: `${itemToRemove.name} has been removed from your cart`,
          });
        }
      },

      updateQuantity: async (id: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        const { user, token } = useAuthStore.getState();
        const isAuthenticated = !!user && !!token;
        const items = get().items;

        // Optimistically update local state
        const newItems = items.map((item: CartItem) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: newItems });

        // If authenticated, sync with backend
        if (isAuthenticated) {
          try {
            const { updateCartItemQuantity } = await import(
              "@/services/cartService"
            );
            const response = await updateCartItemQuantity(id, quantity);
            // Update with server response to ensure consistency
            set({ items: response.cart.items });
          } catch (error) {
            // Revert on error
            set({ items });
            useToastStore.getState().addToast({
              type: "error",
              title: "Failed to Update Quantity",
              message:
                error instanceof Error
                  ? error.message
                  : "Could not update item quantity",
            });
            return;
          }
        }
      },

      clearCart: async () => {
        const { user, token } = useAuthStore.getState();
        const isAuthenticated = !!user && !!token;

        // Optimistically update local state
        set({ items: [] });

        // If authenticated, sync with backend
        if (isAuthenticated) {
          try {
            const { clearCart } = await import("@/services/cartService");
            const response = await clearCart();
            // Update with server response to ensure consistency
            set({ items: response.cart.items });
          } catch (error) {
            useToastStore.getState().addToast({
              type: "error",
              title: "Failed to Clear Cart",
              message:
                error instanceof Error ? error.message : "Could not clear cart",
            });
            return;
          }
        }

        useToastStore.getState().addToast({
          type: "info",
          title: "Cart Cleared",
          message: "All items have been removed from your cart",
        });
      },

      setItems: (items: CartItem[]) => {
        set({ items });
      },

      syncWithServer: async () => {
        const { user, token } = useAuthStore.getState();
        if (!user || !token) return;

        try {
          const { syncCart } = await import("@/services/cartService");
          const localItems = get().items;
          const lastSyncedAt = get().lastSyncedAt;

          // Map local items to ensure productId is always present
          const mappedItems = localItems.map((item) => ({
            ...item,
            productId:
              item.productId ||
              (item.id.includes("-") ? item.id.split("-")[0] : item.id),
          })) as Array<{
            id: string;
            productId: string;
            name: string;
            price: number;
            image: string;
            category: string;
            description: string;
            quantity: number;
            variantName?: string;
            customItems?: Array<{
              id: string;
              name: string;
              image: string;
              price: number;
            }>;
            basketItems?: Array<{
              name: string;
              image: string;
              category: string;
            }>;
          }>;

          const response = await syncCart({
            localCart: mappedItems,
            lastSyncedAt,
            mergeStrategy: "merge",
          });

          set({
            items: response.cart.items,
            lastSyncedAt: response.syncedAt,
          });
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      },

      mergeGuestCart: async () => {
        const { user, token } = useAuthStore.getState();
        if (!user || !token) return;

        try {
          const { mergeGuestCart } = await import("@/services/cartService");
          const localItems = get().items;

          if (localItems.length === 0) {
            // No local items, just fetch server cart
            const { getCart } = await import("@/services/cartService");
            const response = await getCart();
            set({
              items: response.cart.items,
              lastSyncedAt: new Date().toISOString(),
            });
            return;
          }

          // Map local items to ensure productId is always present
          const mappedItems = localItems.map((item) => ({
            ...item,
            productId:
              item.productId ||
              (item.id.includes("-") ? item.id.split("-")[0] : item.id),
          })) as Array<{
            id: string;
            productId: string;
            name: string;
            price: number;
            image: string;
            category: string;
            description: string;
            quantity: number;
            variantName?: string;
            customItems?: Array<{
              id: string;
              name: string;
              image: string;
              price: number;
            }>;
            basketItems?: Array<{
              name: string;
              image: string;
              category: string;
            }>;
          }>;

          // Merge guest cart with server cart
          const response = await mergeGuestCart(mappedItems);
          set({
            items: response.cart.items,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Failed to merge guest cart:", error);
          // If merge fails, try to just fetch server cart
          try {
            const { getCart } = await import("@/services/cartService");
            const response = await getCart();
            set({
              items: response.cart.items,
              lastSyncedAt: new Date().toISOString(),
            });
          } catch (fetchError) {
            console.error("Failed to fetch server cart:", fetchError);
          }
        }
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
