export interface ProductData {
  handle: string;
  /** Colour option values offered by the product (e.g. ["Teal Blue", "Black"]). */
  colors: string[];
  priceMin: number;
  priceMax: number;
}
