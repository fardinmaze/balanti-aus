<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ min: number; max: number; modelMin: number; modelMax: number }>();
const emit = defineEmits<{
  "update:modelMin": [number];
  "update:modelMax": [number];
  commit: [];
}>();

const fillLeft = computed(() => ((props.modelMin - props.min) / (props.max - props.min)) * 100);
const fillRight = computed(() => 100 - ((props.modelMax - props.min) / (props.max - props.min)) * 100);

function onMinInput(e: Event) {
  const value = Math.min(Number((e.target as HTMLInputElement).value), props.modelMax);
  emit("update:modelMin", value);
}
function onMaxInput(e: Event) {
  const value = Math.max(Number((e.target as HTMLInputElement).value), props.modelMin);
  emit("update:modelMax", value);
}
</script>

<template>
  <div class="balanti-price-slider">
    <div class="flex items-center justify-between text-sm">
      <span>${{ modelMin }}</span>
      <span>${{ modelMax }}</span>
    </div>
    <div class="relative mt-3 h-4">
      <div class="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-pill bg-line" />
      <div
        class="absolute top-1/2 h-1 -translate-y-1/2 rounded-pill bg-ink"
        :style="{ left: `${fillLeft}%`, right: `${fillRight}%` }"
      />
      <input
        type="range"
        :min="min"
        :max="max"
        :value="modelMin"
        class="thumb-input"
        aria-label="Minimum price"
        @input="onMinInput"
        @change="emit('commit')"
      />
      <input
        type="range"
        :min="min"
        :max="max"
        :value="modelMax"
        class="thumb-input"
        aria-label="Maximum price"
        @input="onMaxInput"
        @change="emit('commit')"
      />
    </div>
  </div>
</template>

<style>
.balanti-price-slider .thumb-input {
  position: absolute;
  inset-inline: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
}
.balanti-price-slider .thumb-input::-webkit-slider-thumb {
  pointer-events: auto;
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--ink);
  border: 2px solid var(--paper);
  box-shadow: 0 0 0 1px var(--ink);
  cursor: pointer;
}
.balanti-price-slider .thumb-input::-moz-range-thumb {
  pointer-events: auto;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--ink);
  border: 2px solid var(--paper);
  box-shadow: 0 0 0 1px var(--ink);
  cursor: pointer;
}
.balanti-price-slider .thumb-input::-webkit-slider-runnable-track {
  background: transparent;
}
.balanti-price-slider .thumb-input::-moz-range-track {
  background: transparent;
}
</style>
