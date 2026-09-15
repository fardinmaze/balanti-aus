<script setup lang="ts">
import { onMounted, ref } from "vue";
import { catalogueApi } from "@/api/catalogue";
import { adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import ProductRailSkeleton from "@/components/home/ProductRailSkeleton.vue";

const newArrivals = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const { results } = await catalogueApi.products(20);
    newArrivals.value = adaptProducts(results);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load new arrivals.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <ProductRailSkeleton v-if="loading" heading="New Arrivals" />
  <ProductScrollRail v-else-if="newArrivals.length" heading="New Arrivals" :items="newArrivals" view-all-href="/catalogue?sort=newest" />
</template>
