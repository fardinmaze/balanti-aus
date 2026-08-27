import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store";
import type { Product } from "@/types/product";

/** Thin composable over the `wishlist` Vuex module — always server-backed (GET/POST/DELETE /wishlist/*). */
export function useWishlist() {
  const store = useStore();
  const router = useRouter();
  const route = useRoute();

  return {
    items: computed(() => store.getters["wishlist/items"] as Product[]),
    count: computed(() => store.getters["wishlist/count"] as number),
    isWishlisted: (handle: string) => (store.getters["wishlist/isWishlisted"] as (h: string) => boolean)(handle),
    async toggle(product: Product) {
      if (!store.getters["auth/isAuthenticated"]) {
        router.push({ name: "login", query: { redirect: route.fullPath } });
        return;
      }
      await store.dispatch("wishlist/toggle", product).catch(() => {
        /* optimistic add/remove is already rolled back by the store action */
      });
    },
  };
}
