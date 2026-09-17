<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import type { Product } from "@/types/product";
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
</script>

<template>
  <RouterLink :to="`/products/${product.handle}`" class="group block">
    <div class="relative aspect-[5/5] overflow-hidden rounded-none bg-surface">
      <img
        v-if="product.thumbnail"
        :src="product.thumbnail"
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
        @click.stop.prevent="wishlist.toggle(product)"
      >
        <HeartIcon class="h-4 w-4" :filled="wishlist.isWishlisted(product.handle)" />
      </button>

      <button
        type="button"
        class="absolute inset-x-3 bottom-3 min-h-[var(--tap-min)] rounded-pill bg-ink text-sm font-semibold text-paper opacity-0 shadow-[var(--shadow-card)] transition-[opacity,transform] duration-[var(--dur-mid)] translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 sm:min-h-0 sm:py-2.5"
        @click.stop.prevent="quickAdd"
      >
        {{ isMatrix ? "Select options" : "Quick add" }}
      </button>
    </div>
    <div class="mt-4 space-y-1.5">
      <h3 class="font-display text-lg font-semibold sm:text-xl">{{ product.name }}</h3>
      <ul v-if="product.colorOptions.length" class="flex flex-wrap gap-1.5" aria-label="Available colors">
        <li
          v-for="color in product.colorOptions"
          :key="color.id"
          class="h-3.5 w-3.5 shrink-0 rounded-pill border border-line"
          :style="color.hexCode ? { backgroundColor: color.hexCode } : undefined"
          :title="color.name"
        />
      </ul>
      <PriceTag
        :amount="product.onSale ? product.offerPrice! : product.price"
        :compare-at-amount="product.onSale ? product.price : undefined"
        class="text-base"
      />
    </div>
  </RouterLink>
</template>
