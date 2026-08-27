<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ amount: number; compareAtAmount?: number; class?: string }>(), { class: "" });

function format(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const formatted = computed(() => format(props.amount));
const compareAtFormatted = computed(() => (props.compareAtAmount != null ? format(props.compareAtAmount) : null));
</script>

<template>
  <span class="price" :class="props.class">
    <span v-if="compareAtFormatted" class="mr-2 text-[0.85em] text-muted line-through">{{ compareAtFormatted }}</span>
    <span :class="compareAtFormatted ? 'text-sale' : ''">{{ formatted }}</span>
    <span class="text-[0.7em] text-muted">AUD</span>
  </span>
</template>
