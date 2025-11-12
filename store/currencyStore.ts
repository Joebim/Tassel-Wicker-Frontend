import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientStorage } from "@/utils/storage";

// Supported currencies
export type CurrencyCode =
  | "USD"
  | "GBP"
  | "EUR"
  | "CAD"
  | "AUD"
  | "JPY"
  | "NGN"
  | "ZAR";

// Location-based price adjustments (percentage)
// Positive = inflation, negative = reduction
export interface LocationPriceAdjustment {
  country: string;
  countryCode: string;
  currency: CurrencyCode;
  adjustment: number; // Percentage adjustment (e.g., 10 = 10% increase, -5 = 5% decrease)
}

// Default price adjustments by country
const DEFAULT_LOCATION_ADJUSTMENTS: Record<string, LocationPriceAdjustment> = {
  US: {
    country: "United States",
    countryCode: "US",
    currency: "USD",
    adjustment: 0,
  },
  GB: {
    country: "United Kingdom",
    countryCode: "GB",
    currency: "GBP",
    adjustment: 5,
  },
  CA: { country: "Canada", countryCode: "CA", currency: "CAD", adjustment: 8 },
  AU: {
    country: "Australia",
    countryCode: "AU",
    currency: "AUD",
    adjustment: 12,
  },
  JP: { country: "Japan", countryCode: "JP", currency: "JPY", adjustment: 15 },
  NG: {
    country: "Nigeria",
    countryCode: "NG",
    currency: "NGN",
    adjustment: -10,
  },
  ZA: {
    country: "South Africa",
    countryCode: "ZA",
    currency: "ZAR",
    adjustment: -5,
  },
  DE: { country: "Germany", countryCode: "DE", currency: "EUR", adjustment: 3 },
  FR: { country: "France", countryCode: "FR", currency: "EUR", adjustment: 3 },
  IT: { country: "Italy", countryCode: "IT", currency: "EUR", adjustment: 3 },
  ES: { country: "Spain", countryCode: "ES", currency: "EUR", adjustment: 3 },
  NL: {
    country: "Netherlands",
    countryCode: "NL",
    currency: "EUR",
    adjustment: 3,
  },
  BE: { country: "Belgium", countryCode: "BE", currency: "EUR", adjustment: 3 },
  AT: { country: "Austria", countryCode: "AT", currency: "EUR", adjustment: 3 },
  CH: {
    country: "Switzerland",
    countryCode: "CH",
    currency: "EUR",
    adjustment: 5,
  },
  IE: { country: "Ireland", countryCode: "IE", currency: "EUR", adjustment: 3 },
  PT: {
    country: "Portugal",
    countryCode: "PT",
    currency: "EUR",
    adjustment: 3,
  },
  GR: { country: "Greece", countryCode: "GR", currency: "EUR", adjustment: 3 },
  FI: { country: "Finland", countryCode: "FI", currency: "EUR", adjustment: 3 },
  SE: { country: "Sweden", countryCode: "SE", currency: "EUR", adjustment: 3 },
  DK: { country: "Denmark", countryCode: "DK", currency: "EUR", adjustment: 3 },
  NO: { country: "Norway", countryCode: "NO", currency: "EUR", adjustment: 5 },
  PL: { country: "Poland", countryCode: "PL", currency: "EUR", adjustment: 2 },
  CZ: {
    country: "Czech Republic",
    countryCode: "CZ",
    currency: "EUR",
    adjustment: 2,
  },
  HU: { country: "Hungary", countryCode: "HU", currency: "EUR", adjustment: 2 },
  RO: { country: "Romania", countryCode: "RO", currency: "EUR", adjustment: 1 },
  BG: {
    country: "Bulgaria",
    countryCode: "BG",
    currency: "EUR",
    adjustment: 1,
  },
  HR: { country: "Croatia", countryCode: "HR", currency: "EUR", adjustment: 2 },
  SK: {
    country: "Slovakia",
    countryCode: "SK",
    currency: "EUR",
    adjustment: 2,
  },
  SI: {
    country: "Slovenia",
    countryCode: "SI",
    currency: "EUR",
    adjustment: 2,
  },
  LT: {
    country: "Lithuania",
    countryCode: "LT",
    currency: "EUR",
    adjustment: 2,
  },
  LV: { country: "Latvia", countryCode: "LV", currency: "EUR", adjustment: 2 },
  EE: { country: "Estonia", countryCode: "EE", currency: "EUR", adjustment: 2 },
  LU: {
    country: "Luxembourg",
    countryCode: "LU",
    currency: "EUR",
    adjustment: 3,
  },
  MT: { country: "Malta", countryCode: "MT", currency: "EUR", adjustment: 2 },
  CY: { country: "Cyprus", countryCode: "CY", currency: "EUR", adjustment: 2 },
};

// Fallback exchange rates (base: USD = 1.0)
// Used when API is unavailable or during initial load
const FALLBACK_EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 149.5,
  NGN: 1500.0,
  ZAR: 18.75,
};

interface CurrencyStore {
  currency: CurrencyCode;
  location: LocationPriceAdjustment | null;
  isLocationDetected: boolean;
  exchangeRates: Record<string, number>; // Real-time exchange rates from API
  lastUpdated: number | null; // Timestamp of last rate update
  setCurrency: (currency: CurrencyCode) => void;
  setLocation: (location: LocationPriceAdjustment) => void;
  setExchangeRates: (rates: Record<string, number>) => void;
  detectLocation: () => Promise<void>;
  fetchExchangeRates: () => Promise<void>;
  getPriceAdjustment: () => number;
  getExchangeRate: (targetCurrency?: CurrencyCode) => number;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "USD",
      location: null,
      isLocationDetected: false,
      exchangeRates: {},
      lastUpdated: null,

      setCurrency: (currency: CurrencyCode) => {
        set({ currency });
        // Fetch new rates when currency changes
        get().fetchExchangeRates();
      },

      setLocation: (location: LocationPriceAdjustment) => {
        set({
          location,
          currency: location.currency,
          isLocationDetected: true,
        });
        // Fetch rates for the new currency
        get().fetchExchangeRates();
      },

      setExchangeRates: (rates: Record<string, number>) => {
        set({
          exchangeRates: rates,
          lastUpdated: Date.now(),
        });
      },

      fetchExchangeRates: async () => {
        // Don't fetch if rates were updated recently (within last 5 minutes)
        const lastUpdated = get().lastUpdated;
        if (lastUpdated && Date.now() - lastUpdated < 5 * 60 * 1000) {
          return;
        }

        try {
          // Call server-side API route to fetch exchange rates
          // This keeps the API key secure on the server
          const response = await fetch("/api/currency/rates?base=USD");

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.success && result.rates) {
            get().setExchangeRates(result.rates);
          } else {
            throw new Error(result.error || "Failed to fetch currency data");
          }
        } catch (error) {
          console.error("Error fetching exchange rates:", error);
          // Keep existing rates or use fallback
        }
      },

      detectLocation: async () => {
        // Skip if already detected
        if (get().isLocationDetected) return;

        try {
          // Try to detect location from IP
          const response = await fetch("https://ipapi.co/json/");
          const data = await response.json();

          if (data.country_code) {
            const countryCode = data.country_code.toUpperCase();
            const locationData = DEFAULT_LOCATION_ADJUSTMENTS[countryCode];

            if (locationData) {
              get().setLocation(locationData);
              // Fetch exchange rates for detected currency
              get().fetchExchangeRates();
            } else {
              // Default to USD if country not found
              get().setLocation({
                country: data.country_name || "Unknown",
                countryCode: countryCode,
                currency: "USD",
                adjustment: 0,
              });
              get().fetchExchangeRates();
            }
          }
        } catch (error) {
          console.warn("Failed to detect location, defaulting to USD:", error);
          // Default to USD on error
          get().setLocation({
            country: "United States",
            countryCode: "US",
            currency: "USD",
            adjustment: 0,
          });
          get().fetchExchangeRates();
        }
      },

      getPriceAdjustment: () => {
        const location = get().location;
        return location ? location.adjustment : 0;
      },

      getExchangeRate: (targetCurrency?: CurrencyCode) => {
        const currency = targetCurrency || get().currency;
        const exchangeRates = get().exchangeRates;

        // Use real-time rates if available
        // API returns rates relative to USD (base currency)
        if (exchangeRates && Object.keys(exchangeRates).length > 0) {
          // Rates are in format: { USD: 1, EUR: 0.92, GBP: 0.79, ... }
          // So EUR rate of 0.92 means 1 USD = 0.92 EUR
          // For conversion: price in USD * rate = price in target currency
          return (
            exchangeRates[currency] || FALLBACK_EXCHANGE_RATES[currency] || 1.0
          );
        }

        // Fallback to static rates
        return FALLBACK_EXCHANGE_RATES[currency] || 1.0;
      },
    }),
    {
      name: "currency-storage",
      skipHydration: true,
      storage: createClientStorage(),
    }
  )
);
