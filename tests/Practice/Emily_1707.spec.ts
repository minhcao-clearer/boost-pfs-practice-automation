//XPath
import { test, expect } from '@playwright/test';

test('Verify verical with Xpath', async ({page}) => {
    await page.goto('https://boost-pfs-demo.myshopify.com/collections/vertical-layout')
    const filter = page.locator('//div[contains(@class = "boost-sd__filter-tree-vertical")]');
    await expect(filter).toBeVisible();
});

// Css
//test('Verify vertical with CSS', async ({ page }) => {
  //await page.goto('https://boost-pfs-demo.myshopify.com/collections/vertical-layout');
//const filter = page.locator('.boost-sd__filter-tree-vertical');
 //   await expect(filter).toBeVisible();
//});
//Không có role, không có text, không có label, không có placeholder, data-testid -> không dùng Playwright locator