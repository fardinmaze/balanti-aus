<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M14 3.5v11.25a3.75 3.75 0 1 1-3.75-3.75M14 3.5c0 2.5 2 4.5 4.5 4.5" />
  </svg>
</template>
