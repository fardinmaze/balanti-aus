<script setup lang="ts">
import type { Product } from "@/types/product";

const props = defineProps<{ product: Product }>();
</script>

<template>
  <ul v-if="product.attributeItems.length" class="mt-2 flex flex-col gap-4">
    <li v-for="item in product.attributeItems" :key="item.title" class="flex items-center gap-3">
      <img :src="item.image" :alt="item.title" class="h-14 w-14 shrink-0 rounded-md border border-line object-cover" />
      <p class="text-sm leading-6">{{ item.title }}</p>
    </li>
  </ul>
</template>
