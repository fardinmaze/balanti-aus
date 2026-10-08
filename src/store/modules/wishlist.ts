import type { Module } from "vuex";
import { wishlistApi } from "@/api/wishlist";
import { adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import type { RootState } from "../types";

/**
 * The backend wishlist only stores product slugs, so the color the shopper had
 * selected when saving is remembered per-browser here (handle → color id).
 */
const COLORS_STORAGE_KEY = "balanti-wishlist-colors";

export type WishlistState = {
  items: Product[];
  loaded: boolean;
  colors: Record<string, number>;
};

function loadColors(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COLORS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function saveColors(colors: Record<string, number>) {
  try {
    localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(colors));
  } catch {
    /* storage unavailable — the wishlist just falls back to each product's default color */
  }
}

function initialState(): WishlistState {
  return { items: [], loaded: false, colors: loadColors() };
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
    setColor(state, { handle, colorId }: { handle: string; colorId: number | null }) {
      const next = { ...state.colors };
      if (colorId == null) delete next[handle];
      else next[handle] = colorId;
      state.colors = next;
      saveColors(next);
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
    async toggle({ state, commit }, { product, colorId = null }: { product: Product; colorId?: number | null }) {
      const exists = state.items.some((p) => p.handle === product.handle);
      if (exists) {
        commit("remove", product.handle);
        try {
          await wishlistApi.remove(product.handle);
          commit("setColor", { handle: product.handle, colorId: null });
        } catch (e) {
          commit("add", product);
          throw e;
        }
      } else {
        commit("add", product);
        commit("setColor", { handle: product.handle, colorId });
        try {
          await wishlistApi.add(product.handle);
        } catch (e) {
          commit("remove", product.handle);
          commit("setColor", { handle: product.handle, colorId: null });
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
    /** Resolved through the catalogue cache so a fuller copy (color options,
     *  per-color photos) replaces the light wishlist payload as soon as it loads. */
    items: (state, _getters, rootState) => state.items.map((p) => rootState.catalogue.byHandle[p.handle] ?? p),
    isWishlisted: (state) => (handle: string) => state.items.some((p) => p.handle === handle),
    colorFor: (state) => (handle: string) => state.colors[handle] ?? null,
    count: (state) => state.items.length,
  },
};
