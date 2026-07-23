<script setup lang="ts">
import { computed } from "vue";
import { products, type Gender, type Style } from "@/lib/products";
import Hero from "@/components/home/Hero.vue";
import ProductScrollRail from "@/components/home/ProductScrollRail.vue";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import ChevronIcon from "@/components/ui/icons/ChevronIcon.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const props = defineProps<{ gender: "men" | "women" | "kids" }>();

// Kids has no inventory yet (see WORKPLAN.md) — the section below stays an
// honest "coming soon" state instead of faking a Kids range.
const isShoppable = computed(() => props.gender === "men" || props.gender === "women");

const genderProducts = computed(() =>
  isShoppable.value ? products.filter((p) => p.gender === (props.gender as Gender)) : []
);

const mostPopular = computed(() =>
  [...genderProducts.value].sort((a, b) => {
    if (a.badge === "Best Seller" && b.badge !== "Best Seller") return -1;
    if (b.badge === "Best Seller" && a.badge !== "Best Seller") return 1;
    return 0;
  })
);

const newArrivals = computed(() => genderProducts.value.filter((p) => p.badge === "New"));

const STYLE_LABELS: Record<Style, string> = { formal: "Formal", casual: "Casual", boots: "Boots" };
const STYLE_ORDER: Style[] = ["formal", "casual", "boots"];

type StyleTile = { key: string; label: string; href: string; image?: string; tone: string };

// Every style present in this gender's range gets a tile, plus a final
// "Accessories" tile — no accessory inventory exists yet, so it routes to
// the catalogue page's honest empty state rather than a fake product set.
const styleTiles = computed<StyleTile[]>(() => {
  const tiles: StyleTile[] = [];
  for (const style of STYLE_ORDER) {
    const match = genderProducts.value.find((p) => p.style === style);
    if (!match) continue;
    tiles.push({
      key: style,
      label: STYLE_LABELS[style],
      href: `/catalogue?gender=${props.gender}&style=${style}`,
      image: match.image,
      tone: match.tone,
    });
  }

  tiles.push({
    key: "accessories",
    label: "Accessories",
    href: `/catalogue?gender=${props.gender}&type=accessories`,
    tone: "#3a342c",
  });

  return tiles;
});

const accessoriesHref = computed(() =>
  props.gender === "women" ? "/catalogue?gender=women&type=womens-handbag" : "/catalogue?gender=men&type=mens-bag"
);

const viewAllHref = computed(() => `/catalogue?gender=${props.gender}`);
const label = computed(() => props.gender.charAt(0).toUpperCase() + props.gender.slice(1));
</script>

<template>
  <Hero />

  <template v-if="isShoppable">
    <ProductScrollRail id="most-popular" heading="Most Popular" :items="mostPopular" :view-all-href="viewAllHref" />

    <ProductScrollRail
      v-if="newArrivals.length"
      id="new-arrivals"
      heading="New Arrivals"
      :items="newArrivals"
      :view-all-href="viewAllHref"
    />

    <section id="accessories" class="!p-0">
      <RouterLink
        :to="accessoriesHref"
        class="group relative block h-[220px] w-full overflow-hidden sm:h-[300px]"
      >
        <PlaceholderImage
          tone="#3a342c"
          :label="`${label} Accessories`"
          angle="worn"
          class="absolute inset-0 h-full w-full transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-black/40" aria-hidden="true" />
        <div class="container relative flex h-full flex-col items-center justify-center text-center">
          <h2 class="!text-white">Accessories</h2>
          <p class="mt-2 text-white/80">Socks, laces, and bags — coming soon.</p>
        </div>
      </RouterLink>
    </section>

    <section v-if="styleTiles.length">
      <h2 class="container">Shop by Style</h2>
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-3">
        <RouterLink
          v-for="tile in styleTiles"
          :key="tile.key"
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
      <div class="container mt-8 text-center">
        <BaseButton variant="ghost" :to="viewAllHref">Show All {{ label }}'s</BaseButton>
      </div>
    </section>
  </template>

  <section v-else class="text-center">
    <div class="container max-w-lg">
      <h2>Kids</h2>
      <p class="mt-2 text-muted">
        We haven't launched Kids inventory yet — check back as the range grows.
      </p>
      <BaseButton to="/catalogue?type=kids" class="mt-6">Show All Kids'</BaseButton>
      <p class="mt-3 text-sm">
        <RouterLink to="/" class="underline text-muted hover:text-ink">or shop what's live now</RouterLink>
      </p>
    </div>
  </section>
</template>
