import { useMemo } from "react";
import { useCurrencyStore } from "@/store/currencyStore";
import {
  formatPriceWithConversion,
  formatPrice,
  getFinalPrice,
  getCurrencySymbol,
} from "@/utils/priceUtils";

/**
 * Hook for price formatting and conversion using Stripe FX rates
 * @param basePrice - Base price in GBP
 * @returns Formatted price string and utility functions
 */
export function usePrice(basePrice: number) {
  const { currency, getExchangeRate } = useCurrencyStore();
  const exchangeRate = getExchangeRate(currency);

  const formattedPrice = useMemo(() => {
    return formatPriceWithConversion(basePrice, currency, exchangeRate);
  }, [basePrice, currency, exchangeRate]);

  const finalPrice = useMemo(() => {
    return getFinalPrice(basePrice, currency, exchangeRate);
  }, [basePrice, currency, exchangeRate]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(currency);
  }, [currency]);

  return {
    formattedPrice,
    finalPrice,
    currencySymbol,
    currency,
    exchangeRate,
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
    return getCurrencySymbol(currency);
  }, [currency]);

  return {
    formattedPrice,
    currencySymbol,
    currency,
  };
}
