/**
 * Backend response shapes, per FRONTEND_API_GUIDE.md.
 *
 * The guide documents the fields that matter for integration (§4, §5) but
 * truncates the full serializer field list for `product/create` etc.
 * ("+36 more"). Everything below marked `[assumed]` is a best guess at the
 * read-shape and defended against in src/lib/productAdapter.ts with
 * fallbacks — verify against a live response and adjust if names differ.
 */

/**
 * Verified against a live response — there is no `parent` field at all,
 * contrary to guide §5.1. `/all-categories` returns top-level rows with their
 * children nested one level deep in `subcategories`; `/top-categories`
 * returns the same top-level rows with `subcategories` simply absent. See
 * src/lib/category.ts for how this gets flattened for the rest of the app.
 */
export type BackendCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  featured?: boolean;
  subcategories?: BackendCategory[];
};

export type BackendProductVariation = {
  id: number;
  pid?: string;
  slug?: string;
  size?: string;
  color?: string;
  sell_price?: number;
  as_for_sale?: number;
};

/**
 * Single-row color/size mechanism (guide §5.1) — a separate, independent
 * mechanism from the sibling-row `variations` above. `images` is absent/empty
 * when that color has no photos.
 */
export type BackendProductColor = {
  id: number;
  name: string;
  hex_code?: string | null;
  images?: Array<string | BackendProductImage>;
};

export type BackendProductSize = {
  id: number;
  name: string;
};

/** Current stock per (color, size) combination — `color`/`size` are `null` when the product has no variation on that axis. */
export type BackendStockVariation = {
  color: number | null;
  color_name?: string | null;
  color_image?: string | null;
  size: number | null;
  size_name?: string | null;
  quantity: number;
};

/** Category as embedded on a product — only carries name/slug, unlike the richer rows from /all-categories or /top-categories. */
export type BackendProductCategoryRef = {
  name: string;
  slug: string;
};

/** Verified against a live response — general product photos (not per-color), returned as an array of these rows. */
export type BackendProductImage = {
  id: number;
  image: string;
  /** Smaller, list/thumbnail-strip-optimized version of `image` — verified against a live response. */
  thumbnail?: string;
  created_at?: string;
};

export type BackendProduct = {
  id: number;
  pid: string;
  slug: string;
  name: string;
  sell_price: number;
  cost_price?: number;
  offer_price?: number;
  on_sale?: boolean;
  vat?: number;
  average_rating?: number;
  category?: BackendProductCategoryRef | null;
  subcategory?: BackendProductCategoryRef | null;
  brand?: { id: number; name: string } | number | null;
  /** True when this product has sibling size/color rows sharing `product_group`. */
  variation?: boolean;
  /** Shared id linking variant sibling products together; null when the product has no variants. */
  product_group?: string | number | null;
  variations?: BackendProductVariation[];
  /** Single-row color/size mechanism (guide §5.1) — absent/empty on products that don't use it. */
  colors?: BackendProductColor[];
  sizes?: BackendProductSize[];
  stock_variations?: BackendStockVariation[];
  special_filter?: unknown;
  images?: Array<string | BackendProductImage>;
  product_images?: Array<string | BackendProductImage>;
  product_image?: string[];
  /** Smaller, list/card-optimized photos — used in place of `images` for card/grid views. */
  thumbnails?: Array<string | BackendProductImage>;
  description?: string;
  /** Verified against a live response — the guide's assumed `short_description` name doesn't exist; this is the real field. */
  sell_description?: string;
  /** Verified against a live response — rich-text material/construction breakdown (upper, lining, outsole, insole, ...), separate from `sell_description`. */
  detail?: string;
  material?: string;
  color?: string;
  colorway?: string;
  as_for_sale?: number;
  /** Whole-product stock count — the same figure checkout compares against for a product with no color/size axis (guide §5.4). */
  ps_on_hand?: number;
  bmsm?: boolean;
  hot_item?: boolean;
  is_featured?: boolean;
  /** Ad-hoc spec highlights — `title1`/`image1`, `title2`/`image2`, ... pairs, in no guaranteed order. */
  attributes?: Record<string, string>;
  /** Verified against a live response — `{ id, name }`, e.g. `{ id: 2, name: "Oxford" }`. */
  styling?: { id: number; name: string } | null;
  /** Verified against a live response — same shape as `styling`, e.g. `{ id: 3, name: "Formal Events" }`. */
  occasion?: { id: number; name: string } | null;
  [extra: string]: unknown;
};

/** Verified against a live GET /system/settings/shop-contact-info response (public — no auth required despite the guide listing it as Staff JWT). */
export type ShopContactInfo = {
  id?: number;
  email_address: string;
  phone_number: string;
  billing_address?: Record<string, unknown>;
  shipping_address?: Record<string, unknown>;
};

/** Verified against a live GET /site-api/social-links response — all four keys are always present, null when not set. */
export type SocialLinks = {
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
};

/** Verified against a live GET /cms/aboutus/view response. `values` is the literal string "No VALUE" when unset on the backend (a sentinel, not real content) — guard for that rather than just falsy. */
export type AboutUs = {
  id?: number;
  about?: string;
  mission?: { title?: string; description?: string } | string;
  values?: string | string[];
};

export type BackendCustomer = {
  id?: number;
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  billing_address?: unknown;
  shipping_address?: unknown;
};

export type LoginResult = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry: string | number;
  user_object: BackendCustomer;
};

export type ShippingMethod = { id: number; name: string; amount?: number; price?: number };
export type PaymentMethod = { id: number; name: string; test_mode?: boolean };

export type CustomerAddress = {
  id: number;
  address: Record<string, unknown>;
  is_default?: boolean;
};

export type ProductReview = {
  id: number;
  product_slug?: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase?: boolean;
  is_approved?: boolean;
  created_at?: string;
  customer_name?: string;
};

export type ReturnRequest = {
  id: number;
  so_product_id: number;
  reason: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED" | "REFUNDED";
  created_at?: string;
};

export type OrderSummary = {
  so_id?: string;
  order_id?: string;
  so_date?: string;
  total?: number;
  status?: string;
  [extra: string]: unknown;
};

export type PlaceOrderResponse = {
  order_id: string;
  items_created: number;
  failed_items: unknown[];
};
