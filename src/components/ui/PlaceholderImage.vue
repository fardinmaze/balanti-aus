<script setup lang="ts">
import { computed } from "vue";

/**
 * Stand-in for real product photography, which hasn't been shot yet
 * (see WORKPLAN.md Phase 1). Renders an art-directed leather-tone swatch
 * with a generic shoe silhouette instead of a broken image or fake stock
 * photo, so nothing here reads as a real product shot. Swap for real
 * photography via next/image-equivalent (<img> + real assets) once
 * photography lands — components consuming this only need their prop
 * swapped, not restructured.
 */

const ANGLE_LABELS = {
  front: "Front",
  side: "Side profile",
  sole: "Sole detail",
  worn: "On-foot",
} as const;

export type Angle = keyof typeof ANGLE_LABELS;

const props = withDefaults(
  defineProps<{
    tone: string;
    label: string;
    angle?: Angle;
    class?: string;
  }>(),
  { angle: "front", class: "" }
);

function seedFromString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const seed = computed(() => seedFromString(`${props.tone}-${props.angle}-${props.label}`));
const baseFrequency = computed(() => (0.6 + (seed.value % 40) / 100).toFixed(2));
const filterId = computed(() => `grain-${props.tone.replace("#", "")}-${props.angle}`);
const angleLabel = computed(() => ANGLE_LABELS[props.angle]);
</script>

<template>
  <div
    role="img"
    :aria-label="`${label} — ${angleLabel} photography coming soon`"
    class="relative flex items-end justify-center overflow-hidden"
    :class="props.class"
    :style="{ backgroundColor: tone }"
  >
    <svg class="absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
      <filter :id="filterId">
        <feTurbulence
          type="fractalNoise"
          :baseFrequency="baseFrequency"
          numOctaves="2"
          stitchTiles="stitch"
          :seed="seed % 10"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" :filter="`url(#${filterId})`" />
    </svg>

    <svg
      viewBox="0 0 120 60"
      class="relative w-2/3 max-w-[220px] opacity-30"
      aria-hidden="true"
      fill="none"
      stroke="white"
      stroke-width="2"
    >
      <path
        d="M8 44c0-10 10-16 22-20 14-5 24-14 34-14 10 0 8 8 16 10 10 2.5 20 2 28 8 6 4.5 4 12-2 14-10 3.5-70 6-98 6-4 0-6-1.5-6-4z"
      />
    </svg>

    <span
      class="eyebrow relative mb-3 rounded-pill bg-black/30 px-3 py-1 text-white/80 backdrop-blur-sm"
      aria-hidden="true"
    >
      {{ angleLabel }} · Photo coming soon
    </span>
  </div>
</template>
