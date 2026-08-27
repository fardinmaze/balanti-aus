import { http } from "./http";
import type { BackendProduct } from "./types";

/**
 * The wishlist list endpoint returns Wishlist rows, not bare products — the
 * guide doesn't spell out the exact shape, so unwrap defensively whether the
 * product is nested under a `product` key or the row itself is the product.
 */
function unwrapProduct(item: unknown): BackendProduct {
  if (item && typeof item === "object") {
    const row = item as Record<string, unknown>;
    if (row.product && typeof row.product === "object") return row.product as BackendProduct;
  }
  return item as BackendProduct;
}

export const wishlistApi = {
  list: () =>
    http
      .get<unknown[]>("/wishlist/")
      .then((e) => (e.data ?? []).map(unwrapProduct).filter((p) => p && p.slug)),
  add: (product_slug: string) => http.post("/wishlist/add", { body: { product_slug } }),
  remove: (productSlug: string) => http.delete(`/wishlist/remove/${productSlug}`),
};
