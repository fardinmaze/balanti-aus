import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "@/store";
import { ApiError } from "@/api/http";
import { useToast } from "@/lib/toast";
import type { Product } from "@/types/product";

/** Thin composable over the `wishlist` Vuex module — always server-backed (GET/POST/DELETE /wishlist/*). */
export function useWishlist() {
  const store = useStore();
  const router = useRouter();
  const route = useRoute();
  const toast = useToast();

  return {
    items: computed(() => store.getters["wishlist/items"] as Product[]),
    count: computed(() => store.getters["wishlist/count"] as number),
    isWishlisted: (handle: string) => (store.getters["wishlist/isWishlisted"] as (h: string) => boolean)(handle),
    async toggle(product: Product) {
      if (!store.getters["auth/isAuthenticated"]) {
        router.push({ name: "login", query: { redirect: route.fullPath } });
        return;
      }
      await store.dispatch("wishlist/toggle", product).catch((e) => {
        // A locally-stored token can still be expired/invalid server-side — the
        // client only checks presence, not validity, before this call.
        if (e instanceof ApiError && e.status === 401) {
          store.dispatch("auth/logout");
          toast.show("Please log in to add items to your wishlist.");
          return;
        }
        /* other failures: optimistic add/remove is already rolled back by the store action */
      });
    },
  };
}
