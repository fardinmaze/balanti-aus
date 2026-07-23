<script setup lang="ts">
import { computed } from "vue";
import { products } from "@/lib/products";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";

const MAX_CARDS = 10;
const newArrivals = computed(() => products.filter((product) => product.badge === "New").slice(0, MAX_CARDS));
</script>

<template>
  <ProductScrollRail heading="New Arrivals" :items="newArrivals" view-all-href="/catalogue?sort=newest" />
</template>
