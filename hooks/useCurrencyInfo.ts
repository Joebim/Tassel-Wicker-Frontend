'use client';

import { useEffect, useState } from 'react';
import { CurrencyCode } from '@/store/currencyStore';

interface CurrencyInfo {
  [key: string]: number; // currency code -> exchange rate
}

/**
 * Hook to fetch real-time currency exchange rates
 * @param baseCurrency - Base currency code (default: USD)
 * @returns Object with conversion rates and loading/error states
 */
function useCurrencyInfo(baseCurrency: CurrencyCode = 'USD') {
  const [data, setData] = useState<CurrencyInfo>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const apiKey = process.env.NEXT_PUBLIC_CURRENCY_API_KEY;

  useEffect(() => {
    const fetchCurrencyData = async () => {
      // Skip if no API key is provided
      if (!apiKey) {
        console.warn('NEXT_PUBLIC_CURRENCY_API_KEY not found, using fallback rates');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.result === 'success' && result.conversion_rates) {
          setData(result.conversion_rates || {});
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
  }, [baseCurrency, apiKey]);

  return { data, error, isLoading };
}

export default useCurrencyInfo;

