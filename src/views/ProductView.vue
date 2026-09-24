<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useCatalogue } from "@/lib/catalogue";
import { reassurance } from "@/content/copy";
import { useFreeShippingLine } from "@/lib/freeDelivery";
import { useWishlist } from "@/lib/wishlist";
import type { ColorPhoto, Product } from "@/types/product";
import Gallery from "@/components/product/Gallery.vue";
import ImageZoomViewer from "@/components/product/ImageZoomViewer.vue";
import BuyBox from "@/components/product/BuyBox.vue";
import ReviewsSection from "@/components/product/ReviewsSection.vue";
import PriceTag from "@/components/ui/Price.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import ProductDetailSkeleton from "@/components/product/ProductDetailSkeleton.vue";
import Breadcrumb from "@/components/product/Breadcrumb.vue";
import ProductAttributes from "@/components/product/ProductAttributes.vue";
import ProductTabs from "@/components/product/ProductTabs.vue";

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

// Zoom viewer for the description's thumbnail strip (§ same modal as Gallery).
// `images` and `thumbnails` are parallel arrays (API order) — a thumbnail at
// index N opens the matching full-resolution photo at `images[N]`.
const isThumbnailZoomOpen = ref(false);
const thumbnailZoomIndex = ref(0);
const thumbnailZoomImages = computed(() => (product.value?.images ?? []).map((url) => ({ url, alt: product.value!.name })));

function openThumbnailZoom(index: number) {
  thumbnailZoomIndex.value = index;
  isThumbnailZoomOpen.value = true;
}

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
    <div class="container">
      <Breadcrumb :product="product" />
    </div>

    <div class="container mt-6 grid gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
      <Gallery :product="product" :active-photos="selectedColorPhotos" />

      <div class="flex flex-col">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-display text-2xl font-semibold sm:text-4xl">{{ product.name }}</p>
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
          class="eyebrow mt-3 inline-block rounded-pill border border-sale px-3 py-1 text-sale w-fit"
        >
          Stock out
        </span>

        <p v-if="product.description" class="mt-6 text-sm leading-7 text-muted border-b border-line pb-6" v-html="product.description"></p>

        <div class="mt-7">
          <p class="eyebrow">Checkout How you look</p>
          <div v-if="product.thumbnails?.length >= 1" class="mt-2 flex flex-wrap gap-3">
            <div v-for="(item, index) in product.thumbnails" :key="item" class="flex items-center gap-3">
              <button
                type="button"
                class="shrink-0 cursor-zoom-in rounded-md"
                aria-label="Open full-size image viewer"
                @click="openThumbnailZoom(index)"
              >
                <img :src="item" :alt="item" class="h-14 w-14 shrink-0 rounded-md border border-line object-cover" />
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <BuyBox :product="product" @update:photos="selectedColorPhotos = $event" />
        </div>

        <div class="mt-8 border-t border-line pt-7">
          <ul v-if="product.styling || product.occasion" class="flex flex-wrap gap-2 mb-6">
            <li v-if="product.styling" class="eyebrow rounded-pill border border-line px-3 py-1.5">{{ product.styling?.name }}</li>
            <li v-if="product.occasion" class="eyebrow rounded-pill border border-line px-3 py-1.5">{{ product.occasion?.name }}</li>
          </ul>

          <ProductAttributes :product="product" />
        </div>

        <ul class="mt-6 flex flex-wrap gap-x-4 gap-y-1">
          <li v-for="(item, index) in reassuranceItems" :key="index" class="text-xs text-muted">{{ item }}</li>
        </ul>

        <div class="mt-8">
          <ProductTabs :product="product" />
        </div>
      </div>
    </div>

    <!-- <div class="container mt-16 max-w-3xl">
      <ReviewsSection :product-slug="product.handle" :average-rating="product.averageRating" />
    </div> -->

    <ImageZoomViewer
      v-model:open="isThumbnailZoomOpen"
      :images="thumbnailZoomImages"
      :index="thumbnailZoomIndex"
      :label="product.name"
      @update:index="thumbnailZoomIndex = $event"
    />
  </section>

  <section v-else-if="notFound">
    <div class="container text-center">
      <h1>We couldn't find that shoe</h1>
      <p class="mt-2 text-muted">It may have sold out or moved. Start with our best sellers instead.</p>
      <RouterLink to="/" class="mt-6 inline-block underline">Back to home</RouterLink>
    </div>
  </section>

  <section v-else-if="loading" class="!pt-8 sm:!pt-12 max-w-[1280px] mx-auto">
    <ProductDetailSkeleton />
  </section>
</template>
