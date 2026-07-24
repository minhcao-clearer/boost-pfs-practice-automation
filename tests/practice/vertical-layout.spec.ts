import { test, expect } from "@playwright/test";

const RENDER_TIMEOUT = 15_000;
const VERTICAL_CSS = ".boost-sd__filter-tree-vertical";
const VERTICAL_XPATH =
  "xpath=//div[contains(@class,'boost-sd__filter-tree-vertical')]";

test.beforeEach(async ({ page }) => {
  await page.goto("", { waitUntil: "domcontentloaded" });
});

test("Vertical layout via CSS selector: the vertical filter tree is visible", async ({
  page,
}) => {
  await expect(
    page.locator(VERTICAL_CSS).first(),
    "Vertical filter tree should be visible",
  ).toBeVisible({ timeout: RENDER_TIMEOUT });
});

test("Vertical layout via XPath: the vertical filter tree is visible", async ({
  page,
}) => {
  await expect(
    page.locator(VERTICAL_XPATH).first(),
    "Vertical filter tree should be visible",
  ).toBeVisible({ timeout: RENDER_TIMEOUT });
});

test("Vertical layout via Playwright locator: the 'Vertical layout' collection heading is visible", async ({
  page,
}) => {
  await expect(
    page.getByRole("heading", { name: "Vertical layout" }),
    "The 'Vertical layout' collection heading should be visible",
  ).toBeVisible({ timeout: RENDER_TIMEOUT });
});
