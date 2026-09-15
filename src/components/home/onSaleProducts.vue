<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import Spinner from "@/components/ui/Spinner.vue";

const catalogue = useCatalogue();
</script>

<template>
  <Spinner v-if="catalogue.loading.value && !catalogue.onSale.value.length" label="Loading super sale…" />
  <ProductScrollRail v-else-if="catalogue.onSale.value.length" heading="Super Sale" :items="catalogue.onSale.value" view-all-href="/catalogue" />
</template>
