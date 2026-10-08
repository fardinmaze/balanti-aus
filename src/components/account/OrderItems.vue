<script setup lang="ts">
import { computed, ref } from "vue";
import type { OrderedItem } from "@/api/types";
import ShoeIcon from "@/components/ui/icons/ShoeIcon.vue";

const props = defineProps<{ items: OrderedItem[] }>();

const STACK_MAX = 3;

const expanded = ref(false);
const extra = computed(() => props.items.length - 1);
const count = computed(() => props.items.reduce((n, item) => n + Number(item.quantity || 0), 0));

function thumbOf(item: OrderedItem) {
  return item.thumbnail || item.image || null;
}

/** Collapsed preview: distinct product photos (two sizes of one shoe share a photo). */
const stack = computed(() => {
  const seen = new Set<string>();
  const thumbs: { key: string; src: string | null; alt: string }[] = [];
  for (const item of props.items) {
    const src = thumbOf(item);
    const key = src ?? `item-${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    thumbs.push({ key, src, alt: item.item_name });
  }
  return thumbs;
});

function qty(item: OrderedItem) {
  const q = Number(item.quantity);
  return Number.isInteger(q) ? q : q.toFixed(2);
}
</script>

<template>
  <div v-if="items.length" class="min-w-0">
    <ul v-if="expanded" class="space-y-1.5">
      <li v-for="item in items" :key="item.id" class="flex items-center gap-2">
        <span class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-line bg-paper text-muted">
          <img
            v-if="thumbOf(item)"
            :src="thumbOf(item)!"
            :alt="item.item_name"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
          <ShoeIcon v-else class="size-4" />
        </span>
        <span class="min-w-0 truncate">{{ item.item_name }}</span>
        <span class="shrink-0 text-xs text-muted">×{{ qty(item) }}</span>
      </li>
    </ul>

    <div v-else class="flex items-center gap-2.5">
      <div class="flex shrink-0 -space-x-3" aria-hidden="true">
        <span
          v-for="(thumb, i) in stack.slice(0, STACK_MAX)"
          :key="thumb.key"
          class="relative flex size-10 items-center justify-center overflow-hidden rounded-md border border-line bg-paper text-muted ring-2 ring-surface"
          :style="{ zIndex: STACK_MAX - i }"
        >
          <img v-if="thumb.src" :src="thumb.src" alt="" loading="lazy" decoding="async" class="h-full w-full object-cover" />
          <ShoeIcon v-else class="size-5" />
        </span>
      </div>
      <p class="flex min-w-0 items-baseline gap-1.5">
        <span class="truncate">{{ items[0].item_name }}</span>
        <span v-if="items.length === 1 && Number(items[0].quantity) !== 1" class="shrink-0 text-xs text-muted">
          ×{{ qty(items[0]) }}
        </span>
      </p>
    </div>

    <p class="mt-1 flex items-center gap-2 text-xs text-muted">
      <span>{{ count }} {{ count === 1 ? "item" : "items" }}</span>
      <button
        v-if="extra > 0"
        type="button"
        class="font-semibold text-ink underline-offset-2 hover:underline"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? "Show less" : `+${extra} more` }}
      </button>
    </p>
  </div>
  <span v-else class="text-muted">—</span>
</template>
