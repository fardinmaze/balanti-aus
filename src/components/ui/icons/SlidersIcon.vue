<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :class="props.class"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h13M21 18h-1" />
    <circle cx="16" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="18" r="2" fill="currentColor" stroke="none" />
  </svg>
</template>
