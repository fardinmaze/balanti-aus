<script setup lang="ts">
import { products } from "@/lib/products";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
</script>

<template>
  <ProductScrollRail heading="Trending Now" :items="products" />
</template>
