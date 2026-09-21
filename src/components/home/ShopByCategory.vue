<script setup lang="ts">
import { useCatalogue } from "@/lib/catalogue";
import { toneForSeed } from "@/lib/productAdapter";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";
import Spinner from "@/components/ui/Spinner.vue";

// Category doorways driven by whatever top-level categories the backend
// actually has seeded (GET /site-api/top-categories), not a fixed
// Men/Women/Kids list.
const catalogue = useCatalogue();
</script>

<template>
  <Spinner v-if="catalogue.loading.value && !catalogue.topCategories.value.length" label="Loading categories…" />
  <section v-else-if="catalogue.topCategories.value.length">
    <!-- <h2 class="container">Shop by Category</h2> -->
    <div class="grid grid-cols-1 sm:grid-cols-2">
      <RouterLink
        v-for="cat in catalogue.topCategories.value"
        :key="cat.id"
        :to="`/catalogue?category=${cat.slug}`"
        class="group relative block aspect-[2/1] overflow-hidden sm:aspect-[2/1]"
      >
        <img
          v-if="cat.image"
          :src="cat.image"
          :alt="cat.name"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <PlaceholderImage
          v-else
          :tone="toneForSeed(cat.slug)"
          :label="cat.name"
          angle="worn"
          class="absolute inset-0 h-full w-full transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
        <div class="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <h3 class="font-display text-lg font-semibold text-white sm:text-xl">{{ cat.name }}</h3>
          <span class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white underline sm:text-sm">
            Shop now
            <ChevronIcon class="h-3 w-3 sm:h-4 sm:w-4" />
          </span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
