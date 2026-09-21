<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { catalogueApi } from "@/api/catalogue";
import { adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard.vue";
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";

const trending = ref<Product[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const { results } = await catalogueApi.trendingProducts(12);
    trending.value = adaptProducts(results);
  } finally {
    loading.value = false;
  }
});

// How many full cards are visible at once — never partial, so the track
// never has to overflow the container to show "the next sliver".
const visible = ref(6);
function updateVisible() {
  const w = window.innerWidth;
  visible.value = w < 640 ? 2 : w < 1024 ? 3 : 6;
}
onMounted(() => {
  updateVisible();
  window.addEventListener("resize", updateVisible);
});
onBeforeUnmount(() => window.removeEventListener("resize", updateVisible));

const maxIndex = computed(() => Math.max(trending.value.length - visible.value, 0));
const index = ref(0);

function clamp(i: number) {
  return Math.min(Math.max(i, 0), maxIndex.value);
}

function go(direction: 1 | -1) {
  index.value = clamp(index.value + direction);
}

// Track is (item count / visible) of the viewport; each item is (1 / item
// count) of the track — so, algebraically, every item is always exactly
// (1 / visible) of the viewport, and one index step slides exactly one item.
const trackWidthPct = computed(() => (trending.value.length / visible.value) * 100);
const itemWidthPct = computed(() => 100 / trending.value.length);
const trackStyle = computed(() => ({
  width: `${trackWidthPct.value}%`,
  transform: `translateX(-${index.value * itemWidthPct.value}%)`,
}));

function rank(i: number) {
  return String(i + 1).padStart(2, "0");
}

// Touch swipe — one index step per swipe, no free/partial scroll.
let touchStartX = 0;
function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX;
}
function onTouchEnd(e: TouchEvent) {
  const delta = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(delta) < 40) return;
  go(delta < 0 ? 1 : -1);
}
</script>

<template>
  <section v-if="loading || trending.length">
    <div class="container">
      <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p class="eyebrow mb-1">On The Rise</p>
          <h2>Trending Now</h2>
        </div>
        <div v-if="!loading" class="mb-2 flex items-center gap-4">
          <RouterLink to="/catalogue" class="text-sm font-semibold underline underline-offset-4 hover:opacity-70">
            Show All
          </RouterLink>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-pill border border-line disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous"
            :disabled="index === 0"
            @click="go(-1)"
          >
            <ChevronIcon direction="left" class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-pill border border-line disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next"
            :disabled="index === maxIndex"
            @click="go(1)"
          >
            <ChevronIcon direction="right" class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div v-if="loading" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <ProductCardSkeleton v-for="i in 6" :key="i" />
      </div>
      <div v-else class="relative mt-8 overflow-hidden" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <div class="flex transition-transform duration-300 ease-[var(--ease)]" :style="trackStyle">
          <div
            v-for="(product, i) in trending"
            :key="product.handle"
            class="shrink-0 px-1 sm:px-3"
            :style="{ width: `${itemWidthPct}%` }"
          >
            <div class="mb-3 flex items-baseline gap-3">
              <span class="font-display text-3xl font-bold leading-none text-ink/15">{{ rank(i) }}</span>
              <span class="h-px flex-1 bg-line" aria-hidden="true" />
            </div>
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
