import { test, expect } from "../../lib/fixtures";
import { VerticalLayoutPage } from "./vertical-layout.page";

/**
 * Kịch bản: Tại trang vertical-layout, filter hiển thị đúng bố cục dọc.
 *   Given  — người dùng truy cập trang /collections/vertical-layout
 *   When   — trang tải và Boost render xong bố cục
 *   Then   — bố cục của filter phải là DỌC (vertical)
 *
 * Yêu cầu: chứng minh "bố cục dọc" bằng cả 3 cách selector đã học, mỗi cách một
 * test độc lập — (1) Playwright locator, (2) CSS, (3) XPath (xem VerticalLayoutPage).
 * Mỗi test tự điều hướng lại từ đầu để không phụ thuộc thứ tự hay trạng thái chung.
 */
test.describe("Vertical layout collection — filter renders in a vertical layout", () => {
  // Run serially: every test in this file navigates to the same collection URL in
  // its beforeEach. Firing several of those navigations at once (fullyParallel's
  // default) is enough to trip the shared demo store's rate limiter, which then
  // serves a "local_rate_limited" page instead of the real layout for a while.
  // Serial mode keeps requests to this single shared URL spaced out.
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    const verticalLayout = new VerticalLayoutPage(page);
    await verticalLayout.goto();
    await verticalLayout.waitForFilterLayoutRendered();
  });

  test("1. Vertical layout via Playwright locator (not use getByRole): the filter options stack top-to-bottom in a column", async ({
    page,
  }) => {
    const verticalLayout = new VerticalLayoutPage(page);

    await expect(
      verticalLayout.verticalFilterTreeByPlaywright.first(),
      "Filter option headers should render in the filter panel",
    ).toBeVisible();

    const stacksVertically =
      await verticalLayout.filterOptionsStackVertically();
    expect(
      stacksVertically,
      "Filter option headers should stack top-to-bottom in one left-aligned column (vertical), not sit in a row",
    ).toBeTruthy();
  });

  test("2. Vertical layout via CSS selector: the layout wrapper carries the vertical modifier class", async ({
    page,
  }) => {
    const verticalLayout = new VerticalLayoutPage(page);

    await expect(
      verticalLayout.verticalLayoutWrapperByCss,
      'Layout wrapper should carry "boost-sd-layout--has-filter-vertical"',
    ).not.toHaveCount(0);
    await expect(
      verticalLayout.verticalLayoutWrapperByCss.first(),
      "Vertical layout wrapper should be visible",
    ).toBeVisible();
  });

  test("3. Vertical layout via XPath: the filter tree is a vertical column (taller than it is wide)", async ({
    page,
  }) => {
    const verticalLayout = new VerticalLayoutPage(page);

    await expect(
      verticalLayout.verticalFilterTreeByXpath,
      'A "boost-sd__filter-tree-vertical" column should render',
    ).not.toHaveCount(0);

    const isVertical = await verticalLayout.filterColumnIsVertical();
    expect(
      isVertical,
      "Filter column should be taller than it is wide (a vertical stack)",
    ).toBeTruthy();
  });
});
