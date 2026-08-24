import { type Locator, type Page } from "@playwright/test";
import { type ProductData } from "../types/product.types";

/** Boost renders the grid asynchronously; allow for a slow live store. */
const PRODUCT_GRID_TIMEOUT_MS = 20_000;

export class FilterPage {
  readonly filteredProducts: Locator;

  constructor(page: Page) {
    this.filteredProducts = page.locator(".boost-sd__product-item");
  }

  /**
   * Boost renders the collection grid asynchronously after navigation, so wait
   * for the first product card before reading the grid.
   */
  async waitForProductsLoaded() {
    await this.filteredProducts
      .first()
      .waitFor({ state: "visible", timeout: PRODUCT_GRID_TIMEOUT_MS });
  }

  /**
   * Read the rendered products from each card's `data-product` attribute.
   * Note: within `data-product`, `variants` is a JSON string (double-encoded)
   * while `options_with_values` is a plain nested array.
   */
  async getProductData(): Promise<ProductData[]> {
    return this.filteredProducts.evaluateAll((items) =>
      items.map((item) => {
        const raw = item.getAttribute("data-product");
        if (!raw) {
          // Fail loudly: defaulting to {} would yield handle: undefined and
          // priceMin: NaN, so a renamed attribute would surface as a confusing
          // assertion failure instead of the real cause.
          throw new Error(
            "Product card has no `data-product` attribute — Boost's markup has likely changed.",
          );
        }
        const data = JSON.parse(raw);
        const colorOption = (data.options_with_values || []).find(
          (option: { name?: string }) =>
            (option.name || "").toLowerCase() === "color",
        );
        const colors: string[] = colorOption
          ? colorOption.values.map((value: { title: string }) => value.title)
          : [];

        return {
          handle: data.handle,
          colors,
          priceMin: Number(data.priceMin),
          priceMax: Number(data.priceMax),
        };
      }),
    );
  }
}
