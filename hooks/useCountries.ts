"use client";

import { useEffect, useState } from "react";

export interface Country {
  id: number;
  name: string;
  iso3: string;
  numeric_code: string;
  iso2: string;
  phonecode: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string;
  region: string;
  region_id: number;
  subregion: string;
  subregion_id: number;
  nationality: string;
  timezones: string;
  translations: string;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
  created_at: string;
  updated_at: string;
  flag: number;
  wikiDataId: string;
}

/**
 * Hook to fetch countries from the API
 * @returns Object with countries array and loading/error states
 */
function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://csc.sidsworld.co.in/api/countries"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Handle different possible response formats
        let countriesData: Country[] = [];
        if (Array.isArray(result)) {
          countriesData = result;
        } else if (result.data && Array.isArray(result.data)) {
          countriesData = result.data;
        } else if (result.countries && Array.isArray(result.countries)) {
          countriesData = result.countries;
        } else {
          throw new Error("Unexpected response format");
        }
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        // Set fallback countries on error
        setCountries([
          {
            id: 1,
            name: "United States",
            iso2: "US",
            iso3: "USA",
            numeric_code: "840",
            phonecode: "1",
            capital: "Washington",
            currency: "USD",
            currency_name: "United States dollar",
            currency_symbol: "$",
            tld: ".us",
            native: "United States",
            region: "Americas",
            region_id: 2,
            subregion: "Northern America",
            subregion_id: 6,
            nationality: "American",
            timezones: "[]",
            translations: "{}",
            latitude: "38.00000000",
            longitude: "-97.00000000",
            emoji: "🇺🇸",
            emojiU: "U+1F1FA U+1F1F8",
            created_at: "",
            updated_at: "",
            flag: 1,
            wikiDataId: "",
          },
          {
            id: 2,
            name: "Canada",
            iso2: "CA",
            iso3: "CAN",
            numeric_code: "124",
            phonecode: "1",
            capital: "Ottawa",
            currency: "CAD",
            currency_name: "Canadian dollar",
            currency_symbol: "$",
            tld: ".ca",
            native: "Canada",
            region: "Americas",
            region_id: 2,
            subregion: "Northern America",
            subregion_id: 6,
            nationality: "Canadian",
            timezones: "[]",
            translations: "{}",
            latitude: "60.00000000",
            longitude: "-95.00000000",
            emoji: "🇨🇦",
            emojiU: "U+1F1E8 U+1F1E6",
            created_at: "",
            updated_at: "",
            flag: 1,
            wikiDataId: "",
          },
          {
            id: 3,
            name: "United Kingdom",
            iso2: "GB",
            iso3: "GBR",
            numeric_code: "826",
            phonecode: "44",
            capital: "London",
            currency: "GBP",
            currency_name: "British pound",
            currency_symbol: "£",
            tld: ".uk",
            native: "United Kingdom",
            region: "Europe",
            region_id: 4,
            subregion: "Northern Europe",
            subregion_id: 18,
            nationality: "British",
            timezones: "[]",
            translations: "{}",
            latitude: "54.00000000",
            longitude: "-2.00000000",
            emoji: "🇬🇧",
            emojiU: "U+1F1EC U+1F1E7",
            created_at: "",
            updated_at: "",
            flag: 1,
            wikiDataId: "",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, error, isLoading };
}

export default useCountries;
