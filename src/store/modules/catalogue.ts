import type { Module } from "vuex";
import { catalogueApi } from "@/api/catalogue";
import type { BackendCategory } from "@/api/types";
import { adaptProduct, adaptProducts } from "@/lib/productAdapter";
import { flattenCategories, type FlatCategory } from "@/lib/category";
import type { Product } from "@/types/product";
import type { RootState } from "../types";

export type CatalogueState = {
  /** Flattened (top-level + subcategories) — see src/lib/category.ts. */
  categories: FlatCategory[];
  topCategories: BackendCategory[];
  products: Product[];
  featured: Product[];
  hot: Product[];
  onSale: Product[];
  byHandle: Record<string, Product>;
  /** Handles whose `byHandle` entry came from the full detail endpoint (guide §5.4), not just a list rail — the
   *  list serializer omits per-color photos and the general `images` array, so a list-sourced entry isn't enough
   *  to render the product page's gallery. */
  detailLoadedHandles: Record<string, true>;
  loaded: boolean;
  loading: boolean;
  error: string | null;
};

function initialState(): CatalogueState {
  return {
    categories: [],
    topCategories: [],
    products: [],
    featured: [],
    hot: [],
    onSale: [],
    byHandle: {},
    detailLoadedHandles: {},
    loaded: false,
    loading: false,
    error: null,
  };
}

export const catalogue: Module<CatalogueState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setCategories(state, categories: FlatCategory[]) {
      state.categories = categories;
    },
    setTopCategories(state, topCategories: BackendCategory[]) {
      state.topCategories = topCategories;
    },
    setProducts(state, products: Product[]) {
      state.products = products;
      for (const p of products) state.byHandle[p.handle] = p;
    },
    setFeatured(state, products: Product[]) {
      state.featured = products;
      for (const p of products) state.byHandle[p.handle] = p;
    },
    setHot(state, products: Product[]) {
      state.hot = products;
      for (const p of products) state.byHandle[p.handle] = p;
    },
    setOnSale(state, products: Product[]) {
      state.onSale = products;
      for (const p of products) state.byHandle[p.handle] = p;
    },
    upsertProduct(state, product: Product) {
      state.byHandle[product.handle] = product;
    },
    markDetailLoaded(state, handle: string) {
      state.detailLoadedHandles[handle] = true;
    },
    setLoading(state, loading: boolean) {
      state.loading = loading;
    },
    setLoaded(state, loaded: boolean) {
      state.loaded = loaded;
    },
    setError(state, error: string | null) {
      state.error = error;
    },
  },
  actions: {
    /** Fetches everything the homepage/catalogue rails need, once. */
    async fetchInitial({ commit, state }) {
      if (state.loaded || state.loading) return;
      commit("setLoading", true);
      commit("setError", null);
      try {
        const [categories, topCategories, products, featured, onSale] = await Promise.all([
          catalogueApi.allCategories(),
          catalogueApi.topCategories(),
          catalogueApi.products(100),
          catalogueApi.featuredProducts(20),
          catalogueApi.onSaleProducts(20),
        ]);
        commit("setCategories", flattenCategories(categories));
        commit("setTopCategories", topCategories);
        commit("setProducts", adaptProducts(products.results));
        commit("setFeatured", adaptProducts(featured.results));
        commit("setOnSale", adaptProducts(onSale.results));
        commit("setLoaded", true);
      } catch (e) {
        commit("setError", e instanceof Error ? e.message : "Failed to load the catalogue.");
      } finally {
        commit("setLoading", false);
      }
    },

    /** Always hits the detail endpoint unless this exact handle already came from it —
     *  a list-rail copy in `byHandle` (from fetchInitial/search/category rails) isn't
     *  enough: it's missing per-color photos and the general `images` array. */
    async fetchProduct({ commit, state }, slug: string): Promise<Product | undefined> {
      if (state.detailLoadedHandles[slug]) return state.byHandle[slug];
      const backend = await catalogueApi.product(slug);
      if (!backend) return undefined;
      const product = adaptProduct(backend);
      commit("upsertProduct", product);
      commit("markDetailLoaded", slug);
      return product;
    },

    /** Products filed directly under this exact category (guide §5.1). Paginated 20 at a time, same as the other list endpoints — `count` is required or the backend 400s. */
    async fetchCategoryProducts(
      { commit },
      payload: { slug: string; count?: number; page?: number }
    ): Promise<{ products: Product[]; hasMore: boolean }> {
      const { slug, count = 20, page = 1 } = payload;
      const result = await catalogueApi.categoryProducts(slug, count, page);
      const products = adaptProducts(result.results);
      for (const p of products) commit("upsertProduct", p);
      return { products, hasMore: result.next !== null };
    },

    /** Products under this category and all of its subcategories — use for top-level category landing pages. */
    async fetchParentCategoryProducts(
      { commit },
      payload: { slug: string; count?: number; page?: number }
    ): Promise<{ products: Product[]; hasMore: boolean }> {
      const { slug, count = 20, page = 1 } = payload;
      const result = await catalogueApi.parentCategoryProducts(slug, count, page);
      const products = adaptProducts(result.results);
      for (const p of products) commit("upsertProduct", p);
      return { products, hasMore: result.next !== null };
    },

    async search({ commit }, keyword: string): Promise<Product[]> {
      const result = await catalogueApi.search(keyword);
      const products = adaptProducts(result.results);
      for (const p of products) commit("upsertProduct", p);
      return products;
    },
  },
  getters: {
    products: (state) => state.products,
    featured: (state) => state.featured,
    onSale: (state) => state.onSale,
    categories: (state) => state.categories,
    topCategories: (state) => state.topCategories,
    productByHandle: (state) => (handle: string) => state.byHandle[handle],
  },
};
