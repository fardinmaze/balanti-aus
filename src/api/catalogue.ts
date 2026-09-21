import { http } from "./http";
import type { BackendCategory, BackendProduct } from "./types";

export type PagedResult<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

async function paged<T>(path: string, count = 20, extraQuery?: Record<string, string | number>) {
  const envelope = await http.get<T[]>(path, { query: { count, ...extraQuery }, auth: false });

  // Guide §2.4 shows count/next/previous/results merged at the top level of the
  // envelope, but some endpoints nest that same shape under `data` instead — read
  // whichever is actually present rather than assuming one layout.
  const nested = envelope.data as unknown;
  const source =
    envelope.results !== undefined
      ? envelope
      : nested && typeof nested === "object" && !Array.isArray(nested) && "results" in nested
        ? (nested as { count?: number; next?: string | null; previous?: string | null; results?: T[] })
        : null;

  if (source) {
    return {
      count: source.count ?? 0,
      next: source.next ?? null,
      previous: source.previous ?? null,
      results: (source.results as unknown as T[]) ?? [],
    } satisfies PagedResult<T>;
  }

  // No pagination wrapper at all — `data` is just the bare array.
  const results = Array.isArray(envelope.data) ? (envelope.data as T[]) : [];
  return { count: results.length, next: null, previous: null, results } satisfies PagedResult<T>;
}

export const catalogueApi = {
  allCategories: () => http.get<BackendCategory[]>("/site-api/all-categories", { auth: false }).then((e) => e.data ?? []),
  topCategories: () => http.get<BackendCategory[]>("/site-api/top-categories", { auth: false }).then((e) => e.data ?? []),

  products: (count = 20) => paged<BackendProduct>("/site-api/products", count),
  featuredProducts: (count = 20) => paged<BackendProduct>("/site-api/featured-products", count),
  hotProducts: (count = 20) => paged<BackendProduct>("/site-api/hot-products", count),
  onSaleProducts: (count = 20) => paged<BackendProduct>("/site-api/on-sale-products", count),
  trendingProducts: (count = 20) => paged<BackendProduct>("/site-api/trending", count),
  mostPopularProducts: (count = 20) => paged<BackendProduct>("/site-api/most-popular", count),
  relatedProducts: (slug: string, count = 8) => paged<BackendProduct>(`/site-api/related-products/${slug}`, count),

  categoryProducts: (categorySlug: string, count = 20, page = 1) =>
    paged<BackendProduct>(`/site-api/category-products/${categorySlug}`, count, { page }),
  parentCategoryProducts: (categorySlug: string, count = 20, page = 1) =>
    paged<BackendProduct>(`/site-api/parent-category-products/${categorySlug}`, count, { page }),

  product: (slug: string) => http.get<BackendProduct>(`/site-api/product/${slug}`, { auth: false }).then((e) => e.data),

  search: (keyword: string, count = 20) =>
    paged<BackendProduct>("/site-api/search-product", count, { keyword }),
};
