<script setup lang="ts">
import { ref } from "vue";
import type { Product } from "@/lib/products";
import PlaceholderImage, { type Angle } from "@/components/ui/PlaceholderImage.vue";

defineProps<{ product: Product }>();

const ANGLES: Angle[] = ["front", "side", "sole", "worn"];
const active = ref<Angle>("front");
</script>

<template>
  <div class="flex flex-col gap-3">
    <PlaceholderImage :tone="product.tone" :label="product.name" :angle="active" class="aspect-[4/5] w-full rounded-lg" />
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="angle in ANGLES"
        :key="angle"
        type="button"
        :aria-pressed="active === angle"
        :aria-label="`Show ${angle} view`"
        class="aspect-square overflow-hidden rounded-md border transition-opacity"
        :class="active === angle ? 'border-ink' : 'border-line opacity-70 hover:opacity-100'"
        @click="active = angle"
      >
        <PlaceholderImage :tone="product.tone" :label="product.name" :angle="angle" class="h-full w-full" />
      </button>
    </div>
  </div>
</template>
