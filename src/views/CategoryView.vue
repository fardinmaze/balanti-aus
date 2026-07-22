<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { products, type Gender } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";

const GENDER_SLUGS: Gender[] = ["men", "women"];

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));
const label = computed(() => slug.value.charAt(0).toUpperCase() + slug.value.slice(1));

const matched = computed(() =>
  GENDER_SLUGS.includes(slug.value as Gender)
    ? products.filter((product) => product.gender === slug.value)
    : []
);
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
