<script setup lang="ts">
import { useWishlist } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard.vue";

const wishlist = useWishlist();
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container">
      <h1>Your wishlist</h1>

      <p v-if="wishlist.items.value.length === 0" class="mt-4 text-muted">
        Nothing saved yet.
        <RouterLink to="/" class="underline">Browse the collection</RouterLink>
      </p>

      <div v-else class="grid grid-cols-2 items-start gap-6 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard v-for="product in wishlist.items.value" :key="product.handle" :product="product" />
      </div>
    </div>
  </section>
</template>
