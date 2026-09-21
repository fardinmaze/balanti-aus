<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useCatalogue } from "@/lib/catalogue";
import { isChildOf, isTopLevelCategory } from "@/lib/category";
import { toneForSeed } from "@/lib/productAdapter";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import Spinner from "@/components/ui/Spinner.vue";

const catalogue = useCatalogue();

const topCategories = computed(() => catalogue.categories.value.filter(isTopLevelCategory));

const activeId = ref<number | null>(null);
watch(
  topCategories,
  (cats) => {
    if (!cats.some((c) => c.id === activeId.value)) {
      activeId.value = cats[0]?.id ?? null;
    }
  },
  { immediate: true }
);

const subcategories = computed(() =>
  activeId.value == null ? [] : catalogue.categories.value.filter((c) => isChildOf(c, activeId.value!))
);
</script>

<template>
  <Spinner v-if="catalogue.loading.value && !topCategories.length" label="Loading categories…" />
  <section v-else-if="topCategories.length">
    <h2 class="container text-center">Explore Our Products</h2>

    <div class="container mt-4 flex justify-center gap-8 overflow-x-auto" role="tablist">
      <button
        v-for="cat in topCategories"
        :key="cat.id"
        type="button"
        role="tab"
        :aria-selected="activeId === cat.id"
        class="min-h-[var(--tap-min)] shrink-0 border-b-2 text-sm font-semibold uppercase tracking-[0.04em] transition-colors"
        :class="activeId === cat.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'"
        @click="activeId = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <div class="container mt-8 grid grid-cols-6 gap-4">
      <RouterLink
        v-for="(sub, i) in subcategories"
        :key="sub.id"
        :to="`/catalogue?category=${sub.slug}`"
        class="group relative col-span-2 block aspect-square overflow-hidden rounded-lg"
        :class="{
          'col-start-3': subcategories.length === 1 && i === 0,
          'col-start-2': subcategories.length === 2 && i === 0,
        }"
      >
        <img
          v-if="sub.image"
          :src="sub.image"
          :alt="sub.name"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <PlaceholderImage
          v-else
          :tone="toneForSeed(sub.slug)"
          :label="sub.name"
          class="absolute inset-0 h-full w-full transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
        <div
          class="absolute inset-0 bg-black/0 transition-colors duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:bg-black/25"
          aria-hidden="true"
        />
        <div
          class="absolute inset-x-0 top-[78%] -translate-y-1/2 px-3 text-center transition-[top] duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:top-1/2"
        >
          <span
            class="font-display text-sm font-semibold text-white transition-all duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:text-lg"
          >
            {{ sub.name }}
          </span>
          <span
            class="mx-auto mt-1.5 block h-px w-0 bg-white transition-all duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:w-10"
            aria-hidden="true"
          />
        </div>
      </RouterLink>
    </div>
  </section>
</template>
