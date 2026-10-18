import { computed } from "vue";
import { useStore } from "@/store";
import type { PlaceOrderPayload } from "@/api/checkout";
import type { PlaceOrderResponse, StripeSessionStatus } from "@/api/types";

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
    fetchFreeDelivery: () => store.dispatch("checkout/fetchFreeDelivery"),
    validateCoupon: (couponCode: string, cartAmount: number) =>
      store.dispatch("checkout/validateCoupon", { coupon_code: couponCode, cart_amount: cartAmount }),
    placeOrder: (payload: PlaceOrderPayload) =>
      store.dispatch("checkout/placeOrder", payload) as Promise<PlaceOrderResponse>,
    fetchStripeSessionStatus: (sessionId: string) =>
      store.dispatch("checkout/fetchStripeSessionStatus", sessionId) as Promise<StripeSessionStatus>,
  };
}

/** The Stripe order the browser was just sent off to pay — survives the round trip through Stripe's page. */
export type PendingPayment = { orderId: string; sessionId: string };

const PENDING_PAYMENT_KEY = "balanti-pending-payment";

export function savePendingPayment(pending: PendingPayment) {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(pending));
  } catch {
    /* storage unavailable — the confirmation page works off `?session_id` alone */
  }
}

export function clearPendingPayment() {
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    /* storage unavailable */
  }
}
