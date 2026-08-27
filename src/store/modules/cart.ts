import type { Module } from "vuex";
import type { Product } from "@/types/product";
import type { RootState } from "../types";

const STORAGE_KEY = "balanti-cart";

export type CartLine = {
  handle: string;
  size: string;
  qty: number;
  /** Backend Product row id for this exact size/variant — what checkout sends as cart_items[].item_id. */
  itemId: number;
  name: string;
  price: number;
  vat: number;
  colorway: string;
  tone: string;
  image?: string;
};

export type CartState = {
  lines: CartLine[];
  isOpen: boolean;
};

function loadInitialLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function initialState(): CartState {
  return { lines: loadInitialLines(), isOpen: false };
}

export const cart: Module<CartState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    upsertLine(state, line: CartLine) {
      const existing = state.lines.find((l) => l.handle === line.handle && l.size === line.size);
      if (existing) existing.qty += line.qty;
      else state.lines.push(line);
    },
    removeLine(state, { handle, size }: { handle: string; size: string }) {
      state.lines = state.lines.filter((l) => !(l.handle === handle && l.size === size));
    },
    setQty(state, { handle, size, qty }: { handle: string; size: string; qty: number }) {
      const line = state.lines.find((l) => l.handle === handle && l.size === size);
      if (line) line.qty = qty;
    },
    clear(state) {
      state.lines = [];
    },
    setOpen(state, isOpen: boolean) {
      state.isOpen = isOpen;
    },
  },
  actions: {
    addItem({ commit }, { product, sizeValue, qty = 1 }: { product: Product; sizeValue: string; qty?: number }) {
      const size = product.sizes.find((s) => s.value === sizeValue);
      if (!size) return;
      commit("upsertLine", {
        handle: product.handle,
        size: sizeValue,
        qty,
        itemId: size.productId,
        name: product.name,
        price: product.onSale && product.offerPrice != null ? product.offerPrice : product.price,
        vat: product.vat,
        colorway: product.colorway,
        tone: product.tone,
        image: product.image,
      } satisfies CartLine);
      commit("setOpen", true);
    },
    removeItem({ commit }, payload: { handle: string; size: string }) {
      commit("removeLine", payload);
    },
    updateQty({ commit, dispatch }, payload: { handle: string; size: string; qty: number }) {
      if (payload.qty <= 0) {
        dispatch("removeItem", payload);
        return;
      }
      commit("setQty", payload);
    },
    clear({ commit }) {
      commit("clear");
    },
    open({ commit }) {
      commit("setOpen", true);
    },
    close({ commit }) {
      commit("setOpen", false);
    },
  },
  getters: {
    lines: (state) => state.lines,
    isOpen: (state) => state.isOpen,
    count: (state) => state.lines.reduce((n, l) => n + l.qty, 0),
    subtotal: (state) => state.lines.reduce((sum, l) => sum + l.price * l.qty, 0),
  },
};

export { STORAGE_KEY as CART_STORAGE_KEY };
