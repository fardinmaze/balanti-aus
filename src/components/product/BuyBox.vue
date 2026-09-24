<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { ColorPhoto, Product } from "@/types/product";
import { useCart } from "@/lib/cart";
import BaseButton from "@/components/ui/BaseButton.vue";
import ShoeIcon from "@/components/ui/icons/ShoeIcon.vue";

const props = defineProps<{ product: Product }>();
const emit = defineEmits<{ (e: "update:photos", photos: ColorPhoto[]): void }>();

const cart = useCart();
const route = useRoute();
const router = useRouter();

// Whole-product stock (Product.ps_on_hand) — `null` means the API didn't return it, so don't block on it.
const productOutOfStock = computed(() => props.product.stockOnHand !== null && props.product.stockOnHand < 1);

/** Matrix mechanism (§5.1) — colors/sizes carried directly on this product row, with per-combo stock. */
const isMatrix = computed(() => props.product.colorOptions.length > 0 || props.product.sizeOptions.length > 0);
const requireColor = computed(() => props.product.colorOptions.length > 0);
const requireSize = computed(() => props.product.sizeOptions.length > 0);

const selectedColorId = ref<number | null>(null);
const selectedSizeId = ref<number | null>(null);

// Sibling-row mechanism (§5.1) — unchanged from before.
const selectedSize = ref<string | null>(null);

const showSelectionError = ref(false);

/**
 * Color chosen on the product card (`?color=<id>`, see ProductCard.vue) if this product carries it,
 * otherwise the first color in API order — selected by default so the gallery has a photo set to
 * show before the shopper picks anything.
 */
function applyDefaultColor() {
  const requestedId = Number(route.query.color);
  const first =
    props.product.colorOptions.find((c) => c.id === requestedId) ?? props.product.colorOptions[0];
  if (!first) {
    selectedColorId.value = null;
    emit("update:photos", []);
    return;
  }
  selectedColorId.value = first.id;
  emit("update:photos", first.photos);
}

watch(
  () => props.product.handle,
  () => {
    selectedSizeId.value = null;
    selectedSize.value = null;
    showSelectionError.value = false;
    applyDefaultColor();
  },
  { immediate: true }
);

/** `null` = no stock data to check against (don't block on it); otherwise the matched quantity, or 0 if no entry matches. */
function matrixQuantity(colorId: number | null, sizeId: number | null): number | null {
  if (!props.product.stockVariations.length) return null;
  const entry = props.product.stockVariations.find(
    (v) => (requireColor.value ? v.color === colorId : true) && (requireSize.value ? v.size === sizeId : true)
  );
  return entry?.quantity ?? 0;
}

function colorInStock(colorId: number): boolean {
  if (!props.product.stockVariations.length) return true;
  return props.product.stockVariations.some((v) => v.color === colorId && v.quantity > 0);
}

function sizeInStock(sizeId: number): boolean {
  // Before a color is picked (on a product that has one), don't grey out sizes we can't evaluate yet.
  if (requireColor.value && selectedColorId.value == null) return true;
  const qty = matrixQuantity(requireColor.value ? selectedColorId.value : null, sizeId);
  return qty === null || qty > 0;
}

function selectColor(colorId: number) {
  if (!colorInStock(colorId)) return;
  selectedColorId.value = colorId;
  showSelectionError.value = false;
  emit("update:photos", props.product.colorOptions.find((c) => c.id === colorId)?.photos ?? []);
  if (requireSize.value && selectedSizeId.value != null) {
    const qty = matrixQuantity(colorId, selectedSizeId.value);
    if (qty !== null && qty <= 0) selectedSizeId.value = null;
  }
}

function selectMatrixSize(sizeId: number) {
  if (!sizeInStock(sizeId)) return;
  selectedSizeId.value = sizeId;
  showSelectionError.value = false;
}

function selectSiblingSize(value: string, inStock: boolean) {
  if (!inStock) return;
  selectedSize.value = value;
  showSelectionError.value = false;
}

const matrixReady = computed(() => {
  const selectionComplete =
    (!requireColor.value || selectedColorId.value !== null) && (!requireSize.value || selectedSizeId.value !== null);
  if (!selectionComplete) return false;
  const qty = matrixQuantity(selectedColorId.value, selectedSizeId.value);
  return qty === null || qty > 0;
});

const canAdd = computed(() => (isMatrix.value ? matrixReady.value : selectedSize.value !== null));

const selectionErrorText = computed(() => {
  if (!isMatrix.value) return "Select a size to continue.";
  if (requireColor.value && requireSize.value) return "Select a color and size to continue.";
  return requireColor.value ? "Select a color to continue." : "Select a size to continue.";
});

function currentMatrixLabel(): string {
  const colorName = props.product.colorOptions.find((c) => c.id === selectedColorId.value)?.name;
  const sizeName = props.product.sizeOptions.find((s) => s.id === selectedSizeId.value)?.name;
  return [colorName, sizeName].filter(Boolean).join(" / ");
}

function addSelectionToCart() {
  if (isMatrix.value) {
    cart.addItem(props.product, currentMatrixLabel(), 1, {
      itemId: props.product.id,
      colorId: requireColor.value ? selectedColorId.value : null,
      sizeId: requireSize.value ? selectedSizeId.value : null,
    });
  } else {
    cart.addItem(props.product, selectedSize.value!);
  }
}

function addToBag() {
  if (productOutOfStock.value) return;
  if (!canAdd.value) {
    showSelectionError.value = true;
    return;
  }
  addSelectionToCart();
}

function buyNow() {
  if (productOutOfStock.value) return;
  if (!canAdd.value) {
    showSelectionError.value = true;
    return;
  }
  addSelectionToCart();
  cart.closeCart();
  router.push("/checkout");
}
</script>

<template>
  <div>
    <fieldset v-if="isMatrix">
      <template v-if="requireColor">
        <legend class="eyebrow mb-2">Color</legend>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Select a color">
          <button
            v-for="color in product.colorOptions"
            :key="color.id"
            type="button"
            role="radio"
            :aria-checked="selectedColorId === color.id"
            :aria-disabled="!colorInStock(color.id)"
            :disabled="!colorInStock(color.id)"
            class="inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            :class="selectedColorId === color.id ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
            @click="selectColor(color.id)"
          >
            <span
              v-if="color.hexCode"
              class="h-3.5 w-3.5 shrink-0 rounded-pill border border-line"
              :style="{ backgroundColor: color.hexCode }"
            />
            {{ color.name }}
            <span v-if="!colorInStock(color.id)" class="sr-only">(out of stock)</span>
          </button>
        </div>
      </template>

      <template v-if="requireSize">
        <legend class="eyebrow mb-2 mt-6 flex w-full items-center justify-between gap-3">
          Size
          <RouterLink
            to="/support#size-guide"
            class="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs font-semibold transition-colors hover:border-ink"
          >
            <ShoeIcon class="h-4 w-4" />
            View size guide
          </RouterLink>
        </legend>
        <div class="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2" role="radiogroup" aria-label="Select a size">
          <button
            v-for="size in product.sizeOptions"
            :key="size.id"
            type="button"
            role="radio"
            :aria-checked="selectedSizeId === size.id"
            :aria-disabled="!sizeInStock(size.id)"
            :disabled="!sizeInStock(size.id)"
            class="min-h-[var(--tap-min)] rounded-md border text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            :class="selectedSizeId === size.id ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'"
            @click="selectMatrixSize(size.id)"
          >
            {{ size.name }}
            <span v-if="!sizeInStock(size.id)" class="sr-only">(out of stock)</span>
          </button>
        </div>
      </template>

      <p v-if="showSelectionError" class="mt-2 text-sm text-sale" role="alert">{{ selectionErrorText }}</p>
    </fieldset>

    <fieldset v-else>
      <legend class="eyebrow mb-2 flex w-full items-center justify-between gap-3">
        Size
        <RouterLink
          to="/support#size-guide"
          class="inline-flex min-h-[var(--tap-min)] items-center gap-2 rounded-md border border-line px-3 text-xs font-semibold transition-colors hover:border-ink"
        >
          <ShoeIcon class="h-4 w-4" />
          View size guide
        </RouterLink>
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
          @click="selectSiblingSize(size.value, size.inStock)"
        >
          {{ size.value }}
          <span v-if="!size.inStock" class="sr-only">(out of stock)</span>
        </button>
      </div>
      <p v-if="showSelectionError" class="mt-2 text-sm text-sale" role="alert">{{ selectionErrorText }}</p>
    </fieldset>

    <div class="mt-6 flex max-w-sm flex-col gap-3 sm:flex-row">
      <BaseButton
        variant="ghost"
        class="flex-1 !px-5 text-sm"
        :disabled="productOutOfStock || (!canAdd && showSelectionError)"
        @click="addToBag"
      >
        Add to bag
      </BaseButton>
      <BaseButton class="flex-1 !px-5 text-sm" :disabled="productOutOfStock" @click="buyNow">Buy now</BaseButton>
    </div>
  </div>
</template>
