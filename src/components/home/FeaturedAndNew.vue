<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCatalogue } from "@/lib/catalogue";
import { catalogueApi } from "@/api/catalogue";
import { adaptProducts } from "@/lib/productAdapter";
import type { Product } from "@/types/product";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import ProductRailSkeleton from "@/components/home/ProductRailSkeleton.vue";

type TabKey = "featured" | "new";

const TABS: { key: TabKey; label: string }[] = [
  { key: "new", label: "New Arrivals" },
  { key: "featured", label: "Featured" },
];

const catalogue = useCatalogue();
const active = ref<TabKey>("new");

const newArrivals = ref<Product[]>([]);
const newArrivalsLoaded = ref(false);
const fetchingNew = ref(false);

async function loadNewArrivals() {
  if (newArrivalsLoaded.value || fetchingNew.value) return;
  fetchingNew.value = true;
  try {
    const { results } = await catalogueApi.products(20);
    newArrivals.value = adaptProducts(results);
  } finally {
    newArrivalsLoaded.value = true;
    fetchingNew.value = false;
  }
}

watch(active, (key) => {
  if (key === "new") loadNewArrivals();
}, { immediate: true });

const items = computed(() => (active.value === "featured" ? catalogue.featured.value : newArrivals.value));
const isLoading = computed(() =>
  active.value === "featured" ? catalogue.loading.value && !items.value.length : fetchingNew.value && !items.value.length
);
</script>

<template>
  <section>
    <div class="container">
      <div class="flex gap-8 border-b border-line" role="tablist">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          type="button"
          role="tab"
          :aria-selected="active === tab.key"
          class="min-h-[var(--tap-min)] shrink-0 border-b-2 text-sm font-semibold uppercase tracking-[0.04em] transition-colors"
          :class="active === tab.key ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'"
          @click="active = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <ProductRailSkeleton v-if="isLoading" class="!p-0 mt-8" :heading="TABS.find((t) => t.key === active)!.label" />
    <ProductScrollRail
      v-else-if="items.length"
      class="!p-0 mt-8"
      :heading="TABS.find((t) => t.key === active)!.label"
      :items="items"
      view-all-href="/catalogue"
    />
    <p v-else class="container mt-8 text-muted">Nothing here yet — check back soon.</p>
  </section>
</template>
