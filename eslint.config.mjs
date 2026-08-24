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

  // Fixed sleeps are flaky: enforce as an error (recommended ships it only as a warning).
  // A rare, unavoidable pause must be left in with an explicit disable + reason, e.g.:
  //   // eslint-disable-next-line playwright/no-wait-for-timeout -- <why no condition works>
  //
  // These two blocks must stay SEPARATE. tests/ already has the playwright plugin from
  // the recommended config above, so re-registering it there fails with
  // "Cannot redefine plugin". lib/ has no plugin yet, so it must register its own.
  {
    files: ["tests/**/*.ts"],
    rules: {
      "playwright/no-wait-for-timeout": "error",
    },
  },

  // Same enforcement for Page Objects / helpers under lib/, so a fixed sleep can't hide
  // there (the Playwright config above is scoped to tests/ only).
  {
    files: ["lib/**/*.ts"],
    plugins: { playwright },
    rules: {
      "playwright/no-wait-for-timeout": "error",
    },
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
