<script setup lang="ts">
import { computed } from "vue";
import { useCart, type CartLine } from "@/lib/cart";
import { getProduct, type Product } from "@/lib/products";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

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
  <section class="!pt-8 sm:!pt-12">
    <div class="container max-w-3xl">
      <h1>Your bag</h1>

      <p v-if="lineItems.length === 0" class="mt-4 text-muted">
        Your bag is empty.
        <RouterLink to="/" class="underline">Continue shopping</RouterLink>
      </p>

      <template v-else>
        <ul class="mt-6 divide-y divide-line border-y border-line">
          <li v-for="{ line, product } in lineItems" :key="`${line.handle}-${line.size}`" class="flex gap-4 py-5">
            <div class="h-28 w-24 shrink-0 overflow-hidden rounded-md">
              <PlaceholderImage :tone="product.tone" :label="product.name" class="h-full w-full" />
            </div>
            <div class="flex flex-1 flex-col">
              <div class="flex justify-between gap-4">
                <div>
                  <RouterLink :to="`/products/${product.handle}`" class="font-semibold hover:underline">
                    {{ product.name }}
                  </RouterLink>
                  <p class="eyebrow mt-1">{{ product.colorway }} · {{ line.size }}</p>
                </div>
                <PriceTag :amount="product.price * line.qty" class="text-sm font-semibold" />
              </div>
              <div class="mt-auto flex items-center gap-2 pt-3">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-md border border-line"
                  aria-label="Decrease quantity"
                  @click="cart.updateQty(line.handle, line.size, line.qty - 1)"
                >
                  −
                </button>
                <span class="w-6 text-center text-sm">{{ line.qty }}</span>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-md border border-line"
                  aria-label="Increase quantity"
                  @click="cart.updateQty(line.handle, line.size, line.qty + 1)"
                >
                  +
                </button>
                <button
                  type="button"
                  class="ml-4 text-xs text-muted underline hover:text-ink"
                  @click="cart.removeItem(line.handle, line.size)"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        </ul>

        <div class="mt-6 flex items-center justify-between">
          <span class="font-medium text-muted">Subtotal</span>
          <PriceTag :amount="cart.subtotal.value" class="text-xl font-semibold" />
        </div>
        <BaseButton to="/checkout" class="mt-6 w-full sm:w-auto">Checkout</BaseButton>
      </template>
    </div>
  </section>
</template>
