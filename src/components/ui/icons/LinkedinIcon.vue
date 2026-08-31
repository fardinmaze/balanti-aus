<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path stroke-linecap="round" d="M7.5 10.5v6M7.5 7.8v.01" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.5 16.5v-3.5a2.2 2.2 0 0 1 4.4 0v3.5M11.5 10.5v6" />
  </svg>
</template>
