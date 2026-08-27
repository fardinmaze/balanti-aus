import type { Module } from "vuex";
import {
  checkoutApi,
  type FreeDelivery,
  type OfferStatus,
  type PlaceOrderPayload,
  type VatStatus,
} from "@/api/checkout";
import type { PaymentMethod, PlaceOrderResponse, ShippingMethod } from "@/api/types";
import type { RootState } from "../types";

export type CheckoutState = {
  vat: VatStatus | null;
  freeDelivery: FreeDelivery | null;
  offerStatus: OfferStatus | null;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  configLoaded: boolean;
  placing: boolean;
  lastOrder: PlaceOrderResponse | null;
  error: string | null;
};

function initialState(): CheckoutState {
  return {
    vat: null,
    freeDelivery: null,
    offerStatus: null,
    shippingMethods: [],
    paymentMethods: [],
    configLoaded: false,
    placing: false,
    lastOrder: null,
    error: null,
  };
}

export const checkout: Module<CheckoutState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setVat(state, vat: VatStatus) {
      state.vat = vat;
    },
    setFreeDelivery(state, freeDelivery: FreeDelivery) {
      state.freeDelivery = freeDelivery;
    },
    setOfferStatus(state, offerStatus: OfferStatus) {
      state.offerStatus = offerStatus;
    },
    setShippingMethods(state, methods: ShippingMethod[]) {
      state.shippingMethods = methods;
    },
    setPaymentMethods(state, methods: PaymentMethod[]) {
      state.paymentMethods = methods;
    },
    setConfigLoaded(state, loaded: boolean) {
      state.configLoaded = loaded;
    },
    setPlacing(state, placing: boolean) {
      state.placing = placing;
    },
    setLastOrder(state, order: PlaceOrderResponse | null) {
      state.lastOrder = order;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
  },
  actions: {
    /**
     * Loads storefront-wide checkout config. Shipping methods require a
     * Customer JWT in the current backend routing (guide §5.4/§8) — for a
     * guest that call 401s, which we swallow: free-delivery (shipping_type
     * 0) still works without the list, guests just won't see paid options.
     */
    async fetchConfig({ commit, state }) {
      if (state.configLoaded) return;
      const [vat, freeDelivery, offerStatus, paymentMethods] = await Promise.all([
        checkoutApi.vatStatus(),
        checkoutApi.freeDelivery(),
        checkoutApi.offerStatus(),
        checkoutApi.paymentMethods(),
      ]);
      commit("setVat", vat);
      commit("setFreeDelivery", freeDelivery);
      commit("setOfferStatus", offerStatus);
      commit("setPaymentMethods", paymentMethods);

      try {
        commit("setShippingMethods", await checkoutApi.shippingMethods());
      } catch {
        commit("setShippingMethods", []);
      }

      commit("setConfigLoaded", true);
    },

    async validateCoupon(_ctx, { coupon_code, cart_amount }: { coupon_code: string; cart_amount: number }) {
      return checkoutApi.validateCoupon(coupon_code, cart_amount);
    },

    async placeOrder({ commit }, payload: PlaceOrderPayload) {
      commit("setPlacing", true);
      commit("setError", null);
      try {
        const result = await checkoutApi.placeOrder(payload);
        commit("setLastOrder", result);
        return result;
      } catch (e) {
        commit("setError", e instanceof Error ? e.message : "Could not place your order.");
        throw e;
      } finally {
        commit("setPlacing", false);
      }
    },
  },
};
