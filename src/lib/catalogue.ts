import { computed } from "vue";
import { useStore } from "@/store";
import type { BackendCategory } from "@/api/types";
import type { FlatCategory } from "@/lib/category";
import type { Product } from "@/types/product";

/** Thin composable over the `catalogue` Vuex module. */
export function useCatalogue() {
  const store = useStore();

  return {
    products: computed(() => store.getters["catalogue/products"] as Product[]),
    featured: computed(() => store.getters["catalogue/featured"] as Product[]),
    onSale: computed(() => store.getters["catalogue/onSale"] as Product[]),
    categories: computed(() => store.getters["catalogue/categories"] as FlatCategory[]),
    topCategories: computed(() => store.getters["catalogue/topCategories"] as BackendCategory[]),
    loading: computed(() => store.state.catalogue.loading),
    loaded: computed(() => store.state.catalogue.loaded),
    error: computed(() => store.state.catalogue.error),
    getByHandle: (handle: string) => store.getters["catalogue/productByHandle"](handle) as Product | undefined,
    fetchProduct: (slug: string) => store.dispatch("catalogue/fetchProduct", slug) as Promise<Product | undefined>,
    fetchCategoryProducts: (categorySlug: string, count?: number, page?: number) =>
      store.dispatch("catalogue/fetchCategoryProducts", { slug: categorySlug, count, page }) as Promise<{
        products: Product[];
        hasMore: boolean;
      }>,
    fetchParentCategoryProducts: (categorySlug: string, count?: number, page?: number) =>
      store.dispatch("catalogue/fetchParentCategoryProducts", { slug: categorySlug, count, page }) as Promise<{
        products: Product[];
        hasMore: boolean;
      }>,
    search: (keyword: string) => store.dispatch("catalogue/search", keyword) as Promise<Product[]>,
  };
}
