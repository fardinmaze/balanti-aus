<script setup lang="ts">
import { computed } from "vue";
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";

const MAX_CARDS = 10;
const catalogue = useCatalogue();
const newArrivals = computed(() => catalogue.products.value.filter((product) => product.badge === "New").slice(0, MAX_CARDS));
</script>

<template>
  <ProductScrollRail v-if="newArrivals.length" heading="New Arrivals" :items="newArrivals" view-all-href="/catalogue?sort=newest" />
</template>
