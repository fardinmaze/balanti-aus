import { computed } from "vue";
import { useStore } from "@/store";
import type { PlaceOrderPayload } from "@/api/checkout";

/** Thin composable over the `checkout` Vuex module. */
export function useCheckout() {
  const store = useStore();

  return {
    vat: computed(() => store.state.checkout.vat),
    freeDelivery: computed(() => store.state.checkout.freeDelivery),
    shippingMethods: computed(() => store.state.checkout.shippingMethods),
    paymentMethods: computed(() => store.state.checkout.paymentMethods),
    configLoaded: computed(() => store.state.checkout.configLoaded),
    placing: computed(() => store.state.checkout.placing),
    error: computed(() => store.state.checkout.error),

    fetchConfig: () => store.dispatch("checkout/fetchConfig"),
    validateCoupon: (couponCode: string, cartAmount: number) =>
      store.dispatch("checkout/validateCoupon", { coupon_code: couponCode, cart_amount: cartAmount }),
    placeOrder: (payload: PlaceOrderPayload) => store.dispatch("checkout/placeOrder", payload),
  };
}
