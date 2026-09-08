<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";

const catalogue = useCatalogue();
</script>

<template>
  <ProductScrollRail v-if="catalogue.onSale.value.length" heading="Super Sale" :items="catalogue.onSale.value" view-all-href="/catalogue" />
</template>
