import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCurrencyStore } from "@/store/currencyStore";
import {
  formatPriceWithConversion,
  formatPrice,
  getFinalPrice,
  getCurrencySymbol,
} from "@/utils/priceUtils";

/**
 * Hook for price formatting and conversion using Stripe FX rates
 * Only converts prices on the checkout page, otherwise displays in GBP
 * @param basePrice - Base price in GBP
 * @returns Formatted price string and utility functions
 */
export function usePrice(basePrice: number) {
  const pathname = usePathname();
  const { currency, getExchangeRate } = useCurrencyStore();
  const exchangeRate = getExchangeRate(currency);
  
  // Only convert prices on checkout page
  const shouldConvert = pathname === "/checkout";
  
  // Use GBP and no conversion if not on checkout page
  const effectiveCurrency = shouldConvert ? currency : "GBP";
  const effectiveExchangeRate = shouldConvert ? exchangeRate : null;

  const formattedPrice = useMemo(() => {
    if (shouldConvert) {
    return formatPriceWithConversion(basePrice, currency, exchangeRate);
    }
    // Always show GBP on non-checkout pages
    return formatPrice(basePrice, "GBP");
  }, [basePrice, currency, exchangeRate, shouldConvert]);

  const finalPrice = useMemo(() => {
    if (shouldConvert) {
    return getFinalPrice(basePrice, currency, exchangeRate);
    }
    // Return base price in GBP if not on checkout
    return basePrice;
  }, [basePrice, currency, exchangeRate, shouldConvert]);

  const currencySymbol = useMemo(() => {
    return getCurrencySymbol(effectiveCurrency);
  }, [effectiveCurrency]);

  return {
    formattedPrice,
    finalPrice,
    currencySymbol,
    currency: effectiveCurrency,
    exchangeRate: effectiveExchangeRate,
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
