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
    /** Color id selected when the item was saved — null if none was, or it was saved on another device. */
    colorFor: (handle: string) => (store.getters["wishlist/colorFor"] as (h: string) => number | null)(handle),
    /** `colorId` is remembered with the item so the wishlist shows that colorway's photo. */
    async toggle(product: Product, colorId: number | null = null) {
      if (!store.getters["auth/isAuthenticated"]) {
        router.push({ name: "login", query: { redirect: route.fullPath } });
        return;
      }
      await store.dispatch("wishlist/toggle", { product, colorId }).catch((e) => {
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
