<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useCatalogue } from "@/lib/catalogue";
import { reassurance } from "@/content/copy";
import { useFreeShippingLine } from "@/lib/freeDelivery";
import { useWishlist } from "@/lib/wishlist";
import type { ColorPhoto, Product } from "@/types/product";
import Gallery from "@/components/product/Gallery.vue";
import BuyBox from "@/components/product/BuyBox.vue";
import ReviewsSection from "@/components/product/ReviewsSection.vue";
import PriceTag from "@/components/ui/Price.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import ProductDetailSkeleton from "@/components/product/ProductDetailSkeleton.vue";

const route = useRoute();
const catalogue = useCatalogue();
const wishlist = useWishlist();

const product = ref<Product | undefined>(undefined);
const notFound = ref(false);
const loading = ref(true);
/** Set by BuyBox to the selected matrix-mechanism color's photos (§5.1) — empty when none selected. */
const selectedColorPhotos = ref<ColorPhoto[]>([]);

async function load(handle: string) {
  loading.value = true;
  notFound.value = false;
  try {
    // catalogue/fetchProduct decides for itself whether the cached copy is
    // detail-complete (see its own guard) — a list-rail copy (e.g. from the
    // homepage's featured/on-sale rails) is missing gallery photos, so it
    // isn't good enough here even though a `byHandle` entry already exists.
    const fetched = await catalogue.fetchProduct(handle);
    product.value = fetched;
    notFound.value = !fetched;
  } catch {
    // A rejected fetchProduct (network hiccup, backend error, etc.) used to leave
    // `loading` stuck true forever — the skeleton never resolves into either the
    // product or the "not found" state without a manual page refresh retrying it.
    notFound.value = true;
  } finally {
    loading.value = false;
  }
}

watch(product, () => {
  selectedColorPhotos.value = [];
});

// Whole-product stock (Product.ps_on_hand) — the same figure checkout compares
// against for a product with no color/size axis (guide §5.4). `null` means the
// API didn't return it, so we don't claim a stock state we can't back up.
const isOutOfStock = computed(() => product.value != null && product.value.stockOnHand !== null && product.value.stockOnHand < 1);

watch(() => route.params.handle, (handle) => load(String(handle)), { immediate: true });

const freeShippingLine = useFreeShippingLine();
const reassuranceItems = computed(() => [freeShippingLine.value, '— Australia-wide']);
</script>

<template>
  <section v-if="product" class="!pt-8 sm:!pt-12">
    <div class="container grid gap-10 lg:grid-cols-[minmax(0,640px)_1fr] lg:gap-16">
      <Gallery :product="product" :active-photos="selectedColorPhotos" />

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

        <span
          v-if="isOutOfStock"
          class="eyebrow mt-3 inline-block rounded-pill border border-sale px-3 py-1 text-sale"
        >
          Stock out
        </span>

        <p v-if="product.description" class="mt-6 text-muted" v-html="product.description"></p>

        <div class="mt-8">
          <BuyBox :product="product" @update:photos="selectedColorPhotos = $event" />
        </div>

        <div v-if="product.details" class="mt-8 space-y-2 border-t border-line pt-6">
          <p v-if="product.details" class="mt-6 text-muted" v-html="product.details"></p>
        </div>

        <ul class="mt-6 flex flex-wrap gap-x-4 gap-y-1">
          <li v-for="(item, index) in reassuranceItems" :key="index" class="text-xs text-muted">{{ item }}</li>
        </ul>
      </div>
    </div>

    <!-- <div class="container mt-16 max-w-3xl">
      <ReviewsSection :product-slug="product.handle" :average-rating="product.averageRating" />
    </div> -->
  </section>

  <section v-else-if="notFound">
    <div class="container text-center">
      <h1>We couldn't find that shoe</h1>
      <p class="mt-2 text-muted">It may have sold out or moved. Start with our best sellers instead.</p>
      <RouterLink to="/" class="mt-6 inline-block underline">Back to home</RouterLink>
    </div>
  </section>

  <section v-else-if="loading" class="!pt-8 sm:!pt-12">
    <ProductDetailSkeleton />
  </section>
</template>
