<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string; direction?: "left" | "right" }>(), {
  class: "",
  direction: "right",
});
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :class="[props.class, props.direction === 'left' ? 'rotate-180' : '']"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</template>
