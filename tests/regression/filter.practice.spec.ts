// Cách 1: Lấy locator XPath
import { test, expect } from '@playwright/test';

test('Verify filter is displayed with Vertical layout-xpath', async ({ page }) => {
  // Arrange:
  await page.goto('https://boost-pfs-demo.myshopify.com/collections/vertical-layout');

  // Locator:
  const filterVertical = page.locator("xpath=//div[@class='boost-sd__filter-tree-vertical    ']");

  // Assertion:
  await expect(filterVertical).toBeVisible();
});

// Cách 2: Lấy locator CSS

test('Verify filter is displayed with Vertical layout-css', async ({ page }) => {
  // Arrange:
  await page.goto('https://boost-pfs-demo.myshopify.com/collections/vertical-layout');

  // Locator:
  const filterVertical = page.locator('.boost-sd__filter-tree-vertical');

  // Assertion:
  await expect(filterVertical).toBeVisible();
});

// Cách 3: Lấy locator Playwright