<script setup lang="ts">
const categories = [
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Kids", href: "/category/kids" },
];
</script>

<template>
  <section class="relative !p-0">
    <div class="relative h-[280px] w-full overflow-hidden sm:h-[380px] lg:h-[440px]">
      <img src="/section.png" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div class="container relative flex h-full flex-col items-center justify-center text-center">
        <h2 class="!text-white">Shop by Category</h2>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <RouterLink
            v-for="category in categories"
            :key="category.label"
            :to="category.href"
            class="inline-flex min-h-[var(--tap-min)] items-center justify-center rounded-pill border border-white/70 px-8 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ink"
          >
            {{ category.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
