"use client";

import { useEffect, useState } from "react";

interface Country {
  name: string;
  code: string;
  [key: string]: string | number | boolean | undefined; // Allow for additional properties from API
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
        if (Array.isArray(result)) {
          setCountries(result);
        } else if (result.data && Array.isArray(result.data)) {
          setCountries(result.data);
        } else if (result.countries && Array.isArray(result.countries)) {
          setCountries(result.countries);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        // Set fallback countries on error
        setCountries([
          { name: "United States", code: "US" },
          { name: "Canada", code: "CA" },
          { name: "United Kingdom", code: "GB" },
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
