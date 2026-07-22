<script setup lang="ts">
const props = withDefaults(defineProps<{ class?: string; filled?: boolean }>(), {
  class: "",
  filled: false,
});
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :class="props.class"
    :fill="props.filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      stroke-linejoin="round"
      d="M12 20.5s-7.5-4.6-10-9.3C.4 8 1.8 4.5 5.2 3.6c2-.5 4 .3 5.3 2 .5.6.9 1.2 1.5 1.9.6-.7 1-1.3 1.5-1.9 1.3-1.7 3.3-2.5 5.3-2 3.4.9 4.8 4.4 3.2 7.6-2.5 4.7-10 9.3-10 9.3z"
    />
  </svg>
</template>
