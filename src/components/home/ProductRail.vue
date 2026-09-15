<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import ProductRailSkeleton from "@/components/home/ProductRailSkeleton.vue";

const catalogue = useCatalogue();
</script>

<template>
  <ProductRailSkeleton v-if="catalogue.loading.value && !catalogue.featured.value.length" heading="Featured Products" />
  <ProductScrollRail
    v-else-if="catalogue.featured.value.length"
    heading="Featured Products"
    :items="catalogue.featured.value"
    view-all-href="/catalogue"
  />
</template>
