<script setup lang="ts">
import CategoryIcon, { type CategoryIconName } from "@/components/ui/icons/CategoryIcon.vue";

const types: { label: string; icon: CategoryIconName; href: string }[] = [
  { label: "Boots", icon: "boots", href: "/category/boots" },
  { label: "Loafers", icon: "loafers", href: "/category/loafers" },
  { label: "Sneakers", icon: "sneakers", href: "/category/sneakers" },
  { label: "Sandals", icon: "sandals", href: "/category/sandals" },
  { label: "Socks", icon: "socks", href: "/category/socks" },
  { label: "Shoe Laces", icon: "laces", href: "/category/shoe-laces" },
  { label: "Men's Bags", icon: "mens-bag", href: "/category/mens-bags" },
  { label: "Women's Handbags", icon: "womens-handbag", href: "/category/womens-handbags" },
];
</script>

<template>
  <section>
    <div class="container text-center">
      <h2>Shop by Type</h2>
      <div class="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
        <RouterLink
          v-for="type in types"
          :key="type.label"
          :to="type.href"
          class="group flex flex-col items-center gap-3"
        >
          <span
            class="flex h-16 w-16 items-center justify-center rounded-pill border border-line transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
          >
            <CategoryIcon :name="type.icon" class="h-7 w-7" />
          </span>
          <span class="text-sm font-medium">{{ type.label }}</span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
