'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';
import { useAuthStore } from '@/store/authStore';

interface CurrencyContextType {
  currency: string;
  location: string | null;
  isLocationDetected: boolean;
  setCurrency: (currency: string) => void;
  setLocation: (country: string, countryCode: string, currency: string, adjustment: number) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { 
    currency, 
    location, 
    isLocationDetected,
    setCurrency: setStoreCurrency,
    setLocation: setStoreLocation,
    detectLocation 
  } = useCurrencyStore();
  const { user } = useAuthStore();

  // Detect location on mount if not already detected
  useEffect(() => {
    if (!isLocationDetected && typeof window !== 'undefined') {
      detectLocation();
    }
  }, [isLocationDetected, detectLocation]);

  // Fetch exchange rates on mount and when currency changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { fetchExchangeRates } = useCurrencyStore.getState();
      fetchExchangeRates();
    }
  }, [currency]);

  // Re-detect location when user logs in (in case they're in a different location)
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Optionally re-detect location when user logs in
      // This allows for location updates based on user account settings
      // For now, we'll keep the detected location unless manually changed
    }
  }, [user]);

  const setCurrency = (newCurrency: string) => {
    setStoreCurrency(newCurrency as any);
  };

  const setLocation = (country: string, countryCode: string, currencyCode: string, adjustment: number) => {
    setStoreLocation({
      country,
      countryCode,
      currency: currencyCode as any,
      adjustment,
    });
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        location: location?.country || null,
        isLocationDetected,
        setCurrency,
        setLocation,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}


