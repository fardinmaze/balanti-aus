<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{ amount: number; class?: string }>(), { class: "" });

const formatted = computed(() =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(props.amount)
);
</script>

<template>
  <span class="price" :class="props.class">
    {{ formatted }} <span class="text-[0.7em] text-muted">AUD</span>
  </span>
</template>
