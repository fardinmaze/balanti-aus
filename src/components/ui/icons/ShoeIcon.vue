<script setup lang="ts">
withDefaults(defineProps<{ class?: string }>(), { class: "" });
</script>

<template>
  <svg viewBox="0 0 24 24" :class="$props.class" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 7v10h18v-1.5a3 3 0 0 0-2.4-2.9l-4.1-.8L11 8.5V7z" />
    <path d="M3 14h18" />
    <path d="M11.5 10.5l1.5-1M13.2 11.9l1.5-1" />
  </svg>
</template>
