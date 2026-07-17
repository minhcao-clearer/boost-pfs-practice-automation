import { type Locator, type Page } from "@playwright/test";
import { type ProductData } from "../types/product.types";

export class FilterPage {
  readonly page: Page;
  readonly filteredProducts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filteredProducts = page.locator(".boost-sd__product");
  }

  /**
   * Boost renders the collection grid asynchronously after navigation, so wait
   * for the first product card before reading the grid.
   */
  async waitForProductsLoaded() {
    await this.filteredProducts
      .first()
      .waitFor({ state: "visible", timeout: 20000 });
  }

  /**
   * Read the rendered products from each card's `data-product` attribute.
   * Note: within `data-product`, `variants` is a JSON string (double-encoded)
   * while `options_with_values` is a plain nested array.
   */
  async getProductData(): Promise<ProductData[]> {
    return this.filteredProducts.evaluateAll((items) =>
      items.map((item) => {
        const data = JSON.parse(item.getAttribute("data-product") || "{}");
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
