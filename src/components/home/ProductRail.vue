<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import Spinner from "@/components/ui/Spinner.vue";

const catalogue = useCatalogue();
</script>

<template>
  <Spinner v-if="catalogue.loading.value && !catalogue.featured.value.length" label="Loading featured products…" />
  <ProductScrollRail
    v-else-if="catalogue.featured.value.length"
    heading="Featured Products"
    :items="catalogue.featured.value"
    view-all-href="/catalogue"
  />
</template>
