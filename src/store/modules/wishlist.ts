import type { Module } from "vuex";
import { wishlistApi } from "@/api/wishlist";
import { adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import type { RootState } from "../types";

export type WishlistState = {
  items: Product[];
  loaded: boolean;
};

function initialState(): WishlistState {
  return { items: [], loaded: false };
}

export const wishlist: Module<WishlistState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    add(state, product: Product) {
      if (!state.items.some((p) => p.handle === product.handle)) state.items.push(product);
    },
    remove(state, handle: string) {
      state.items = state.items.filter((p) => p.handle !== handle);
    },
    setItems(state, products: Product[]) {
      state.items = products;
      state.loaded = true;
    },
    reset(state) {
      state.items = [];
      state.loaded = false;
    },
  },
  actions: {
    /** Always goes through GET/POST/DELETE /wishlist/* — the backend has no guest wishlist (Customer JWT required). */
    async toggle({ state, commit }, product: Product) {
      const exists = state.items.some((p) => p.handle === product.handle);
      if (exists) {
        commit("remove", product.handle);
        try {
          await wishlistApi.remove(product.handle);
        } catch (e) {
          commit("add", product);
          throw e;
        }
      } else {
        commit("add", product);
        try {
          await wishlistApi.add(product.handle);
        } catch (e) {
          commit("remove", product.handle);
          throw e;
        }
      }
    },

    async fetchWishlist({ commit, rootState }) {
      const backend = await wishlistApi.list();
      // The wishlist row's own product payload is a lighter serializer than
      // /products, /featured-products etc. and is missing on_sale/offer_price —
      // prefer whatever fuller copy the catalogue already has cached by handle.
      const products = adaptProducts(backend).map((p) => rootState.catalogue.byHandle[p.handle] ?? p);
      commit("setItems", products);
    },
  },
  getters: {
    items: (state) => state.items,
    isWishlisted: (state) => (handle: string) => state.items.some((p) => p.handle === handle),
    count: (state) => state.items.length,
  },
};
