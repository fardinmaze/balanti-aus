<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "@/types/product";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";

const props = defineProps<{ product: Product }>();

/** Category → subcategory trail, each linking to the catalogue filtered on its slug (same query shape as CatalogueView). */
const crumbs = computed(() => {
  const items: { label: string; to: string }[] = [];
  if (props.product.category) items.push({ label: props.product.category.name, to: `/catalogue?category=${props.product.category.slug}` });
  if (props.product.subcategory) items.push({ label: props.product.subcategory.name, to: `/catalogue?category=${props.product.subcategory.slug}` });
  return items;
});
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-muted sm:text-sm">
    <RouterLink to="/" class="hover:text-ink">Home</RouterLink>
    <template v-for="crumb in crumbs" :key="crumb.to">
      <ChevronIcon class="h-3 w-3 shrink-0" />
      <RouterLink :to="crumb.to" class="hover:text-ink">{{ crumb.label }}</RouterLink>
    </template>
    <ChevronIcon class="h-3 w-3 shrink-0" />
    <span class="truncate text-ink" aria-current="page">{{ product.name }}</span>
  </nav>
</template>
