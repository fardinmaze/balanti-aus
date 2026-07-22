<script setup lang="ts">
import { getProduct } from "@/lib/products";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";

// Big, full-bleed category doorways. Men/Women use real photos from the
// supplied image set (closest visual match, not literal product shots);
// Kids has no inventory yet, so it stays an honest placeholder tone.
const tiles = [
  {
    label: "Men",
    href: "/category/men",
    tone: getProduct("balanti-oxford")!.tone,
    image: "/card-images/product-photos/pexels-star-photography-117690710-13611901.jpg",
  },
  {
    label: "Women",
    href: "/category/women",
    tone: getProduct("balanti-loafer")!.tone,
    image: "/card-images/product-photos/pexels-mahsima-10827097.jpg",
  },
  {
    label: "Kids",
    href: "/category/kids",
    tone: "#7a6a52",
    image: "/card-images/pexels-antonius-ferret-5275783.jpg",
  },
];
</script>

<template>
  <section>
    <h2 class="container">Shop by Category</h2>
    <div class="mt-6 grid grid-cols-1 sm:grid-cols-3">
      <RouterLink
        v-for="tile in tiles"
        :key="tile.label"
        :to="tile.href"
        class="group relative block aspect-[4/5] overflow-hidden sm:aspect-[3/4]"
      >
        <img
          v-if="tile.image"
          :src="tile.image"
          :alt="tile.label"
          class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <PlaceholderImage
          v-else
          :tone="tile.tone"
          :label="tile.label"
          angle="worn"
          class="absolute inset-0 h-full w-full transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />
        <div class="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <h3 class="font-display text-3xl font-semibold text-white sm:text-4xl">{{ tile.label }}</h3>
          <span class="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white underline">
            Shop now
            <ChevronIcon class="h-4 w-4" />
          </span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
