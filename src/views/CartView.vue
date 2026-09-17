<script setup lang="ts">
import { useCart } from "@/lib/cart";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const cart = useCart();
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container max-w-3xl">
      <h1>Your bag</h1>

      <p v-if="cart.lines.value.length === 0" class="mt-4 text-muted">
        Your bag is empty.
        <RouterLink to="/" class="underline">Continue shopping</RouterLink>
      </p>

      <template v-else>
        <ul class="mt-6 divide-y divide-line border-y border-line">
          <li v-for="line in cart.lines.value" :key="`${line.handle}-${line.size}`" class="flex gap-4 py-5">
            <div class="h-28 w-24 shrink-0 overflow-hidden rounded-md">
              <img v-if="line.thumbnail" :src="line.thumbnail" :alt="line.name" class="h-full w-full object-cover" />
              <PlaceholderImage v-else :tone="line.tone" :label="line.name" class="h-full w-full" />
            </div>
            <div class="flex flex-1 flex-col">
              <div class="flex justify-between gap-4">
                <div>
                  <RouterLink :to="`/products/${line.handle}`" class="font-semibold hover:underline">
                    {{ line.name }}
                  </RouterLink>
                  <p class="eyebrow mt-1">{{ line.colorway }} · {{ line.size }}</p>
                </div>
                <PriceTag :amount="line.price * line.qty" class="text-sm font-semibold" />
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
