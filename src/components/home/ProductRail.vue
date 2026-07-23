<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { products, type Gender, type Product } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";

const PER_SLIDE = 3;
const AUTO_MS = 3000;

const activeTab = ref<Gender>("women");
const filtered = computed(() => products.filter((product) => product.gender === activeTab.value));

const pages = computed(() => {
  const list = filtered.value;
  const chunks: Product[][] = [];
  for (let i = 0; i < list.length; i += PER_SLIDE) {
    chunks.push(list.slice(i, i + PER_SLIDE));
  }
  return chunks;
});

const activePage = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
}

function start() {
  stop();
  if (pages.value.length <= 1) return;
  timer = setInterval(() => {
    activePage.value = (activePage.value + 1) % pages.value.length;
  }, AUTO_MS);
}

function goTo(index: number) {
  activePage.value = index;
  start();
}

watch(activeTab, () => {
  activePage.value = 0;
  start();
});

onMounted(start);
onUnmounted(stop);
</script>

<template>
  <section @mouseenter="stop" @mouseleave="start">
    <div class="container text-center">
      <h2>Most Popular Shoes</h2>

      <div class="mt-2 inline-flex gap-1 rounded-pill border border-line p-1" role="tablist" aria-label="Shop by">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'women'"
          class="min-h-[var(--tap-min)] rounded-pill px-8 text-sm font-medium transition-colors"
          :class="activeTab === 'women' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
          @click="activeTab = 'women'"
        >
          Women
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'men'"
          class="min-h-[var(--tap-min)] rounded-pill px-8 text-sm font-medium transition-colors"
          :class="activeTab === 'men' ? 'bg-ink text-paper' : 'text-muted hover:text-ink'"
          @click="activeTab = 'men'"
        >
          Men
        </button>
      </div>

      <div class="relative mt-12 overflow-hidden">
        <div
          class="flex transition-transform duration-1000 ease-[cubic-bezier(0.65,0,0.35,1)]"
          :style="{ transform: `translateX(-${activePage * 100}%)` }"
        >
          <div
            v-for="(page, i) in pages"
            :key="i"
            class="grid w-full shrink-0 grid-cols-1 gap-[2px] text-left sm:grid-cols-3"
          >
            <ProductCard v-for="product in page" :key="product.handle" :product="product" />
          </div>
        </div>
      </div>

      <div v-if="pages.length > 1" class="mt-8 flex justify-center gap-2">
        <button
          v-for="(page, i) in pages"
          :key="i"
          type="button"
          :aria-label="`Go to slide ${i + 1}`"
          :aria-current="activePage === i"
          class="h-2 w-2 rounded-pill transition-colors"
          :class="activePage === i ? 'bg-ink' : 'bg-line'"
          @click="goTo(i)"
        />
      </div>
    </div>
  </section>
</template>
