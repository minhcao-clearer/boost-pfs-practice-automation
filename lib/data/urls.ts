export const ROUTES = {
  COLLECTION_ALL_VERTICAL_LAYOUT: "/collections/vertical-layout",
} as const;

/**
 * Build a collection URL with Boost filters encoded as query params. Boost reads
 * these on page load, so filtering this way is layout-agnostic — it does not
 * depend on the filter UI (vertical sidebar vs horizontal dropdowns), which can
 * differ on the shared demo store and break UI-driven clicks.
 */
export const buildFilteredCollectionUrl = (
  collectionPath: string,
  color: string,
  minPrice: string,
  maxPrice: string,
) =>
  `${collectionPath}?color=${encodeURIComponent(color)}&price=${minPrice}:${maxPrice}`;
