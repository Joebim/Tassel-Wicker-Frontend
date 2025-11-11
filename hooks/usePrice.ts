import { useMemo } from 'react';
import { useCurrencyStore } from '@/store/currencyStore';
import { formatPriceWithConversion, formatPrice, getFinalPrice, getCurrencySymbol } from '@/utils/priceUtils';

/**
 * Hook for price formatting and conversion
 * @param basePrice - Base price in USD
 * @returns Formatted price string and utility functions
 */
export function usePrice(basePrice: number) {
  const { currency } = useCurrencyStore();

  const formattedPrice = useMemo(() => {
    return formatPriceWithConversion(basePrice);
  }, [basePrice, currency]);

  const finalPrice = useMemo(() => {
    return getFinalPrice(basePrice);
  }, [basePrice, currency]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol();
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
    return formatPrice(price);
  }, [price, currency]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol();
  }, [currency]);

  return {
    formattedPrice,
    currencySymbol,
    currency,
  };
}


