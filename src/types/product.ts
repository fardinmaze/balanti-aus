export type Size = { value: string; inStock: boolean; productId: number };

export type Badge = "New" | "Best Seller";

/** As embedded on a product — just name/slug, not the full Category row (no id/parent here). */
export type ProductCategory = { name: string; slug: string };

/**
 * Single-row color/size mechanism (guide §5.1) — independent from `Size`
 * above, which is the sibling-row mechanism. A product can use either,
 * both, or neither; these arrays are empty when a product doesn't use this
 * mechanism at all (never fabricated).
 */
export type ColorOption = { id: number; name: string; hexCode: string | null; images: string[] };
export type SizeOption = { id: number; name: string };
export type StockVariation = {
  color: number | null;
  colorName: string | null;
  colorImage?: string | null;
  size: number | null;
  sizeName: string | null;
  quantity: number;
};

/**
 * Display shape consumed by every product component. Populated from the
 * live backend via src/lib/productAdapter.ts. Category/subcategory come
 * straight from the product's own `category`/`subcategory` fields rather
 * than an invented gender/style taxonomy — product filtering keys off
 * `category.slug`/`subcategory.slug`. The category *nav* (top categories,
 * subcategory tiles) instead reads the richer rows from
 * GET /site-api/all-categories / /top-categories, which do carry id/parent
 * — see src/store/modules/catalogue.ts.
 */
export type Product = {
  id: number; // backend Product row id — the cart_items[].item_id for a matrix-variant product (§5.4)
  handle: string; // backend product slug
  name: string;
  material: string;
  colorway: string;
  price: number; // AUD, GST-inclusive (Product.sell_price)
  onSale: boolean;
  offerPrice?: number; // AUD, GST-inclusive (Product.offer_price) — only meaningful when onSale is true
  vat: number; // GST percentage for this product — needed for checkout line totals
  badge?: Badge;
  category?: ProductCategory;
  subcategory?: ProductCategory;
  targetCustomer: string;
  /** Raw HTML from `Product.description` — rendered as-is (v-html), not truncated or reformatted. */
  description: string;
  /** Raw HTML from `Product.sell_description` — rendered as-is (v-html), not truncated or reformatted. */
  details: string;
  sizes: Size[];
  /** Matrix mechanism (§5.1) — empty unless the product carries `colors` in the API response. */
  colorOptions: ColorOption[];
  /** Matrix mechanism (§5.1) — empty unless the product carries `sizes` in the API response. */
  sizeOptions: SizeOption[];
  /** Matrix mechanism (§5.1) — empty unless the product carries `stock_variations` in the API response. */
  stockVariations: StockVariation[];
  tone: string; // placeholder-image tone, until real photography lands
  /** All general product photos, in API order — empty when the product has none. */
  images: string[];
  /** First entry of `images`, for callers that only need one (e.g. list cards). */
  image?: string;
  averageRating?: number;
  /** Whole-product stock (`Product.ps_on_hand`) — `null` when the API didn't return it, never fabricated. */
  stockOnHand: number | null;
};
