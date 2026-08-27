<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";

const catalogue = useCatalogue();
</script>

<template>
  <ProductScrollRail
    v-if="catalogue.featured.value.length"
    heading="Featured Products"
    :items="catalogue.featured.value"
    view-all-href="/catalogue"
  />
</template>
