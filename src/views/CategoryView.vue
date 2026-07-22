<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { products, type Gender } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";

const GENDER_SLUGS: Gender[] = ["men", "women"];

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));
const label = computed(() =>
  slug.value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
);

/**
 * Men/Women resolve via the real gender tag. Everything else (the "Shop
 * by Type" icon rail — boots, loafers, sneakers, etc.) does a loose
 * keyword match against product names, since there's no dedicated
 * type/category field. Categories we don't actually stock (socks, shoe
 * laces, bags) correctly fall through to the empty state below rather
 * than showing unrelated shoes.
 */
const matched = computed(() => {
  if (GENDER_SLUGS.includes(slug.value as Gender)) {
    return products.filter((product) => product.gender === slug.value);
  }
  const needle = slug.value.replace(/-/g, " ").toLowerCase();
  if (!needle) return [];
  return products.filter((product) => product.name.toLowerCase().includes(needle));
});
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container">
      <h1>{{ label }}</h1>

      <p v-if="matched.length === 0" class="mt-2 max-w-lg text-muted">
        Nothing in {{ label }} yet — check back as the range grows.
        <RouterLink to="/" class="underline">Shop what's live now</RouterLink>
      </p>

      <div v-else class="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 sm:gap-x-8">
        <ProductCard v-for="product in matched" :key="product.handle" :product="product" />
      </div>
    </div>
  </section>
</template>
