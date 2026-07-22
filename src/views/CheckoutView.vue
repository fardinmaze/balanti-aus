<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart, type CartLine } from "@/lib/cart";
import { getProduct, type Product } from "@/lib/products";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 12.95;

const cart = useCart();
const router = useRouter();

type LineItem = { line: CartLine; product: Product };

const lineItems = computed<LineItem[]>(() =>
  cart.lines.value
    .map((line) => {
      const product = getProduct(line.handle);
      return product ? { line, product } : null;
    })
    .filter((item): item is LineItem => item !== null)
);

const shipping = computed(() => (cart.subtotal.value >= FREE_SHIPPING_THRESHOLD || cart.subtotal.value === 0 ? 0 : FLAT_SHIPPING));
const total = computed(() => cart.subtotal.value + shipping.value);

const form = reactive({
  email: "",
  fullName: "",
  address: "",
  suburb: "",
  state: "",
  postcode: "",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
});

const isProcessing = ref(false);
const formError = ref("");

function requiredFieldsFilled() {
  return Object.values(form).every((v) => v.trim().length > 0);
}

async function placeOrder() {
  formError.value = "";

  if (!requiredFieldsFilled()) {
    formError.value = "Fill in every field to continue — this is a demo form, but it mirrors a real checkout.";
    return;
  }

  isProcessing.value = true;

  // Simulated payment gateway — no card data leaves this browser tab and
  // nothing here is transmitted or stored. Swap for a real processor
  // (Stripe/Afterpay) before taking real orders.
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const orderId = `BAL-${Date.now().toString(36).toUpperCase()}`;
  const orderTotal = total.value;
  cart.clear();

  router.push({
    name: "checkout-confirmation",
    query: { order: orderId, total: orderTotal.toFixed(0) },
  });
}
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container">
      <div v-if="lineItems.length === 0" class="max-w-md">
        <h1>Your bag is empty</h1>
        <p class="mt-2 text-muted">Add a pair before checking out.</p>
        <RouterLink to="/" class="mt-4 inline-block underline">Continue shopping</RouterLink>
      </div>

      <div v-else class="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
        <form class="order-2 lg:order-1" @submit.prevent="placeOrder">
          <div class="rounded-md border border-line bg-surface p-4">
            <p class="eyebrow mb-1">Demo checkout</p>
            <p class="text-sm text-muted">
              This form simulates a payment gateway for preview purposes. No real charge is made and no card details
              are stored or transmitted — enter anything.
            </p>
          </div>

          <fieldset class="mt-8">
            <legend class="mb-3 font-display text-lg font-semibold">Contact</legend>
            <label for="email" class="mb-1 block text-sm font-medium">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
            />
          </fieldset>

          <fieldset class="mt-8">
            <legend class="mb-3 font-display text-lg font-semibold">Shipping address</legend>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="fullName" class="mb-1 block text-sm font-medium">Full name</label>
                <input
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  required
                  class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                />
              </div>
              <div class="sm:col-span-2">
                <label for="address" class="mb-1 block text-sm font-medium">Street address</label>
                <input
                  id="address"
                  v-model="form.address"
                  type="text"
                  required
                  class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                />
              </div>
              <div>
                <label for="suburb" class="mb-1 block text-sm font-medium">Suburb</label>
                <input
                  id="suburb"
                  v-model="form.suburb"
                  type="text"
                  required
                  class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="state" class="mb-1 block text-sm font-medium">State</label>
                  <input
                    id="state"
                    v-model="form.state"
                    type="text"
                    required
                    class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                  />
                </div>
                <div>
                  <label for="postcode" class="mb-1 block text-sm font-medium">Postcode</label>
                  <input
                    id="postcode"
                    v-model="form.postcode"
                    type="text"
                    inputmode="numeric"
                    required
                    class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset class="mt-8">
            <legend class="mb-3 font-display text-lg font-semibold">Payment (demo)</legend>
            <div class="grid gap-4">
              <div>
                <label for="cardName" class="mb-1 block text-sm font-medium">Name on card</label>
                <input
                  id="cardName"
                  v-model="form.cardName"
                  type="text"
                  required
                  class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                />
              </div>
              <div>
                <label for="cardNumber" class="mb-1 block text-sm font-medium">Card number</label>
                <input
                  id="cardNumber"
                  v-model="form.cardNumber"
                  type="text"
                  inputmode="numeric"
                  placeholder="0000 0000 0000 0000"
                  required
                  class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="expiry" class="mb-1 block text-sm font-medium">Expiry</label>
                  <input
                    id="expiry"
                    v-model="form.expiry"
                    type="text"
                    placeholder="MM/YY"
                    required
                    class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                  />
                </div>
                <div>
                  <label for="cvc" class="mb-1 block text-sm font-medium">CVC</label>
                  <input
                    id="cvc"
                    v-model="form.cvc"
                    type="text"
                    inputmode="numeric"
                    placeholder="000"
                    required
                    class="min-h-[var(--tap-min)] w-full rounded-md border border-line bg-surface px-4 text-sm"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <p v-if="formError" class="mt-4 text-sm text-sale" role="alert">{{ formError }}</p>

          <button
            type="submit"
            class="mt-8 min-h-[var(--tap-min)] w-full rounded-pill bg-accent px-6 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-60"
            :disabled="isProcessing"
          >
            {{ isProcessing ? "Processing…" : `Pay ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(total)} (demo)` }}
          </button>
        </form>

        <aside class="order-1 h-fit rounded-md border border-line bg-surface p-5 lg:order-2">
          <h2 class="mb-4 text-lg font-semibold">Order summary</h2>
          <ul class="space-y-4">
            <li v-for="{ line, product } in lineItems" :key="`${line.handle}-${line.size}`" class="flex gap-3">
              <div class="relative h-16 w-14 shrink-0 overflow-hidden rounded-md">
                <PlaceholderImage :tone="product.tone" :label="product.name" class="h-full w-full" />
                <span
                  class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-pill bg-ink text-[10px] font-semibold text-paper"
                >
                  {{ line.qty }}
                </span>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium">{{ product.name }}</p>
                <p class="eyebrow">{{ product.colorway }} · {{ line.size }}</p>
              </div>
              <PriceTag :amount="product.price * line.qty" class="text-sm" />
            </li>
          </ul>

          <div class="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div class="flex justify-between text-muted">
              <span>Subtotal</span>
              <PriceTag :amount="cart.subtotal.value" />
            </div>
            <div class="flex justify-between text-muted">
              <span>Shipping</span>
              <span v-if="shipping === 0">Free</span>
              <PriceTag v-else :amount="shipping" />
            </div>
            <div class="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <span>Total</span>
              <PriceTag :amount="total" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
