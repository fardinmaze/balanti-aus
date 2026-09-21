<script setup lang="ts">
import { ref } from "vue";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";

withDefaults(
  defineProps<{
    heading: string;
    mobileHeading?: string;
    items: Product[];
    viewAllHref?: string;
    viewAllLabel?: string;
  }>(),
  { viewAllLabel: "Show All" }
);

const trackRef = ref<HTMLDivElement | null>(null);

function scrollByAmount(direction: 1 | -1) {
  const el = trackRef.value;
  if (!el) return;
  const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth ?? 320;
  el.scrollBy({ left: direction * (cardWidth + 16), behavior: "smooth" });
}
</script>

<template>
  <section>
    <div class="container">
      <div class="flex items-center justify-between gap-4">
        <h2 class="flex items-center">
          <span class="sm:hidden">{{ mobileHeading ?? heading }}</span>
          <span class="hidden sm:inline">{{ heading }}</span>
        </h2>
        <div class="flex items-center gap-4 -mt-4">
          <RouterLink
            v-if="viewAllHref"
            :to="viewAllHref"
            class="text-sm font-semibold underline underline-offset-4 hover:opacity-70"
          >
            {{ viewAllLabel }}
          </RouterLink>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-pill border border-line"
            aria-label="Previous"
            @click="scrollByAmount(-1)"
          >
            <ChevronIcon direction="left" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-pill border border-line"
            aria-label="Next"
            @click="scrollByAmount(1)"
          >
            <ChevronIcon direction="right" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref="trackRef"
        class="no-scrollbar -mx-4 mt-8 flex items-start snap-x snap-mandatory gap-2 sm:gap-6 overflow-x-auto scroll-smooth px-4 pb-2 scroll-px-4 sm:-mx-14 sm:px-14 sm:scroll-px-14"
      >
        <div v-for="product in items" :key="product.handle" class="w-[70vw] shrink-0 snap-start sm:w-[320px]">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </section>
</template>
