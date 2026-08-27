import type { Module } from "vuex";
import { accountApi, type EditAccountPayload } from "@/api/account";
import type { OrderSummary } from "@/api/types";
import type { RootState } from "../types";

export type AccountState = {
  orders: OrderSummary[];
  ordersLoaded: boolean;
  loading: boolean;
};

function initialState(): AccountState {
  return { orders: [], ordersLoaded: false, loading: false };
}

export const account: Module<AccountState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setOrders(state, orders: OrderSummary[]) {
      state.orders = orders;
      state.ordersLoaded = true;
    },
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchOrders({ commit }) {
      commit("setLoading", true);
      try {
        commit("setOrders", await accountApi.myOrders());
      } finally {
        commit("setLoading", false);
      }
    },
    async editProfile({ commit }, payload: EditAccountPayload) {
      const result = await accountApi.editAccount(payload);
      if (result) commit("auth/setUser", result, { root: true });
      return result;
    },
  },
};
