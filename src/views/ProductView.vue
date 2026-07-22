<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getProduct } from "@/lib/products";
import { reassurance } from "@/content/copy";
import { useWishlist } from "@/lib/wishlist";
import Gallery from "@/components/product/Gallery.vue";
import BuyBox from "@/components/product/BuyBox.vue";
import PriceTag from "@/components/ui/Price.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";

const route = useRoute();
const product = computed(() => getProduct(String(route.params.handle)));
const wishlist = useWishlist();
</script>

<template>
  <section v-if="product" class="!pt-8 sm:!pt-12">
    <div class="container grid gap-10 lg:grid-cols-2 lg:gap-16">
      <Gallery :product="product" />

      <div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="eyebrow mb-2">{{ product.material }} · {{ product.colorway }}</p>
            <h1 class="font-display text-3xl font-semibold sm:text-4xl">{{ product.name }}</h1>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-line"
            :aria-label="wishlist.isWishlisted(product.handle) ? 'Remove from wishlist' : 'Add to wishlist'"
            :aria-pressed="wishlist.isWishlisted(product.handle)"
            @click="wishlist.toggle(product.handle)"
          >
            <HeartIcon class="h-5 w-5" :filled="wishlist.isWishlisted(product.handle)" />
          </button>
        </div>
        <PriceTag :amount="product.price" class="mt-3 block text-xl" />

        <p class="mt-6 text-muted">{{ product.description }}</p>

        <div class="mt-8">
          <BuyBox :product="product" />
        </div>

        <ul class="mt-8 space-y-2 border-t border-line pt-6">
          <li v-for="detail in product.details" :key="detail" class="text-sm text-muted">
            · {{ detail }}
          </li>
        </ul>

        <ul class="mt-6 flex flex-wrap gap-x-4 gap-y-1">
          <li v-for="item in reassurance" :key="item" class="text-xs text-muted">{{ item }}</li>
        </ul>
      </div>
    </div>
  </section>

  <section v-else>
    <div class="container text-center">
      <h1>We couldn't find that shoe</h1>
      <p class="mt-2 text-muted">It may have sold out or moved. Start with our best sellers instead.</p>
      <RouterLink to="/" class="mt-6 inline-block underline">Back to home</RouterLink>
    </div>
  </section>
</template>
