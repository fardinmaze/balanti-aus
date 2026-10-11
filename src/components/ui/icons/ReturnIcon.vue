<script setup lang="ts">
withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="$props.class" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M20 7.5H5" />
    <path d="M8.5 4 5 7.5 8.5 11" />
    <path d="M4 16.5h15" />
    <path d="M15.5 13l3.5 3.5-3.5 3.5" />
  </svg>
</template>
