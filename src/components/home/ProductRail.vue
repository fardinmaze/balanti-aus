<script setup lang="ts">
import { ref, computed } from "vue";
import { products, type Gender } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";

const activeTab = ref<Gender>("women");
const filtered = computed(() => products.filter((product) => product.gender === activeTab.value));
</script>

<template>
  <section>
    <div class="container text-center">
      <h2>Most Popular Shoes</h2>

      <div class="mt-2 inline-flex gap-1 rounded-pill border border-line p-1" role="tablist" aria-label="Shop by">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'women'"
          class="min-h-[var(--tap-min)] rounded-pill px-8 text-sm font-medium transition-colors"
          :class="activeTab === 'women' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
          @click="activeTab = 'women'"
        >
          Women
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'men'"
          class="min-h-[var(--tap-min)] rounded-pill px-8 text-sm font-medium transition-colors"
          :class="activeTab === 'men' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
          @click="activeTab = 'men'"
        >
          Men
        </button>
      </div>

      <div class="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 text-left sm:grid-cols-3 sm:gap-x-8">
        <ProductCard v-for="product in filtered" :key="`${activeTab}-${product.handle}`" :product="product" />
      </div>
    </div>
  </section>
</template>
