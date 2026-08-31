<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="props.class" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 4h-2a4 4 0 0 0-4 4v3H6v3h3v7h3v-7h3l1-3h-4V8a1 1 0 0 1 1-1h3V4z"
    />
  </svg>
</template>
