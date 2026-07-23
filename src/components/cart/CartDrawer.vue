<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useCart, type CartLine } from "@/lib/cart";
import { getProduct, type Product } from "@/lib/products";
import PriceTag from "@/components/ui/Price.vue";
import BaseButton from "@/components/ui/BaseButton.vue";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";

const cart = useCart();

type LineItem = { line: CartLine; product: Product };

const lineItems = computed<LineItem[]>(() =>
  cart.lines.value
    .map((line) => {
      const product = getProduct(line.handle);
      return product ? { line, product } : null;
    })
    .filter((item): item is LineItem => item !== null)
);
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="cart.isOpen.value" class="fixed inset-0 z-50 bg-black/40" @click="cart.closeCart()" />
    </Transition>
    <Transition name="slide">
      <aside
        v-if="cart.isOpen.value"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-paper shadow-[var(--shadow-card)]"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 class="font-display text-lg font-semibold">Your bag</h2>
          <button
            type="button"
            class="inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md"
            aria-label="Close bag"
            @click="cart.closeCart()"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <p v-if="lineItems.length === 0" class="text-sm text-muted">
            Your bag is empty — start with the Oxford or the Loafer.
          </p>

          <ul v-else class="space-y-4">
            <li v-for="{ line, product } in lineItems" :key="`${line.handle}-${line.size}`" class="flex gap-3">
              <div class="h-20 w-16 shrink-0 overflow-hidden rounded-md">
                <PlaceholderImage :tone="product.tone" :label="product.name" class="h-full w-full" />
              </div>
              <div class="flex flex-1 flex-col gap-1">
                <p class="text-sm font-semibold">{{ product.name }}</p>
                <p class="eyebrow">{{ product.colorway }} · {{ line.size }}</p>
                <div class="mt-auto flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-md border border-line text-sm"
                      aria-label="Decrease quantity"
                      @click="cart.updateQty(line.handle, line.size, line.qty - 1)"
                    >
                      −
                    </button>
                    <span class="w-4 text-center text-sm">{{ line.qty }}</span>
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-md border border-line text-sm"
                      aria-label="Increase quantity"
                      @click="cart.updateQty(line.handle, line.size, line.qty + 1)"
                    >
                      +
                    </button>
                  </div>
                  <PriceTag :amount="product.price * line.qty" class="text-sm" />
                </div>
                <button
                  type="button"
                  class="self-start text-xs text-muted underline hover:text-ink"
                  @click="cart.removeItem(line.handle, line.size)"
                >
                  Remove
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="lineItems.length > 0" class="border-t border-line px-5 py-4">
          <div class="mb-4 flex items-center justify-between">
            <span class="text-sm font-medium text-muted">Subtotal</span>
            <PriceTag :amount="cart.subtotal.value" class="text-base font-semibold" />
          </div>
          <BaseButton to="/checkout" class="w-full !text-white" @click="cart.closeCart()">Checkout</BaseButton>
          <p class="mt-3 text-center text-xs text-muted">Free shipping over $150 · Free 30-day returns</p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--dur-mid) var(--ease);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform var(--dur-mid) var(--ease);
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-enter-active,
  .slide-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
