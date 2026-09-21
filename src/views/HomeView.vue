<script setup lang="ts">
import Hero from "@/components/home/Hero.vue";
import ExploreProducts from "@/components/home/ExploreProducts.vue";
import FeaturedAndNew from "@/components/home/FeaturedAndNew.vue";
import ShopByCategory from "@/components/home/ShopByCategory.vue";
import TrendingRail from "@/components/home/TrendingRail.vue";
import PopularGrid from "@/components/home/PopularGrid.vue";
import AboutBalanti from "@/components/home/AboutBalanti.vue";
</script>

<template>
  <Hero />
  <ExploreProducts class="!pt-16 !pb-16 sm:!pt-28 sm:!pb-28" />
  <FeaturedAndNew class="!pt-0 !pb-16 sm:!pb-20" />
  <ShopByCategory class="!pt-0 !pb-0" />
  <TrendingRail class="!pt-20 sm:!pt-28 !pb-16 sm:!pb-28" />
  <PopularGrid class="!pt-20 sm:!pt-28 !pb-20 sm:!pb-28" />
  <AboutBalanti />
</template>
