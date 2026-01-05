import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCart } from './useCart';

/**
 * Hook to load cart from server when user is authenticated
 * Does NOT automatically sync - sync only happens on login/signup
 */
export function useCartSync() {
  const { user, token, hasHydrated } = useAuthStore();
  const { setItems } = useCartStore();
  const isAuthenticated = !!user && !!token;
  
  // Fetch cart from server when authenticated
  const { data: cartData } = useCart({
    enabled: isAuthenticated && hasHydrated,
  });

  // Load server cart into store when fetched
  // Only load if we don't have local items (to avoid overwriting during sync)
  useEffect(() => {
    if (cartData?.cart && isAuthenticated) {
      const { items } = useCartStore.getState();
      // Only load server cart if we have no local items
      // This prevents overwriting during the merge/sync process
      if (items.length === 0) {
        setItems(cartData.cart.items);
      }
    }
  }, [cartData, isAuthenticated, setItems]);
}

