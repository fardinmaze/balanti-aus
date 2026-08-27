import { http } from "./http";
import type { ProductReview } from "./types";

export const reviewsApi = {
  forProduct: (productSlug: string) =>
    http.get<ProductReview[]>(`/reviews/product/${productSlug}`, { auth: false }).then((e) => e.data ?? []),

  create: (payload: { product_slug: string; rating: number; title: string; comment: string }) =>
    http.post<ProductReview>("/reviews/create", { body: payload }).then((e) => e.data),
};
