<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import BaseButton from "@/components/ui/BaseButton.vue";

const props = defineProps<{ product: Product }>();

const cart = useCart();
const router = useRouter();
const selectedSize = ref<string | null>(null);
const showSizeError = ref(false);

const canAdd = computed(() => selectedSize.value !== null);

function selectSize(value: string, inStock: boolean) {
  if (!inStock) return;
  selectedSize.value = value;
  showSizeError.value = false;
}

function addToBag() {
  if (!selectedSize.value) {
    showSizeError.value = true;
    return;
  }
  cart.addItem(props.product.handle, selectedSize.value);
}

function buyNow() {
  if (!selectedSize.value) {
    showSizeError.value = true;
    return;
  }
  cart.addItem(props.product.handle, selectedSize.value);
  cart.closeCart();
  router.push("/checkout");
}
</script>

<template>
  <div>
    <fieldset>
      <legend class="eyebrow mb-2">
        Size
        <RouterLink to="/support#size-guide" class="ml-1 underline">Size guide</RouterLink>
      </legend>
      <div class="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Select a size">
        <button
          v-for="size in product.sizes"
          :key="size.value"
          type="button"
          role="radio"
          :aria-checked="selectedSize === size.value"
          :aria-disabled="!size.inStock"
          :disabled="!size.inStock"
          class="min-h-[var(--tap-min)] rounded-md border text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          :class="selectedSize === size.value ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
          @click="selectSize(size.value, size.inStock)"
        >
          {{ size.value }}
          <span v-if="!size.inStock" class="sr-only">(out of stock)</span>
        </button>
      </div>
      <p v-if="showSizeError" class="mt-2 text-sm text-sale" role="alert">Select a size to continue.</p>
    </fieldset>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
      <BaseButton variant="ghost" class="flex-1" :disabled="!canAdd && showSizeError" @click="addToBag">
        Add to bag
      </BaseButton>
      <BaseButton class="flex-1" @click="buyNow">Buy now</BaseButton>
    </div>

    <p class="mt-3 text-xs text-muted">
      Demo checkout — no real payment is processed.
    </p>
  </div>
</template>
