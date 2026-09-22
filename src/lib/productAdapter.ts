import { resolveMediaUrl } from "@/api/http";
import type { BackendProduct, BackendProductCategoryRef, BackendProductImage, BackendProductVariation } from "@/api/types";
import type { ColorOption, ColorPhoto, Product, ProductAttributeItem, ProductCategory, Size, SizeOption, StockVariation } from "@/types/product";

/**
 * Maps the live Balanti backend's Product shape onto the frontend's display
 * shape. `description`/`details` are rendered verbatim as HTML (v-html) from
 * `Product.description`/`Product.detail` (falling back to the older
 * `sell_description` name when `detail` is absent) — never reformatted or
 * fabricated. The backend has no equivalent for `targetCustomer` — see
 * FRONTEND_API_GUIDE.md §8 (product fields truncated in the doc as "+36 more").
 * Category/subcategory are read straight off the backend's Category rows
 * rather than an invented gender/style taxonomy. Everything below degrades to
 * a sensible default rather than throwing when a field is missing or named
 * differently than assumed.
 */

function toCategory(value: BackendProductCategoryRef | null | undefined): ProductCategory | undefined {
  if (value && typeof value === "object" && value.slug) {
    return { name: value.name, slug: value.slug };
  }
  return undefined;
}

function deriveBadge(product: BackendProduct): Product["badge"] {
  if (product.hot_item || product.is_featured) return "Best Seller";
  return undefined;
}

function extractImageUrls(candidates: Array<string | BackendProductImage> | undefined): string[] {
  if (!candidates?.length) return [];
  return candidates.map((c) => (typeof c === "string" ? c : c.image)).filter(Boolean);
}

/** Per-photo image + thumbnail pair — falls back to the full image when the API didn't return a thumbnail. */
function extractColorPhotos(candidates: Array<string | BackendProductImage> | undefined): ColorPhoto[] {
  if (!candidates?.length) return [];
  return candidates
    .map((c) => (typeof c === "string" ? { image: c, thumbnail: c } : { image: c.image, thumbnail: c.thumbnail ?? c.image }))
    .filter((p) => Boolean(p.image));
}

/** All general product photos (not per-color), in API order — empty when the product has none. */
function adaptImages(product: BackendProduct): string[] {
  return extractImageUrls(product.images ?? product.product_images ?? product.product_image);
}

/** Smaller, list/card-optimized photos, in API order — empty when the product has none. */
function adaptThumbnails(product: BackendProduct): string[] {
  return extractImageUrls(product.thumbnails);
}

/** Deterministic, muted "leather" tone per product — stable across reloads, no photography needed. */
export function toneForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < (seed?.length ?? 0); i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue}, 32%, 24%)`;
}

function sizeLabel(variation: BackendProductVariation): string {
  return variation.size ?? variation.color ?? `Variant ${variation.id}`;
}

function adaptSizes(product: BackendProduct): Size[] {
  const variations = product.variations;
  if (variations && variations.length > 0) {
    return variations.map((v) => ({
      value: sizeLabel(v),
      inStock: (v.as_for_sale ?? 1) > 0,
      productId: v.id,
    }));
  }
  // No sibling variants — the product itself is the only purchasable row.
  return [{ value: "One Size", inStock: (product.as_for_sale ?? 1) > 0, productId: product.id }];
}

/** Matrix mechanism (§5.1) — only maps what's actually in `product.colors`; empty when absent. */
function adaptColorOptions(product: BackendProduct): ColorOption[] {
  if (!product.colors?.length) return [];
  return product.colors.map((c) => ({
    id: c.id,
    name: c.name,
    hexCode: c.hex_code ?? null,
    photos: extractColorPhotos(c.images),
  }));
}

/** Matrix mechanism (§5.1) — only maps what's actually in `product.sizes`; empty when absent. */
function adaptSizeOptions(product: BackendProduct): SizeOption[] {
  if (!product.sizes?.length) return [];
  return product.sizes.map((s) => ({ id: s.id, name: s.name }));
}

/** Matrix mechanism (§5.1) — only maps what's actually in `product.stock_variations`; empty when absent. */
function adaptStockVariations(product: BackendProduct): StockVariation[] {
  if (!product.stock_variations?.length) return [];
  return product.stock_variations.map((v) => ({
    color: v.color ?? null,
    colorName: v.color_name ?? null,
    colorImage: v.color_image ?? null,
    size: v.size ?? null,
    sizeName: v.size_name ?? null,
    quantity: v.quantity,
  }));
}

/** Parses `title1`/`image1`, `title2`/`image2`, ... pairs off `product.attributes` — sorted by index, skipping any pair missing either half. */
function adaptAttributeItems(product: BackendProduct): ProductAttributeItem[] {
  const attributes = product.attributes;
  if (!attributes || typeof attributes !== "object") return [];

  const indices = new Set<number>();
  for (const key of Object.keys(attributes)) {
    const match = /^(?:title|image)(\d+)$/.exec(key);
    if (match) indices.add(Number(match[1]));
  }

  return [...indices]
    .sort((a, b) => a - b)
    .map((n) => ({ title: attributes[`title${n}`], image: attributes[`image${n}`] }))
    .filter((item): item is ProductAttributeItem => Boolean(item.title && item.image))
    .map((item) => ({ title: item.title, image: resolveMediaUrl(item.image) }));
}

export function adaptProduct(product: BackendProduct): Product {
  const colorway = product.colorway ?? product.color ?? "";
  const onSale = Boolean(product.on_sale) && typeof product.offer_price === "number" && product.offer_price < product.sell_price;
  const images = adaptImages(product);
  const thumbnails = adaptThumbnails(product);

  return {
    id: product.id,
    handle: product.slug,
    name: product.name,
    material: product.material ?? "Leather",
    colorway,
    price: product.sell_price,
    onSale,
    offerPrice: onSale ? product.offer_price : undefined,
    vat: product.vat ?? 10,
    badge: deriveBadge(product),
    category: toCategory(product.category),
    subcategory: toCategory(product.subcategory),
    targetCustomer: "",
    description: product.description ?? "",
    details: product.detail ?? product.sell_description ?? "",
    sizes: adaptSizes(product),
    colorOptions: adaptColorOptions(product),
    sizeOptions: adaptSizeOptions(product),
    stockVariations: adaptStockVariations(product),
    tone: toneForSeed(product.slug || product.name),
    images,
    image: images[0],
    thumbnails,
    thumbnail: thumbnails[0] ?? images[0],
    stockOnHand: typeof product.ps_on_hand === "number" ? product.ps_on_hand : null,
    averageRating: product.average_rating,
    attributeItems: adaptAttributeItems(product),
    styling: product.styling ?? undefined,
    occasion: product.occasion ?? undefined,
  };
}

export function adaptProducts(products: BackendProduct[]): Product[] {
  return products.map(adaptProduct);
}
