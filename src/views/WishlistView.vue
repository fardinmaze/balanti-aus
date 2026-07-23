<script setup lang="ts">
import { computed } from "vue";
import { useWishlist } from "@/lib/wishlist";
import { getProduct, type Product } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";

const wishlist = useWishlist();

const products = computed<Product[]>(() =>
  wishlist.handles.value
    .map((handle) => getProduct(handle))
    .filter((product): product is Product => product !== undefined)
);
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container">
      <h1>Your wishlist</h1>

      <p v-if="products.length === 0" class="mt-4 text-muted">
        Nothing saved yet.
        <RouterLink to="/" class="underline">Browse the collection</RouterLink>
      </p>

      <div v-else class="grid grid-cols-2 gap-[2px]">
        <ProductCard v-for="product in products" :key="product.handle" :product="product" />
      </div>
    </div>
  </section>
</template>
