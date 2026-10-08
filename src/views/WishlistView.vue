<script setup lang="ts">
import { watch } from "vue";
import { useWishlist } from "@/lib/wishlist";
import { useCatalogue } from "@/lib/catalogue";
import ProductCard from "@/components/product/ProductCard.vue";

const wishlist = useWishlist();
const catalogue = useCatalogue();

// The wishlist endpoint returns a light product payload without color options
// or per-color photos, so the cards' swatches and image slider stay empty
// unless the full product is loaded. fetchProduct caches into the catalogue
// (and skips anything already detail-loaded); the wishlist getter picks the
// fuller copy up reactively.
const requested = new Set<string>();
watch(
  // Keyed on the handle list (not the product objects), so a detail load
  // swapping in a fuller copy doesn't re-trigger fetches for in-flight handles.
  () => wishlist.items.value.map((p) => p.handle).join("|"),
  (joined) => {
    for (const handle of joined ? joined.split("|") : []) {
      if (requested.has(handle)) continue;
      requested.add(handle);
      catalogue.fetchProduct(handle).catch(() => requested.delete(handle));
    }
  },
  { immediate: true }
);
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container">
      <h1>Your wishlist</h1>

      <p v-if="wishlist.items.value.length === 0" class="mt-4 text-muted">
        Nothing saved yet.
        <RouterLink to="/" class="underline">Browse the collection</RouterLink>
      </p>

      <div v-else v-reveal.children class="grid grid-cols-2 items-start gap-6 sm:grid-cols-3 lg:grid-cols-4">
        <ProductCard
          v-for="product in wishlist.items.value"
          :key="product.handle"
          :product="product"
          :initial-color-id="wishlist.colorFor(product.handle)"
        />
      </div>
    </div>
  </section>
</template>
