'use client';

import { useEffect, useState } from 'react';
import { CurrencyCode } from '@/store/currencyStore';

interface CurrencyInfo {
  [key: string]: number; // currency code -> exchange rate
}

/**
 * Hook to fetch real-time currency exchange rates
 * Uses server-side API route to keep API key secure
 * @param baseCurrency - Base currency code (default: USD)
 * @returns Object with conversion rates and loading/error states
 */
function useCurrencyInfo(baseCurrency: CurrencyCode = 'USD') {
  const [data, setData] = useState<CurrencyInfo>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCurrencyData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Call server-side API route to fetch exchange rates
        // This keeps the API key secure on the server
        const response = await fetch(`/api/currency/rates?base=${baseCurrency}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.rates) {
          setData(result.rates || {});
        } else {
          throw new Error(result.error || 'Failed to fetch currency data');
        }
      } catch (error) {
        console.error('Error fetching currency data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        // Don't clear data on error, keep previous rates if available
      } finally {
        setIsLoading(false);
      }
    };

    if (baseCurrency) {
      fetchCurrencyData();
    }
  }, [baseCurrency]);

  return { data, error, isLoading };
}

export default useCurrencyInfo;

