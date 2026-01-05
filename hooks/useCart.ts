import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCart, 
  addCartItem, 
  updateCartItemQuantity, 
  removeCartItem, 
  clearCart,
  syncCart,
  mergeGuestCart,
  type CartItem,
  type SyncCartRequest,
} from '@/services/cartService';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';

/**
 * Query key factory for cart queries
 */
export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
};

/**
 * Hook to fetch user's cart
 */
export function useCart(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  const { user, token } = useAuthStore();
  const isAuthenticated = !!user && !!token;

  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: () => getCart(),
    enabled: (options?.enabled ?? true) && isAuthenticated,
    staleTime: options?.staleTime ?? 30 * 1000, // 30 seconds default
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to add item to cart
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();
  const { user, token } = useAuthStore();
  const isAuthenticated = !!user && !!token;

  return useMutation({
    mutationFn: (item: Omit<CartItem, "quantity" | "createdAt" | "updatedAt">) => addCartItem(item),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.setQueryData(cartKeys.detail(), { cart: data.cart });
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Added to Cart',
        message: 'Item has been added to your cart',
      });
    },
    onError: (error: Error) => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Add Item',
        message: error.message || 'Could not add item to cart',
      });
    },
  });
}

/**
 * Hook to update item quantity
 */
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => 
      updateCartItemQuantity(itemId, quantity),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.setQueryData(cartKeys.detail(), { cart: data.cart });
    },
    onError: (error: Error) => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Update Quantity',
        message: error.message || 'Could not update item quantity',
      });
    },
  });
}

/**
 * Hook to remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.setQueryData(cartKeys.detail(), { cart: data.cart });
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Item Removed',
        message: 'Item has been removed from your cart',
      });
    },
    onError: (error: Error) => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Remove Item',
        message: error.message || 'Could not remove item from cart',
      });
    },
  });
}

/**
 * Hook to clear cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.setQueryData(cartKeys.detail(), { cart: data.cart });
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Cart Cleared',
        message: 'All items have been removed from your cart',
      });
    },
    onError: (error: Error) => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Clear Cart',
        message: error.message || 'Could not clear cart',
      });
    },
  });
}

/**
 * Hook to sync cart
 */
export function useSyncCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SyncCartRequest) => syncCart(request),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.setQueryData(cartKeys.detail(), { cart: data.cart });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
    },
    onError: (error: Error) => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Sync Cart',
        message: error.message || 'Could not sync cart',
      });
    },
  });
}

/**
 * Hook to merge guest cart on login
 */
export function useMergeGuestCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (guestCart: CartItem[]) => mergeGuestCart(guestCart),
    onSuccess: (data) => {
      // Update cart cache
      queryClient.setQueryData(cartKeys.detail(), { cart: data.cart });
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
      if (data.mergedItems.length > 0) {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Cart Merged',
          message: `${data.mergedItems.length} item(s) from your guest cart have been added`,
        });
      }
    },
    onError: (error: Error) => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to Merge Cart',
        message: error.message || 'Could not merge guest cart',
      });
    },
  });
}

