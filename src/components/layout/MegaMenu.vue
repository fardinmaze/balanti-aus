<script setup lang="ts">
import type { MegaMenuColumn } from "@/content/nav";

defineProps<{ columns: MegaMenuColumn[] }>();
const emit = defineEmits<{ navigate: [] }>();
</script>

<template>
  <div class="border-t border-line bg-paper shadow-[var(--shadow-card)]">
    <div class="container flex flex-wrap gap-x-12 gap-y-8 py-10">
      <div v-for="column in columns" :key="column.heading" class="min-w-[9rem]">
        <h3 class="font-display text-sm font-semibold">{{ column.heading }}</h3>
        <ul class="mt-4 space-y-3">
          <li v-for="link in column.links" :key="link.href">
            <RouterLink
              :to="link.href"
              class="text-sm text-muted transition-colors hover:text-ink"
              @click="emit('navigate')"
            >
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
