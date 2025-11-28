import { CurrencyCode } from '@/store/currencyStore';

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
 * Converts price from GBP to target currency using Stripe exchange rate
 * @param basePrice - Price in GBP
 * @param currency - Target currency code
 * @param exchangeRate - Exchange rate from Stripe FX Quote (GBP to currency)
 * @returns Converted price in target currency
 */
export function convertPrice(
  basePrice: number,
  currency: CurrencyCode = 'GBP',
  exchangeRate: number | null = null
): number {
  // If GBP or no exchange rate, return as-is
  if (currency === 'GBP' || !exchangeRate) {
    return basePrice;
  }

  // Convert: divide GBP price by exchange rate to get customer price
  // exchange_rate is the rate to convert FROM customer currency TO GBP
  // So to get customer price: GBP price / exchange_rate
  return basePrice / exchangeRate;
}

/**
 * Applies location-based price adjustment (deprecated - no longer used)
 * @param price - Price to adjust
 * @returns Price unchanged
 */
export function applyPriceAdjustment(price: number): number {
  // No longer applying adjustments - prices use Stripe FX rates
  return price;
}

/**
 * Gets the final price (converted if needed)
 * @param basePrice - Base price in GBP
 * @param currency - Target currency code
 * @param exchangeRate - Exchange rate from Stripe FX Quote
 * @returns Converted price in target currency
 */
export function getFinalPrice(
  basePrice: number,
  currency: CurrencyCode = 'GBP',
  exchangeRate: number | null = null
): number {
  return convertPrice(basePrice, currency, exchangeRate);
}

/**
 * Formats a price with currency symbol
 * @param price - Price to format
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: CurrencyCode = 'GBP'): string {
  const currencyInfo = CURRENCY_INFO[currency];
  
  const formattedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });
  
  return `${currencyInfo.symbol}${formattedPrice}`;
}

/**
 * Formats a price with currency conversion using Stripe exchange rate
 * @param basePrice - Base price in GBP
 * @param currency - Target currency code
 * @param exchangeRate - Exchange rate from Stripe FX Quote
 * @returns Formatted price string in target currency
 */
export function formatPriceWithConversion(
  basePrice: number,
  currency: CurrencyCode = 'GBP',
  exchangeRate: number | null = null
): string {
  const convertedPrice = convertPrice(basePrice, currency, exchangeRate);
  return formatPrice(convertedPrice, currency);
}

/**
 * Gets currency symbol for given currency
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode = 'GBP'): string {
  return CURRENCY_INFO[currency].symbol;
}

/**
 * Gets currency name for given currency
 * @param currency - Currency code
 * @returns Currency name
 */
export function getCurrencyName(currency: CurrencyCode = 'GBP'): string {
  return CURRENCY_INFO[currency].name;
}


