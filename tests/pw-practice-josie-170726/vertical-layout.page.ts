import { type Locator, type Page } from "@playwright/test";
import { ROUTES } from "../../lib/data/urls";

/**
 * Page Object for the Boost "Vertical layout" collection.
 *
 * Exercise goal: prove the "filter renders as a vertical column" three different
 * ways — a Playwright built-in locator (getByRole), a raw CSS selector, and an
 * XPath expression — so the spec stays a plain scenario while every selector lives
 * here (per the project golden rule: tests say WHAT, the Page Object knows HOW).
 *
 * Boost signals a vertical filter layout with two stable markers:
 *   - the layout wrapper gains `boost-sd-layout--has-filter-vertical`
 *   - the filter panel renders as a `boost-sd__filter-tree-vertical` column
 */
export class VerticalLayoutPage {
  readonly page: Page;

  /**
   * (1) Playwright built-in locator — the filter option headers. Boost gives each
   * one an aria-label "Filter by: <name>", so getByRole matches them by accessible
   * name; reading their positions then proves they stack top-to-bottom (vertical).
   */
  readonly verticalFilterTreeByPlaywright: Locator;

  /** (2) CSS selector — the layout wrapper carrying the vertical modifier class. */
  readonly verticalLayoutWrapperByCss: Locator;

  /** (3) XPath — the vertical filter-tree column container. */
  readonly verticalFilterTreeByXpath: Locator;

  constructor(page: Page) {
    this.page = page;

    // (1) Playwright built-in locator API — semantic, role + accessible name.
    // Boost renders each filter option header as a <button aria-label="Filter
    // by: <name>">; the vertical layout also keeps a hidden duplicate set for
    // mobile, so ".and(page.locator(':visible'))" narrows to the on-screen ones.
    this.verticalFilterTreeByPlaywright = page
      .getByRole("button", { name: /^Filter by:/i })
      .and(page.locator(":visible"));

    // (2) CSS selector engine — the layout wrapper carrying the vertical modifier class.
    this.verticalLayoutWrapperByCss = page.locator(
      "css=.boost-sd-layout.boost-sd-layout--has-filter-vertical.boost-sd-layout--has-vertical-style-default",
    );

    // (3) XPath engine — the vertical filter-tree column itself (not the page-wide
    // layout wrapper), whole-word class match so "...-vertical-content" etc. don't leak in.
    this.verticalFilterTreeByXpath = page.locator(
      "xpath=//div[normalize-space(@class)='boost-sd__filter-tree-vertical']",
    );
  }

  /**
   * Navigate to the vertical-layout collection, surviving Shopify's storefront
   * throttle. A rate-limited request returns a near-empty page whose body is just
   * the text "local_rate_limited" (Chromium fires dozens of sub-requests per load
   * and trips the per-client limit where a single curl would not). When we see it,
   * back off and reload a few times before giving up so `beforeEach` doesn't fail
   * on a transient cooldown instead of a real regression.
   */
  async goto() {
    // Cut the request burst before navigating. Each Boost page load otherwise
    // fires dozens of sub-requests (images, fonts, media, third-party analytics)
    // in one go, which is what trips Shopify's per-client 429 / local_rate_limited.
    // Aborting the noncritical ones keeps each load to a handful of requests — the
    // real fix for the throttle. We keep HTML, CSS, and JS/XHR so Boost still
    // renders and hydrates the vertical layout we assert on.
    await this.blockNoncriticalRequests();

    // Kept comfortably under the 60s per-test timeout: 4 navigations plus
    // 4s+8s+12s of backoff (~24s of waiting) still leaves headroom.
    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      // "networkidle": wait until Boost's XHR/asset traffic settles so the
      // storefront isn't still under load when we probe it — this, plus the
      // config-level slowMo, keeps us clear of the 429 / local_rate_limited throttle.
      await this.page.goto(ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT, {
        waitUntil: "networkidle",
      });

      const rateLimited = await this.page
        .getByText("local_rate_limited", { exact: true })
        .isVisible()
        .catch(() => false);
      if (!rateLimited) return;

      if (attempt < maxAttempts) {
        // Linear backoff (4s, 8s, 12s) to let Shopify's throttle window clear.
        await this.page.waitForTimeout(4000 * attempt);
      }
    }
    throw new Error(
      `Shopify returned "local_rate_limited" for ${ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT} ` +
        `after ${maxAttempts} attempts — the storefront is throttling this client, not a test regression.`,
    );
  }

  /**
   * Abort the requests we don't need for asserting on the layout so each page
   * load stays small enough to dodge the storefront's 429 throttle:
   *   - by resource type: images, fonts, media (never needed for our checks)
   *   - by host: common third-party analytics/tracking beacons
   * We deliberately keep the document, stylesheets and scripts/XHR — Boost needs
   * its CSS + JS to build the vertical layout wrapper and filter tree we verify.
   * Registered once, before the navigation loop, so retries don't stack handlers.
   */
  private async blockNoncriticalRequests() {
    const blockedResourceTypes = new Set(["image", "font", "media"]);
    const blockedHostPattern =
      /google-analytics|googletagmanager|doubleclick|facebook|hotjar|fullstory|segment|snowplow|clarity\.ms|tiktok/i;

    await this.page.route("**/*", (route) => {
      const request = route.request();
      if (
        blockedResourceTypes.has(request.resourceType()) ||
        blockedHostPattern.test(request.url())
      ) {
        return route.abort();
      }
      return route.continue();
    });
  }

  /**
   * Boost renders the vertical column first and populates its filter options a
   * moment later. Wait for the column and then a rendered filter option header so
   * the "Boost finished rendering" precondition holds before any assertion runs.
   */
  async waitForFilterLayoutRendered() {
    await this.verticalFilterTreeByXpath
      .first()
      .waitFor({ state: "visible", timeout: 20000 });
    await this.verticalFilterTreeByPlaywright
      .first()
      .waitFor({ state: "visible", timeout: 20000 });
  }

  /**
   * The most direct "vertical" signal: the filter option headers ("Collection",
   * "Brands", "Color", ...) stack top-to-bottom in one left-aligned column. A
   * horizontal filter bar would instead lay them out in a row (same y, rising x),
   * so comparing consecutive headers' positions distinguishes the two.
   */
  async filterOptionsStackVertically(): Promise<boolean> {
    const first = await this.verticalFilterTreeByPlaywright
      .nth(0)
      .boundingBox();
    const second = await this.verticalFilterTreeByPlaywright
      .nth(1)
      .boundingBox();
    if (!first || !second) return false;
    const leftAligned = Math.abs(second.x - first.x) <= 2;
    const stackedBelow = second.y >= first.y + first.height;
    return leftAligned && stackedBelow;
  }

  /**
   * A vertical filter is laid out as a column: taller than it is wide. Read the
   * rendered box so the assertion reflects real geometry, not just a class name.
   */
  async filterColumnIsVertical(): Promise<boolean> {
    const box = await this.verticalFilterTreeByXpath.first().boundingBox();
    if (!box) return false;
    return box.height > box.width;
  }
}
