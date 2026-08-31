<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useCatalogue } from "@/lib/catalogue";
import { reassurance } from "@/content/copy";
import { useFreeShippingLine } from "@/lib/freeDelivery";
import { useWishlist } from "@/lib/wishlist";
import type { Product } from "@/types/product";
import Gallery from "@/components/product/Gallery.vue";
import BuyBox from "@/components/product/BuyBox.vue";
import ReviewsSection from "@/components/product/ReviewsSection.vue";
import PriceTag from "@/components/ui/Price.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";

const route = useRoute();
const catalogue = useCatalogue();
const wishlist = useWishlist();

const product = ref<Product | undefined>(undefined);
const notFound = ref(false);
const loading = ref(true);

async function load(handle: string) {
  loading.value = true;
  notFound.value = false;
  const cached = catalogue.getByHandle(handle);
  if (cached) {
    product.value = cached;
    loading.value = false;
    return;
  }
  const fetched = await catalogue.fetchProduct(handle);
  product.value = fetched;
  notFound.value = !fetched;
  loading.value = false;
}

watch(() => route.params.handle, (handle) => load(String(handle)), { immediate: true });

const freeShippingLine = useFreeShippingLine();
const reassuranceItems = computed(() => [freeShippingLine.value, '— Australia-wide']);
</script>

<template>
  <section v-if="product" class="!pt-8 sm:!pt-12">
    <div class="container grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-16">
      <Gallery :product="product" />

      <div>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="font-display text-3xl font-semibold sm:text-4xl">{{ product.name }}</h1>
          </div>
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-line"
            :aria-label="wishlist.isWishlisted(product.handle) ? 'Remove from wishlist' : 'Add to wishlist'"
            :aria-pressed="wishlist.isWishlisted(product.handle)"
            @click="wishlist.toggle(product)"
          >
            <HeartIcon class="h-5 w-5" :filled="wishlist.isWishlisted(product.handle)" />
          </button>
        </div>
        <PriceTag
          :amount="product.onSale ? product.offerPrice! : product.price"
          :compare-at-amount="product.onSale ? product.price : undefined"
          class="mt-3 block text-xl"
        />

        <p v-if="product.description" class="mt-6 text-muted">{{ product.description }}</p>

        <div class="mt-8">
          <BuyBox :product="product" />
        </div>

        <ul v-if="product.details.length" class="mt-8 space-y-2 border-t border-line pt-6">
          <li v-for="detail in product.details" :key="detail" class="text-sm text-muted">
            · {{ detail }}
          </li>
        </ul>

        <ul class="mt-6 flex flex-wrap gap-x-4 gap-y-1">
          <li v-for="item in reassuranceItems" :key="item" class="text-xs text-muted">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div class="container mt-16 max-w-3xl">
      <ReviewsSection :product-slug="product.handle" :average-rating="product.averageRating" />
    </div>
  </section>

  <section v-else-if="notFound">
    <div class="container text-center">
      <h1>We couldn't find that shoe</h1>
      <p class="mt-2 text-muted">It may have sold out or moved. Start with our best sellers instead.</p>
      <RouterLink to="/" class="mt-6 inline-block underline">Back to home</RouterLink>
    </div>
  </section>

  <section v-else-if="loading">
    <div class="container text-center text-muted">Loading…</div>
  </section>
</template>
