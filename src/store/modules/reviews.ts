import type { Module } from "vuex";
import { reviewsApi } from "@/api/reviews";
import type { ProductReview } from "@/api/types";
import type { RootState } from "../types";

export type ReviewsState = {
  byProduct: Record<string, ProductReview[]>;
  loading: boolean;
};

function initialState(): ReviewsState {
  return { byProduct: {}, loading: false };
}

export const reviews: Module<ReviewsState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setForProduct(state, { slug, reviews }: { slug: string; reviews: ProductReview[] }) {
      state.byProduct[slug] = reviews;
    },
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
  },
  actions: {
    async fetchForProduct({ commit }, slug: string) {
      commit("setLoading", true);
      try {
        commit("setForProduct", { slug, reviews: await reviewsApi.forProduct(slug) });
      } finally {
        commit("setLoading", false);
      }
    },
    async submitReview({ dispatch }, payload: { product_slug: string; rating: number; title: string; comment: string }) {
      const result = await reviewsApi.create(payload);
      await dispatch("fetchForProduct", payload.product_slug);
      return result;
    },
  },
  getters: {
    forProduct: (state) => (slug: string) => state.byProduct[slug] ?? [],
  },
};
