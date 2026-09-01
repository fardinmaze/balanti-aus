import { computed } from "vue";
import { useStore } from "@/store";
import type { CartLine, CartVariant } from "@/store/modules/cart";
import type { Product } from "@/types/product";

export type { CartLine, CartVariant };

/** Thin composable over the `cart` Vuex module — same call shape as before, now store-backed. */
export function useCart() {
  const store = useStore();

  return {
    lines: computed(() => store.state.cart.lines),
    isOpen: computed(() => store.state.cart.isOpen),
    count: computed(() => store.getters["cart/count"] as number),
    subtotal: computed(() => store.getters["cart/subtotal"] as number),
    addItem: (product: Product, sizeValue: string, qty = 1, variant?: CartVariant) =>
      store.dispatch("cart/addItem", { product, sizeValue, qty, variant }),
    removeItem: (handle: string, size: string) => store.dispatch("cart/removeItem", { handle, size }),
    updateQty: (handle: string, size: string, qty: number) => store.dispatch("cart/updateQty", { handle, size, qty }),
    clear: () => store.dispatch("cart/clear"),
    openCart: () => store.dispatch("cart/open"),
    closeCart: () => store.dispatch("cart/close"),
  };
}
