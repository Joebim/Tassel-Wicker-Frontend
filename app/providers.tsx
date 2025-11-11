'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AnimationProvider } from '@/context/AnimationContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useCustomBasketStore } from '@/store/customBasketStore';
import { useCurrencyStore } from '@/store/currencyStore';

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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <AnimationProvider>
                {children}
              </AnimationProvider>
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
