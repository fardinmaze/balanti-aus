import { computed } from "vue";
import { useStore } from "@/store";
import type { ProductReview } from "@/api/types";

/** Thin composable over the `reviews` Vuex module. */
export function useReviews() {
  const store = useStore();

  return {
    loading: computed(() => store.state.reviews.loading),
    forProduct: (slug: string) => computed(() => store.getters["reviews/forProduct"](slug) as ProductReview[]),
    fetchForProduct: (slug: string) => store.dispatch("reviews/fetchForProduct", slug),
    submitReview: (payload: { product_slug: string; rating: number; title: string; comment: string }) =>
      store.dispatch("reviews/submitReview", payload),
  };
}
