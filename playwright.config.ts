import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load env from .env (gitignored). In CI these come from the workflow instead.
// `quiet` suppresses dotenv's promotional tips so test output stays clean.
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

// Fail fast with a clear message instead of a cryptic "invalid URL" later.
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    "BASE_URL is not set. Copy .env.example to .env for local runs, " +
      "or set it as an env var / repo variable in CI.",
  );
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // 60s per test: the suite drives a live site, which can be slow to respond.
  timeout: 60_000,
  globalTimeout: 10 * 60 * 1000,
  testDir: "./tests",
  /* Run tests in files in parallel — parallelism is what surfaces hidden coupling
     between tests (see TESTING-STANDARD.md §6). */
  fullyParallel: true,
  /* Belt-and-braces against a stray test.only; ESLint's playwright/no-focused-test
     catches it in CI, which is where the lint gate runs. */
  forbidOnly: !!process.env.CI,
  /* No retries: a flaky test should be fixed at the root, not retried until green
     (see CLAUDE.md's anti-patterns). The suite runs locally, so failures are seen. */
  retries: 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL for relative navigations like `page.goto('/collections/...')`. */
    baseURL,

    /* Keep artifacts only when they're useful (on failure/retry) to stay fast. */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
