<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.5 6.5L12 13l8.5-6.5" />
  </svg>
</template>
