<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 8h12l-1 12H7L6 8z" />
    <path stroke-linecap="round" d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
</template>
