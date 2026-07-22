<script setup lang="ts">
import { ref } from "vue";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";

defineProps<{ heading: string; items: Product[] }>();

const trackRef = ref<HTMLDivElement | null>(null);

function scrollByAmount(direction: 1 | -1) {
  const el = trackRef.value;
  if (!el) return;
  const cardWidth = el.querySelector<HTMLElement>(":scope > div")?.offsetWidth ?? 320;
  el.scrollBy({ left: direction * (cardWidth + 32), behavior: "smooth" });
}
</script>

<template>
  <section>
    <div class="container">
      <div class="flex items-end justify-between gap-4">
        <h2>{{ heading }}</h2>
        <div class="mb-2 flex gap-2">
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
        class="no-scrollbar -mx-14 mt-8 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth px-14 pb-2"
      >
        <div v-for="product in items" :key="product.handle" class="w-[70vw] shrink-0 snap-start sm:w-[320px]">
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </section>
</template>
