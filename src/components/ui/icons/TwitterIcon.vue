<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15M19.5 4.5l-15 15" />
  </svg>
</template>
