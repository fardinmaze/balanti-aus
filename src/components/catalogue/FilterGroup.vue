<script setup lang="ts">
import { ref } from "vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";

const props = withDefaults(defineProps<{ heading: string; count?: number; defaultOpen?: boolean }>(), {
  count: 0,
  defaultOpen: true,
});
const open = ref(props.defaultOpen);
</script>

<template>
  <div class="border-b border-line py-5 first:pt-0">
    <button
      type="button"
      class="flex w-full items-center justify-between text-left"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="text-sm font-semibold">
        {{ heading }}<template v-if="count"> ({{ count }})</template>
      </span>
      <ChevronIcon class="h-4 w-4 shrink-0 transition-transform" :class="open ? '-rotate-90' : 'rotate-90'" />
    </button>
    <div v-show="open" class="mt-4 space-y-3">
      <slot />
    </div>
  </div>
</template>
