import type { Module } from "vuex";
import { addressApi, type AddressShape } from "@/api/address";
import type { CustomerAddress } from "@/api/types";
import type { RootState } from "../types";

export type AddressState = {
  addresses: CustomerAddress[];
  loaded: boolean;
  loading: boolean;
};

function initialState(): AddressState {
  return { addresses: [], loaded: false, loading: false };
}

export const address: Module<AddressState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setAddresses(state, addresses: CustomerAddress[]) {
      state.addresses = addresses;
      state.loaded = true;
    },
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchAddresses({ commit }) {
      commit("setLoading", true);
      try {
        commit("setAddresses", await addressApi.list());
      } finally {
        commit("setLoading", false);
      }
    },
    async addAddress({ dispatch }, payload: AddressShape) {
      const result = await addressApi.add(payload);
      await dispatch("fetchAddresses");
      return result;
    },
    async updateAddress({ dispatch }, { addressId, payload }: { addressId: number; payload: AddressShape }) {
      await addressApi.update(addressId, payload);
      await dispatch("fetchAddresses");
    },
    async setDefaultAddress({ dispatch }, addressId: number) {
      await addressApi.setDefault(addressId);
      await dispatch("fetchAddresses");
    },
  },
};
