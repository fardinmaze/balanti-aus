import { computed } from "vue";
import { useCheckout } from "@/lib/checkout";

/** "Free shipping over $X" — null (render nothing) once the threshold is 0 or unset, per GET /site-api/free-delivery. */
export function useFreeShippingLine() {
  const checkout = useCheckout();
  return computed(() => {
    const amount = checkout.freeDelivery.value?.amount ?? 0;
    return amount > 0 ? `Free shipping over $${amount.toFixed(0)}` : null;
  });
}
