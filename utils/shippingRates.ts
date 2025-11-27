/**
 * Shipping rates configuration
 * Based on country and shipping method
 */

export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: number; // Price in GBP
  estimatedDays: string;
}

export interface ShippingRatesByCountry {
  [countryCode: string]: ShippingRate[];
}

// Base shipping rates in GBP
const SHIPPING_RATES: ShippingRatesByCountry = {
  // United Kingdom
  GB: [
    {
      id: "standard-uk",
      name: "Standard Shipping",
      description: "2-3 business days",
      price: 5.0,
      estimatedDays: "2-3 business days",
    },
    {
      id: "express-uk",
      name: "Express Shipping",
      description: "Next business day",
      price: 10.0,
      estimatedDays: "1 business day",
    },
  ],
  // European Union countries
  EU: [
    {
      id: "standard-eu",
      name: "Standard International",
      description: "5-7 business days",
      price: 15.0,
      estimatedDays: "5-7 business days",
    },
    {
      id: "express-eu",
      name: "Express International",
      description: "3-5 business days",
      price: 25.0,
      estimatedDays: "3-5 business days",
    },
  ],
  // Rest of the world
  DEFAULT: [
    {
      id: "standard-international",
      name: "Standard International",
      description: "7-14 business days",
      price: 20.0,
      estimatedDays: "7-14 business days",
    },
    {
      id: "express-international",
      name: "Express International",
      description: "5-10 business days",
      price: 35.0,
      estimatedDays: "5-10 business days",
    },
  ],
};

// EU country codes
const EU_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

/**
 * Get shipping rates for a country
 */
export function getShippingRates(countryCode: string): ShippingRate[] {
  const upperCode = countryCode.toUpperCase();

  // Check if UK
  if (upperCode === "GB" || upperCode === "UK") {
    return SHIPPING_RATES.GB;
  }

  // Check if EU country
  if (EU_COUNTRIES.includes(upperCode)) {
    return SHIPPING_RATES.EU;
  }

  // Default international rates
  return SHIPPING_RATES.DEFAULT;
}

/**
 * Get a specific shipping rate by ID and country
 */
export function getShippingRateById(
  rateId: string,
  countryCode: string
): ShippingRate | null {
  const rates = getShippingRates(countryCode);
  return rates.find((rate) => rate.id === rateId) || null;
}


