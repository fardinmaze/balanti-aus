<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import type { Product } from "@/lib/products";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";

const props = defineProps<{ product: Product }>();
const wishlist = useWishlist();
const cart = useCart();

const firstInStockSize = computed(() => props.product.sizes.find((size) => size.inStock)?.value);

function quickAdd() {
  if (!firstInStockSize.value) return;
  cart.addItem(props.product.handle, firstInStockSize.value);
}
</script>

<template>
  <RouterLink :to="`/products/${product.handle}`" class="group block">
    <div class="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="`${product.name} — ${product.material}, ${product.colorway}`"
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
        @click.stop.prevent="wishlist.toggle(product.handle)"
      >
        <HeartIcon class="h-4 w-4" :filled="wishlist.isWishlisted(product.handle)" />
      </button>

      <button
        type="button"
        class="absolute inset-x-3 bottom-3 min-h-[var(--tap-min)] rounded-pill bg-ink text-sm font-semibold text-paper opacity-0 shadow-[var(--shadow-card)] transition-[opacity,transform] duration-[var(--dur-mid)] translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 sm:min-h-0 sm:py-2.5"
        @click.stop.prevent="quickAdd"
      >
        Quick add
      </button>
    </div>
    <div class="mt-4 space-y-1.5">
      <h3 class="font-display text-lg font-semibold sm:text-xl">{{ product.name }}</h3>
      <p class="eyebrow">{{ product.material }} · {{ product.colorway }}</p>
      <PriceTag :amount="product.price" class="text-base" />
    </div>
  </RouterLink>
</template>
