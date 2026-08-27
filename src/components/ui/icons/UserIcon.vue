<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path stroke-linecap="round" d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </svg>
</template>
