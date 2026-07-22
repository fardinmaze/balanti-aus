<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

type Variant = "primary" | "ghost";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    to?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    class?: string;
  }>(),
  { variant: "primary", type: "button", disabled: false, class: "" }
);

const base =
  "inline-flex min-h-[var(--tap-min)] items-center justify-center rounded-pill px-6 font-semibold transition-[transform,background,opacity] duration-[var(--dur-fast)] ease-[var(--ease)] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-contrast hover:opacity-90",
  ghost: "border border-ink text-ink bg-transparent hover:opacity-70",
};

const classes = computed(() => `${base} ${variants[props.variant]} ${props.class}`);
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
