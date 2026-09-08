<script setup lang="ts">
import Hero from "@/components/home/Hero.vue";
import ProductRail from "@/components/home/ProductRail.vue";
import NewArrivals from "@/components/home/NewArrivals.vue";
import ShopByCategory from "@/components/home/ShopByCategory.vue";
import TrendingNow from "@/components/home/TrendingNow.vue";
import ShopByType from "@/components/home/ShopByType.vue";
</script>

<template>
  <Hero />
  <ProductRail />
  <NewArrivals class="!pt-0" />
  <ShopByCategory class="!pt-0" />
  <TrendingNow class="!pt-0" />
  <!-- <ShopByType /> -->
</template>
