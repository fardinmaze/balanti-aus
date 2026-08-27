import type { Module } from "vuex";
import { catalogueApi } from "@/api/catalogue";
import type { BackendCategory } from "@/api/types";
import { adaptProduct, adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import type { RootState } from "../types";

export type CatalogueState = {
  categories: BackendCategory[];
  topCategories: BackendCategory[];
  products: Product[];
  featured: Product[];
  hot: Product[];
  onSale: Product[];
  byHandle: Record<string, Product>;
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
    loaded: false,
    loading: false,
    error: null,
  };
}

export const catalogue: Module<CatalogueState, RootState> = {
  namespaced: true,
  state: initialState,
  mutations: {
    setCategories(state, categories: BackendCategory[]) {
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
        commit("setCategories", categories);
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

    async fetchProduct({ commit, state }, slug: string): Promise<Product | undefined> {
      const cached = state.byHandle[slug];
      if (cached) return cached;
      const backend = await catalogueApi.product(slug);
      if (!backend) return undefined;
      const product = adaptProduct(backend);
      commit("upsertProduct", product);
      return product;
    },

    /** Products filed directly under this exact category (guide §5.1). */
    async fetchCategoryProducts({ commit }, categorySlug: string): Promise<Product[]> {
      const backend = await catalogueApi.categoryProducts(categorySlug);
      const products = adaptProducts(backend);
      for (const p of products) commit("upsertProduct", p);
      return products;
    },

    /** Products under this category and all of its subcategories — use for top-level category landing pages. */
    async fetchParentCategoryProducts({ commit }, categorySlug: string): Promise<Product[]> {
      const backend = await catalogueApi.parentCategoryProducts(categorySlug);
      const products = adaptProducts(backend);
      for (const p of products) commit("upsertProduct", p);
      return products;
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
