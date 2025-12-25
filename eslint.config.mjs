import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Exclude script files from linting
    "scripts/**",
  ]),
  {
    rules: {
      // Disable react-refresh rule for context files that export hooks
      "react-refresh/only-export-components": "off",
    },
  },
]);

export default eslintConfig;
