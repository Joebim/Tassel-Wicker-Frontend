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

// Stripe FX Quote data structure
export interface StripeFXQuote {
  id: string;
  toCurrency: string;
  lockDuration: string;
  lockExpiresAt: number | null;
  lockStatus: string;
  rates: Record<
    string,
    {
      exchange_rate: number;
      rate_details?: {
        base_rate: number;
        duration_premium: number;
        fx_fee_rate: number;
        reference_rate: number;
        reference_rate_provider: string;
      };
    }
  >;
}

interface CurrencyStore {
  currency: CurrencyCode;
  location: LocationPriceAdjustment | null;
  isLocationDetected: boolean;
  fxQuote: StripeFXQuote | null;
  setCurrency: (currency: CurrencyCode) => void;
  setLocation: (location: LocationPriceAdjustment) => void;
  detectLocation: () => Promise<void>;
  getPriceAdjustment: () => number;
  setFXQuote: (quote: StripeFXQuote | null) => void;
  fetchFXQuote: (fromCurrency: CurrencyCode) => Promise<void>;
  getExchangeRate: (fromCurrency: CurrencyCode) => number | null;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      currency: "GBP",
      location: null,
      isLocationDetected: false,
      fxQuote: null,

      setCurrency: (currency: CurrencyCode) => {
        set({ currency });
      },

      setLocation: (location: LocationPriceAdjustment) => {
        set({
          location,
          currency: location.currency, // Use currency from location
          isLocationDetected: true,
        });
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
              // Auto-fetch FX quote for detected currency
              if (locationData.currency !== "GBP") {
                await get().fetchFXQuote(locationData.currency);
              }
            } else {
              // Default to GBP if country not found
              get().setLocation({
                country: data.country_name || "Unknown",
                countryCode: countryCode,
                currency: "GBP",
                adjustment: 0,
              });
            }
          }
        } catch (error) {
          console.warn("Failed to detect location, defaulting to GBP:", error);
          // Default to GBP on error
          get().setLocation({
            country: "United Kingdom",
            countryCode: "GB",
            currency: "GBP",
            adjustment: 0,
          });
        }
      },

      getPriceAdjustment: () => {
        const location = get().location;
        return location ? location.adjustment : 0;
      },

      setFXQuote: (quote: StripeFXQuote | null) => {
        set({ fxQuote: quote });
      },

      fetchFXQuote: async (fromCurrency: CurrencyCode) => {
        try {
          // Check if we have a valid quote that hasn't expired
          const currentQuote = get().fxQuote;
          if (
            currentQuote &&
            currentQuote.lockStatus === "active" &&
            currentQuote.lockExpiresAt &&
            currentQuote.lockExpiresAt * 1000 > Date.now() &&
            currentQuote.rates[fromCurrency.toLowerCase()]
          ) {
            // Quote is still valid, no need to fetch
            return;
          }

          // Determine lock duration based on currency
          // Some currencies (like NGN) only support "none"
          const currenciesOnlyNone = ["ngn", "zar"];
          const lockDuration = currenciesOnlyNone.includes(
            fromCurrency.toLowerCase()
          )
            ? "none"
            : "hour";

          // Fetch new FX quote from Stripe
          const response = await fetch("/api/fx-quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              toCurrency: "gbp", // Settlement currency
              fromCurrencies: [fromCurrency.toLowerCase()],
              lockDuration: lockDuration, // Use appropriate duration for currency
            }),
          });

          const data = await response.json();
          if (data.success && data.fxQuote) {
            set({ fxQuote: data.fxQuote });
          } else {
            console.error("Failed to fetch FX quote:", data.error);
          }
        } catch (error) {
          console.error("Error fetching FX quote:", error);
        }
      },

      getExchangeRate: (fromCurrency: CurrencyCode): number | null => {
        const fxQuote = get().fxQuote;
        // Accept both "active" (locked rates) and "none" (live rates) for price display
        // Note: "none" rates cannot be used in PaymentIntents, but are valid for display
        if (
          !fxQuote ||
          (fxQuote.lockStatus !== "active" && fxQuote.lockStatus !== "none")
        ) {
          return null;
        }

        const rate = fxQuote.rates[fromCurrency.toLowerCase()];
        if (!rate) {
          return null;
        }

        // Return exchange_rate (includes FX fee) - divide by this to get customer price
        return rate.exchange_rate;
      },
    }),
    {
      name: "currency-storage",
      skipHydration: true,
      storage: createClientStorage(),
    }
  )
);
