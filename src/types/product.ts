export type Size = { value: string; inStock: boolean; productId: number };

export type Badge = "New" | "Best Seller";

/** As embedded on a product — just name/slug, not the full Category row (no id/parent here). */
export type ProductCategory = { name: string; slug: string };

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
  description: string;
  details: string[];
  sizes: Size[];
  tone: string; // placeholder-image tone, until real photography lands
  image?: string;
  averageRating?: number;
};
