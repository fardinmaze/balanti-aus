<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
import type { ColorOption, Product } from "@/types/product";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";

const props = defineProps<{ product: Product }>();
const wishlist = useWishlist();
const cart = useCart();
const router = useRouter();

// Matrix-mechanism products (§5.1) need a color/size picked on the PDP — there's no
// single unambiguous "first in stock size" to quick-add, unlike sibling-row products.
const isMatrix = computed(() => props.product.colorOptions.length > 0 || props.product.sizeOptions.length > 0);
const firstInStockSize = computed(() => props.product.sizes.find((size) => size.inStock)?.value);

function quickAdd() {
  if (isMatrix.value) {
    router.push(`/products/${props.product.handle}`);
    return;
  }
  if (!firstInStockSize.value) return;
  cart.addItem(props.product, firstInStockSize.value);
}

// Color-wise thumbnail switching + per-color image slider (mirrors the PDP
// gallery's color-photo mechanism, Gallery.vue) — defaults to the first
// color that actually carries photos, same rule as the PDP gallery.
const selectedColorId = ref<number | null>(null);

const activeColor = computed<ColorOption | null>(() => {
  if (!props.product.colorOptions.length) return null;
  return (
    props.product.colorOptions.find((c) => c.id === selectedColorId.value) ??
    props.product.colorOptions.find((c) => c.photos.length > 0) ??
    props.product.colorOptions[0]
  );
});

const activePhotos = computed(() => activeColor.value?.photos ?? []);
const activeImageIndex = ref(0);

watch(activeColor, () => {
  activeImageIndex.value = 0;
});

const cardImage = computed(() => {
  const photo = activePhotos.value[activeImageIndex.value];
  return photo?.thumbnail ?? photo?.image ?? props.product.thumbnail;
});

function selectColor(color: ColorOption) {
  selectedColorId.value = color.id;
}

function goToOffset(offset: number) {
  const count = activePhotos.value.length;
  if (count < 2) return;
  activeImageIndex.value = (activeImageIndex.value + offset + count) % count;
}
</script>

<template>
  <RouterLink :to="`/products/${product.handle}`" class="group block">
    <div class="relative aspect-[3/3] overflow-hidden rounded-none">
      <img
        v-if="cardImage"
        :src="cardImage"
        :alt="`${product.name} — ${activeColor?.name ?? product.colorway}`"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105"
      />
      <template v-else>
        <PlaceholderImage
          :tone="product.tone"
          :label="product.name"
          angle="front"
          class="absolute inset-0 h-full w-full transition-[opacity,transform] duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105 group-hover:opacity-0"
        />
        <PlaceholderImage
          :tone="product.tone"
          :label="product.name"
          angle="side"
          class="absolute inset-0 h-full w-full opacity-0 transition-[opacity,transform] duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-105 group-hover:opacity-100"
        />
      </template>

      <template v-if="activePhotos.length > 1">
        <button
          type="button"
          class="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-pill bg-paper/90 text-ink opacity-0 shadow-[var(--shadow-card)] transition-opacity group-hover:opacity-100"
          aria-label="Previous image"
          @click.stop.prevent="goToOffset(-1)"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          class="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-pill bg-paper/90 text-ink opacity-0 shadow-[var(--shadow-card)] transition-opacity group-hover:opacity-100"
          aria-label="Next image"
          @click.stop.prevent="goToOffset(1)"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <div
          class="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5 opacity-100 transition-opacity"
          :class="{ 'group-hover:opacity-0': !isMatrix }"
        >
          <span
            v-for="(photo, i) in activePhotos"
            :key="photo.image"
            class="h-1.5 w-1.5 rounded-pill transition-colors"
            :class="i === activeImageIndex ? 'bg-paper' : 'bg-paper/50'"
          />
        </div>
      </template>

      <span
        v-if="product.badge"
        class="eyebrow absolute left-3 top-3 rounded-pill bg-surface px-3 py-1 text-ink shadow-[var(--shadow-card)]"
      >
        {{ product.badge }}
      </span>
      <button
        type="button"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-pill bg-surface text-ink shadow-[var(--shadow-card)]"
        :aria-label="wishlist.isWishlisted(product.handle) ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="wishlist.isWishlisted(product.handle)"
        @click.stop.prevent="wishlist.toggle(product)"
      >
        <HeartIcon class="h-4 w-4" :filled="wishlist.isWishlisted(product.handle)" />
      </button>

      <button
        v-if="!isMatrix"
        type="button"
        class="absolute inset-x-3 bottom-3 min-h-[var(--tap-min)] rounded-pill bg-ink text-sm font-semibold text-paper opacity-0 shadow-[var(--shadow-card)] transition-[opacity,transform] duration-[var(--dur-mid)] translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 sm:min-h-0 sm:py-2.5"
        @click.stop.prevent="quickAdd"
      >
        Quick add
      </button>
    </div>
    <div class="mt-4 space-y-1.5">
      <p class="font-display text-sm sm:text-lg font-medium">{{ product.name }}</p>
      <ul v-if="product.colorOptions.length" class="flex flex-wrap gap-1.5" aria-label="Available colors">
        <li v-for="color in product.colorOptions" :key="color.id">
          <button
            type="button"
            class="block h-3 w-3 shrink-0 rounded-pill border transition-shadow"
            :class="activeColor?.id === color.id ? 'border-ink ring-1 ring-ink ring-offset-1' : ''"
            :style="color.hexCode ? { backgroundColor: color.hexCode } : undefined"
            :aria-label="`Show ${color.name}`"
            :aria-pressed="activeColor?.id === color.id"
            :title="color.name"
            @click.stop.prevent="selectColor(color)"
          />
        </li>
      </ul>
      <PriceTag
        :amount="product.onSale ? product.offerPrice! : product.price"
        :compare-at-amount="product.onSale ? product.price : undefined"
        class="text-base"
      />
    </div>
  </RouterLink>
</template>
