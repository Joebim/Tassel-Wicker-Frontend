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
 * Converts a base price (USD) to the current currency
 * @param basePrice - Price in USD
 * @param currency - Target currency code
 * @returns Converted price
 */
export function convertPrice(basePrice: number, currency: CurrencyCode = 'USD'): number {
  const store = useCurrencyStore.getState();
  const exchangeRate = store.getExchangeRate();
  return basePrice * exchangeRate;
}

/**
 * Applies location-based price adjustment
 * @param price - Price to adjust
 * @returns Adjusted price
 */
export function applyPriceAdjustment(price: number): number {
  const store = useCurrencyStore.getState();
  const adjustment = store.getPriceAdjustment();
  
  if (adjustment === 0) return price;
  
  // Apply percentage adjustment
  return price * (1 + adjustment / 100);
}

/**
 * Gets the final price after currency conversion and location adjustment
 * @param basePrice - Base price in USD
 * @returns Final price in current currency with adjustments
 */
export function getFinalPrice(basePrice: number): number {
  const store = useCurrencyStore.getState();
  
  // First convert to target currency
  const convertedPrice = convertPrice(basePrice, store.currency);
  
  // Then apply location-based adjustment
  return applyPriceAdjustment(convertedPrice);
}

/**
 * Formats a price with currency symbol
 * @param price - Price to format
 * @param currency - Currency code (optional, uses store currency if not provided)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency?: CurrencyCode): string {
  const store = useCurrencyStore.getState();
  const targetCurrency = currency || store.currency;
  const currencyInfo = CURRENCY_INFO[targetCurrency];
  
  if (!currencyInfo) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  const formattedPrice = price.toLocaleString('en-US', {
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  });
  
  // For currencies like JPY, NGN, ZAR, place symbol before
  // For others, use standard placement
  if (targetCurrency === 'JPY' || targetCurrency === 'NGN' || targetCurrency === 'ZAR') {
    return `${currencyInfo.symbol}${formattedPrice}`;
  }
  
  return `${currencyInfo.symbol}${formattedPrice}`;
}

/**
 * Formats a price with currency symbol and applies all conversions/adjustments
 * @param basePrice - Base price in USD
 * @param currency - Currency code (optional)
 * @returns Formatted price string
 */
export function formatPriceWithConversion(basePrice: number, currency?: CurrencyCode): string {
  const finalPrice = getFinalPrice(basePrice);
  return formatPrice(finalPrice, currency);
}

/**
 * Gets currency symbol for current currency
 * @returns Currency symbol
 */
export function getCurrencySymbol(): string {
  const store = useCurrencyStore.getState();
  const currencyInfo = CURRENCY_INFO[store.currency];
  return currencyInfo?.symbol || '$';
}

/**
 * Gets currency name for current currency
 * @returns Currency name
 */
export function getCurrencyName(): string {
  const store = useCurrencyStore.getState();
  const currencyInfo = CURRENCY_INFO[store.currency];
  return currencyInfo?.name || 'US Dollar';
}


