<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { catalogueApi } from "@/api/catalogue";
import { adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard.vue";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton.vue";

const popular = ref<Product[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { results } = await catalogueApi.mostPopularProducts(10);
    popular.value = adaptProducts(results);
  } finally {
    loading.value = false;
  }
});

const items = computed(() => popular.value.slice(0, 10));
</script>

<template>
  <section v-if="loading || items.length" class="bg-line/30">
    <div class="container">
      <p class="eyebrow mb-1">Customer Favorites</p>
      <h2>Most Popular</h2>

      <div v-if="loading" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <ProductCardSkeleton v-for="i in 10" :key="i" />
      </div>
      <div v-else class="mt-8 grid grid-cols-2 items-start gap-2 sm:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <ProductCard v-for="product in items" :key="product.handle" :product="product" />
      </div>
    </div>
  </section>
</template>
