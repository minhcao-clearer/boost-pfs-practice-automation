import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.locator('body').click();
  await page.goto('https://boost-pfs-demo.myshopify.com/collections/vertical-layout');
  await page.getByText('All Tops (321) Bodysuits').click();
  await page.locator('div').filter({ hasText: 'Collection: Vertical layout' }).nth(1).click();
});