import js from "@eslint/js";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "blob-report/**",
    ],
  },

  // Base JS + TypeScript recommended rules for all source.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Playwright-specific best-practice rules, scoped to the tests.
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts"],
  },

  // Project rule tweaks.
  {
    rules: {
      // Test DOM scraping / custom matchers legitimately touch `any`; surface
      // it as a warning rather than blocking the build.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Turn off stylistic rules that conflict with Prettier (keep this last).
  prettier,
);
