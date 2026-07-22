<script setup lang="ts">
/**
 * Self-authored placeholder glyphs — svgrepo.com couldn't be reached
 * (rate-limited/blocked in this environment) to pull real icon assets.
 * Same simple stroke style as HeartIcon/CartIcon/ChevronIcon. Swap the
 * path data below for real svgrepo exports whenever convenient; the
 * `name` prop contract won't need to change.
 */
export type CategoryIconName =
  | "boots"
  | "loafers"
  | "sneakers"
  | "sandals"
  | "socks"
  | "laces"
  | "mens-bag"
  | "womens-handbag";

const ICON_PATHS: Record<CategoryIconName, string[]> = {
  boots: ["M7 3h6v7c2 .5 5 2 5 5.5 0 2-1.5 3.5-4 3.5H6a2 2 0 0 1-2-2V9c0-2 1-4 3-4z"],
  loafers: [
    "M3 16c0-2.5 2.5-4.5 7-5.5s7-3 9-3c1.7 0 1.3 1.7 2.7 2 1.7.6 2.3 1.7 2.3 3 0 1.5-1 2.5-3 2.5H5c-1 0-2-.7-2-2z",
  ],
  sneakers: [
    "M3 16c0-2.5 2.5-4.5 7-5.5s7-3 9-3c1.7 0 1.3 1.7 2.7 2 1.7.6 2.3 1.7 2.3 3 0 1.5-1 2.5-3 2.5H5c-1 0-2-.7-2-2z",
    "M4 15.5h16",
  ],
  sandals: ["M4 15c0-2 2-3 8-3s8 1 8 3-2 3-8 3-8-1-8-3z", "M8 12l4-4 4 4"],
  socks: ["M9 3h5v8c3 0 6 2 6 5.5 0 1.9-1.6 3.5-3.5 3.5H10a2 2 0 0 1-2-2V5c0-1.1.9-2 1-2z"],
  laces: ["M12 12l-7-4v8l7-4z", "M12 12l7-4v8l-7-4z"],
  "mens-bag": ["M4 9h16v10H4z", "M9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"],
  "womens-handbag": ["M4 10h16v10H4z", "M8 10V8a4 4 0 0 1 8 0v2"],
};

const props = withDefaults(defineProps<{ name: CategoryIconName; class?: string }>(), { class: "" });
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :class="props.class"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in ICON_PATHS[props.name]" :key="i" :d="d" />
  </svg>
</template>
