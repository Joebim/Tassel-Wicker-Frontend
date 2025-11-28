import { CurrencyCode } from '@/store/currencyStore';
import { useCurrencyStore } from '@/store/currencyStore';

// Currency symbols and formatting
export const CURRENCY_INFO: Record<CurrencyCode, { symbol: string; name: string; decimals: number }> = {
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  NGN: { symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
  ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2 },
};

/**
 * Returns the base price in GBP (no conversion)
 * @param basePrice - Price in GBP
 * @param currency - Target currency code (deprecated, kept for compatibility)
 * @returns Base price in GBP
 */
export function convertPrice(basePrice: number, currency: CurrencyCode = 'GBP'): number {
  // Always return GBP price - Stripe handles conversion during checkout
  return basePrice;
}

/**
 * Applies location-based price adjustment (deprecated - no longer used)
 * @param price - Price to adjust
 * @returns Price unchanged
 */
export function applyPriceAdjustment(price: number): number {
  // No longer applying adjustments - prices are always in GBP
  return price;
}

/**
 * Gets the final price (always returns base price in GBP)
 * @param basePrice - Base price in GBP
 * @returns Base price in GBP (no conversion or adjustment)
 */
export function getFinalPrice(basePrice: number): number {
  // Always return GBP price - Stripe handles conversion during checkout
  return basePrice;
}

/**
 * Formats a price with GBP currency symbol
 * @param price - Price to format (in GBP)
 * @param currency - Currency code (deprecated, always uses GBP)
 * @returns Formatted price string in GBP
 */
export function formatPrice(price: number, currency?: CurrencyCode): string {
  // Always format in GBP - Stripe handles conversion during checkout
  const currencyInfo = CURRENCY_INFO['GBP'];
  
  const formattedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });
  
  return `${currencyInfo.symbol}${formattedPrice}`;
}

/**
 * Formats a price with GBP currency symbol (no conversion)
 * @param basePrice - Base price in GBP
 * @param currency - Currency code (deprecated, always uses GBP)
 * @returns Formatted price string in GBP
 */
export function formatPriceWithConversion(basePrice: number, currency?: CurrencyCode): string {
  // Always return GBP price - Stripe handles conversion during checkout
  return formatPrice(basePrice, 'GBP');
}

/**
 * Gets currency symbol (always returns GBP symbol)
 * @returns Currency symbol (£)
 */
export function getCurrencySymbol(): string {
  // Always return GBP symbol
  return CURRENCY_INFO['GBP'].symbol;
}

/**
 * Gets currency name (always returns GBP name)
 * @returns Currency name (British Pound)
 */
export function getCurrencyName(): string {
  // Always return GBP name
  return CURRENCY_INFO['GBP'].name;
}


