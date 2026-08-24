import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load env from .env (gitignored). `quiet` suppresses dotenv's promotional tips
// so test output stays clean.
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

// Fail fast with a clear message instead of a cryptic "invalid URL" later.
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    "BASE_URL is not set. Copy .env.example to .env, or pass it as an env var.",
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

    /* Keep artifacts only when they're useful — on failure — to stay fast.
       Trace must be retain-on-failure, NOT on-first-retry: with retries at 0 a
       retry never happens, so on-first-retry would never capture anything. */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Chromium only for now. Add more browsers/viewports here when a scenario
     needs them, e.g. { name: "firefox", use: devices["Desktop Firefox"] } or
     { name: "Mobile Chrome", use: devices["Pixel 5"] }. */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
