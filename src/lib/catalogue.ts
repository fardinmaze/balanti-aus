import { computed } from "vue";
import { useStore } from "@/store";
import type { BackendCategory } from "@/api/types";
import type { Product } from "@/types/product";

/** Thin composable over the `catalogue` Vuex module. */
export function useCatalogue() {
  const store = useStore();

  return {
    products: computed(() => store.getters["catalogue/products"] as Product[]),
    featured: computed(() => store.getters["catalogue/featured"] as Product[]),
    onSale: computed(() => store.getters["catalogue/onSale"] as Product[]),
    categories: computed(() => store.getters["catalogue/categories"] as BackendCategory[]),
    topCategories: computed(() => store.getters["catalogue/topCategories"] as BackendCategory[]),
    loading: computed(() => store.state.catalogue.loading),
    loaded: computed(() => store.state.catalogue.loaded),
    error: computed(() => store.state.catalogue.error),
    getByHandle: (handle: string) => store.getters["catalogue/productByHandle"](handle) as Product | undefined,
    fetchProduct: (slug: string) => store.dispatch("catalogue/fetchProduct", slug) as Promise<Product | undefined>,
    fetchCategoryProducts: (categorySlug: string) =>
      store.dispatch("catalogue/fetchCategoryProducts", categorySlug) as Promise<Product[]>,
    fetchParentCategoryProducts: (categorySlug: string) =>
      store.dispatch("catalogue/fetchParentCategoryProducts", categorySlug) as Promise<Product[]>,
    search: (keyword: string) => store.dispatch("catalogue/search", keyword) as Promise<Product[]>,
  };
}
