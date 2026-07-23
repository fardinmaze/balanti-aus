<script setup lang="ts">
import CategoryIcon, { type CategoryIconName } from "@/components/ui/icons/CategoryIcon.vue";

// Each links into the universal catalogue page pre-filtered to that type
// (see CatalogueView.vue) — Sandals/Socks/Shoe Laces/Bags correctly land
// on an honest empty state since there's no inventory behind them yet.
const types: { label: string; icon: CategoryIconName; href: string }[] = [
  { label: "Boots", icon: "boots", href: "/catalogue?type=boots" },
  { label: "Loafers", icon: "loafers", href: "/catalogue?type=loafers" },
  { label: "Sneakers", icon: "sneakers", href: "/catalogue?type=sneakers" },
  { label: "Sandals", icon: "sandals", href: "/catalogue?type=sandals" },
  { label: "Socks", icon: "socks", href: "/catalogue?type=socks" },
  { label: "Shoe Laces", icon: "laces", href: "/catalogue?type=laces" },
  { label: "Men's Bags", icon: "mens-bag", href: "/catalogue?type=mens-bag" },
  { label: "Women's Handbags", icon: "womens-handbag", href: "/catalogue?type=womens-handbag" },
];
</script>

<template>
  <section class="relative !p-0">
    <div class="relative w-full overflow-hidden py-16 sm:py-20 lg:py-24">
      <img src="/section.png" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div class="container relative text-center">
        <h2 class="!text-white">Shop by Type</h2>
        <div class="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          <RouterLink
            v-for="type in types"
            :key="type.label"
            :to="type.href"
            class="group flex flex-col items-center gap-3"
          >
            <span
              class="flex h-16 w-16 items-center justify-center rounded-pill border border-white/70 text-white transition-colors group-hover:border-white group-hover:bg-white group-hover:text-ink"
            >
              <CategoryIcon :name="type.icon" class="h-7 w-7" />
            </span>
            <span class="text-sm font-medium text-white">{{ type.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
