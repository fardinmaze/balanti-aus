<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import ProductRailSkeleton from "@/components/home/ProductRailSkeleton.vue";

const catalogue = useCatalogue();
</script>

<template>
  <ProductRailSkeleton v-if="catalogue.loading.value && !catalogue.onSale.value.length" heading="Super Sale" />
  <ProductScrollRail v-else-if="catalogue.onSale.value.length" heading="Super Sale" :items="catalogue.onSale.value" view-all-href="/catalogue" />
</template>
