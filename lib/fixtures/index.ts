import { test as base } from "@playwright/test";
import { FilterPage } from "../pages/filter.page";

// Fixtures exposed to the tests.
type MyFixtures = {
  filterPage: FilterPage;
};

// Extend Playwright's base test with our Page Objects.
export const test = base.extend<MyFixtures>({
  filterPage: async ({ page }, use) => {
    await use(new FilterPage(page));
  },
});

// Re-export expect so tests import test + expect from a single place.
export { expect } from "@playwright/test";
