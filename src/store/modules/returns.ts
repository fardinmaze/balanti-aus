import type { Module } from "vuex";
import { returnsApi } from "@/api/returns";
import type { ReturnRequest } from "@/api/types";
import type { RootState } from "../types";

export type ReturnsState = {
  requests: ReturnRequest[];
  loaded: boolean;
  loading: boolean;
};

function initialState(): ReturnsState {
  return { requests: [], loaded: false, loading: false };
}

export const returns: Module<ReturnsState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setRequests(state, requests: ReturnRequest[]) {
      state.requests = requests;
      state.loaded = true;
    },
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchMyRequests({ commit }) {
      commit("setLoading", true);
      try {
        commit("setRequests", await returnsApi.myRequests());
      } finally {
        commit("setLoading", false);
      }
    },
    async requestReturn({ dispatch }, payload: { so_product_id: number; reason: string }) {
      const result = await returnsApi.request(payload.so_product_id, payload.reason);
      await dispatch("fetchMyRequests");
      return result;
    },
  },
};
