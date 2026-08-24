import { test, expect } from "../../lib/fixtures";
import { ROUTES, buildFilteredCollectionUrl } from "../../lib/data/urls";
import { FILTER_DATA } from "../../lib/data/filter.data";

/**
 * A product passes the price filter when its price range OVERLAPS the band:
 * Boost shows a product if ANY variant is in range, not only when the whole
 * range is contained.
 */
const priceRangeOverlaps = (
  productMin: number,
  productMax: number,
  bandMin: number,
  bandMax: number,
) => productMin <= bandMax && productMax >= bandMin;

test(
  "Filter validation: a colour + price filtered collection shows only matching products",
  {
    tag: ["@smoke", "@regression"],
  },
  async ({ page, filterPage }) => {
    const minPrice = Number(FILTER_DATA.PRICE.MIN);
    const maxPrice = Number(FILTER_DATA.PRICE.MAX);

    // Apply Colour + Price via URL params (Boost reads them on page load). This is
    // layout-agnostic on purpose: it avoids driving the filter dropdowns, whose
    // layout on the shared demo store switches between vertical/horizontal and
    // makes UI clicks flaky.
    await page.goto(
      buildFilteredCollectionUrl({
        collectionPath: ROUTES.COLLECTION_ALL_VERTICAL_LAYOUT,
        color: FILTER_DATA.COLOR.BLUE,
        minPrice: FILTER_DATA.PRICE.MIN,
        maxPrice: FILTER_DATA.PRICE.MAX,
      }),
      { waitUntil: "domcontentloaded" },
    );
    await filterPage.waitForProductsLoaded();

    // The filter must return at least one product.
    await expect(
      filterPage.filteredProducts,
      `No products returned for ${FILTER_DATA.COLOR.BLUE} in price band [${minPrice}, ${maxPrice}]`,
    ).not.toHaveCount(0);

    const productData = await filterPage.getProductData();

    for (const { handle, colors, priceMin, priceMax } of productData) {
      // Colour: Boost treats "Blue" as matching compound names ("Teal Blue",
      // "Baby Blue") and "Multi Color" matches every colour, so mirror that here.
      const matchesColor =
        colors.some((color) => color.includes(FILTER_DATA.COLOR.BLUE)) ||
        colors.includes("Multi Color");
      expect(
        matchesColor,
        `Product "${handle}" offers no ${FILTER_DATA.COLOR.BLUE} colour (has: ${colors.join(", ")})`,
      ).toBeTruthy();

      // Price: the UI exposes only the product-level range, so assert the product
      // range overlaps the filter band (see priceRangeOverlaps).
      const overlapsPriceBand = priceRangeOverlaps(
        priceMin,
        priceMax,
        minPrice,
        maxPrice,
      );
      expect(
        overlapsPriceBand,
        `Product "${handle}" price range [${priceMin}, ${priceMax}] does not overlap [${minPrice}, ${maxPrice}]`,
      ).toBeTruthy();
    }
  },
);
