<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: "Loading" });
</script>

<template>
  <div class="flex items-center justify-center gap-3 py-10" role="status" :aria-label="label">
    <span class="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-line border-t-ink" aria-hidden="true" />
    <span class="text-sm text-muted">{{ label }}</span>
  </div>
</template>
