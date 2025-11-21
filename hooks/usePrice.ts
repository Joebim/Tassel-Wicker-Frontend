import { useMemo } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';
import { formatPriceWithConversion, formatPrice, getFinalPrice, getCurrencySymbol } from '@/utils/priceUtils';

/**
 * Hook for price formatting and conversion
 * @param basePrice - Base price in GBP
 * @returns Formatted price string and utility functions
 */
export function usePrice(basePrice: number) {
  const { currency } = useCurrencyStore();

  const formattedPrice = useMemo(() => {
    return formatPriceWithConversion(basePrice, currency);
  }, [basePrice, currency]);

  const finalPrice = useMemo(() => {
    // Currency is needed to trigger recalculation when it changes
    // The function reads from store but we need to track currency for reactivity
    return getFinalPrice(basePrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrice, currency]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  return {
    formattedPrice,
    finalPrice,
    currencySymbol,
    currency,
  };
}

/**
 * Hook for formatting a price value directly (without conversion)
 * Useful for prices that are already in the target currency
 */
export function usePriceFormat(price: number) {
  const { currency } = useCurrencyStore();

  const formattedPrice = useMemo(() => {
    return formatPrice(price, currency);
  }, [price, currency]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  return {
    formattedPrice,
    currencySymbol,
    currency,
  };
}


