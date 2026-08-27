import type { BackendProduct, BackendProductCategoryRef, BackendProductVariation } from "@/api/types";
import type { Product, ProductCategory, Size } from "@/types/product";

/**
 * Maps the live Balanti backend's Product shape onto the frontend's display
 * shape. The backend has no equivalent for some marketing copy (targetCustomer,
 * bullet `details`) — see FRONTEND_API_GUIDE.md §8 (product fields truncated
 * in the doc as "+36 more"). Category/subcategory are read straight off the
 * backend's Category rows rather than an invented gender/style taxonomy.
 * Everything below degrades to a sensible default rather than throwing when a
 * field is missing or named differently than assumed.
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

function firstImage(product: BackendProduct): string | undefined {
  const candidates = product.images ?? product.product_images ?? product.product_image;
  const first = candidates?.[0];
  if (!first) return undefined;
  return typeof first === "string" ? first : first.image;
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

function deriveDetails(product: BackendProduct): string[] {
  if (product.description) {
    return product.description
      .split(/(?<=[.!])\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  return [];
}

export function adaptProduct(product: BackendProduct): Product {
  const colorway = product.colorway ?? product.color ?? "";
  const onSale = Boolean(product.on_sale) && typeof product.offer_price === "number" && product.offer_price < product.sell_price;

  return {
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
    description: product.short_description ?? product.description ?? "",
    details: deriveDetails(product),
    sizes: adaptSizes(product),
    tone: toneForSeed(product.slug || product.name),
    image: firstImage(product),
    averageRating: product.average_rating,
  };
}

export function adaptProducts(products: BackendProduct[]): Product[] {
  return products.map(adaptProduct);
}
