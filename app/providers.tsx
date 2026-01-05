'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AnimationProvider } from '@/context/AnimationContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCustomBasketStore } from '@/store/customBasketStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { usePaymentStore } from '@/store/paymentStore';
import { authService } from '@/services/authService';
import CookieConsent from '@/components/common/CookieConsent';
import CartSync from '@/components/cart/CartSync';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside component to avoid hydration mismatches
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
          },
        },
      })
  );

  // Hydrate Zustand stores on client side only (after mount)
  useEffect(() => {
    // Manually trigger rehydration for stores with skipHydration
    // This ensures stores are hydrated only on the client, preventing SSR mismatches
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
    useCustomBasketStore.persist.rehydrate();
    useCurrencyStore.persist.rehydrate();
    usePaymentStore.persist.rehydrate();

    // Clean up any legacy auth data from local/session storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('auth-storage');
      } catch {
        // Ignore storage cleanup errors
      }
    }

    // Validate any persisted auth token and refresh if needed
    // (runs client-side only)
    authService.bootstrap();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <CartProvider>
            <AnimationProvider>
              <CartSync />
              {children}
              <CookieConsent />
            </AnimationProvider>
          </CartProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
