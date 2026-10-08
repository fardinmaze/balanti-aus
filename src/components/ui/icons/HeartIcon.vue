<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    class?: string;
    filled?: boolean;
    /** Fill with the surrounding text color instead of the wishlist red — e.g. the
     *  header icon, which must follow the nav's white-over-hero / ink states. */
    inheritColor?: boolean;
  }>(),
  { class: "", filled: false, inheritColor: false }
);
const fillColor = () => (props.inheritColor ? "currentColor" : "var(--wishlist)");
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    :class="props.class"
    :fill="props.filled ? fillColor() : 'none'"
    :stroke="props.filled ? fillColor() : 'currentColor'"
    class="transition-[fill,stroke] duration-[var(--dur-mid)] ease-[var(--ease)]"
    stroke-width="2"
    aria-hidden="true"
  >
    <path
      stroke-linejoin="round"
      d="M12 20.5s-7.5-4.6-10-9.3C.4 8 1.8 4.5 5.2 3.6c2-.5 4 .3 5.3 2 .5.6.9 1.2 1.5 1.9.6-.7 1-1.3 1.5-1.9 1.3-1.7 3.3-2.5 5.3-2 3.4.9 4.8 4.4 3.2 7.6-2.5 4.7-10 9.3-10 9.3z"
    />
  </svg>
</template>
