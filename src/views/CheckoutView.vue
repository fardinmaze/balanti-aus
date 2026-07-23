<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useCart, type CartLine } from "@/lib/cart";
import { getProduct, type Product } from "@/lib/products";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";

const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING = 12.95;
const GST_RATE = 0.1; // AU GST — product prices are GST-inclusive

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

const shipping = computed(() =>
  cart.subtotal.value >= FREE_SHIPPING_THRESHOLD || cart.subtotal.value === 0 ? 0 : FLAT_SHIPPING
);
const total = computed(() => cart.subtotal.value + shipping.value);
const gstIncluded = computed(() => total.value - total.value / (1 + GST_RATE));

const form = reactive({
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  suburb: "",
  state: "",
  postcode: "",
  phone: "",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
});

type Step = "delivery" | "payment" | "review";
const STEPS: Step[] = ["delivery", "payment", "review"];
const stepIndex = ref(0);

function statusOf(step: Step): "active" | "complete" | "upcoming" {
  const i = STEPS.indexOf(step);
  if (i < stepIndex.value) return "complete";
  if (i === stepIndex.value) return "active";
  return "upcoming";
}

const deliveryComplete = computed(
  () =>
    !!(
      form.email.trim() &&
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.address.trim() &&
      form.suburb.trim() &&
      form.state.trim() &&
      form.postcode.trim() &&
      form.phone.trim()
    )
);

const paymentComplete = computed(
  () => !!(form.cardName.trim() && form.cardNumber.trim() && form.expiry.trim() && form.cvc.trim())
);

const formError = ref("");
const isProcessing = ref(false);

function continueToPayment() {
  if (!deliveryComplete.value) {
    formError.value = "Fill in every delivery field to continue.";
    return;
  }
  formError.value = "";
  stepIndex.value = 1;
}

function continueToReview() {
  if (!paymentComplete.value) {
    formError.value = "Fill in every payment field to continue — this is a demo form, but it mirrors a real checkout.";
    return;
  }
  formError.value = "";
  stepIndex.value = 2;
}

function editStep(step: Step) {
  stepIndex.value = STEPS.indexOf(step);
}

// Simulated payment gateway — no card data leaves this browser tab and
// nothing here is transmitted or stored. Swap for a real processor
// (Stripe/Afterpay) before taking real orders.
async function placeOrder() {
  isProcessing.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const orderId = `BAL-${Date.now().toString(36).toUpperCase()}`;
  const orderTotal = total.value;
  cart.clear();

  router.push({
    name: "checkout-confirmation",
    query: { order: orderId, total: orderTotal.toFixed(0) },
  });
}

const cardLast4 = computed(() => form.cardNumber.replace(/\s/g, "").slice(-4));

const fieldClass =
  "min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted";
</script>

<template>
  <section class="!pt-10 sm:!pt-14">
    <div class="container">
      <div v-if="lineItems.length === 0" class="max-w-md text-center sm:mx-auto">
        <h1>Your bag is empty</h1>
        <p class="mt-2 text-muted">Add a pair before checking out.</p>
        <RouterLink to="/" class="mt-4 inline-block underline">Continue shopping</RouterLink>
      </div>

      <template v-else>
        <h1 class="text-center">Checkout</h1>

        <div class="mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">
          <div class="order-2 lg:order-1">
            <!-- Delivery Options -->
            <div class="border-b border-line pb-8">
              <div class="flex items-center justify-between">
                <h2
                  class="font-display text-xl font-semibold"
                  :class="statusOf('delivery') === 'upcoming' && 'text-muted'"
                >
                  Delivery Options
                </h2>
                <button
                  v-if="statusOf('delivery') === 'complete'"
                  type="button"
                  class="text-sm font-medium underline"
                  @click="editStep('delivery')"
                >
                  Edit
                </button>
              </div>

              <p v-if="statusOf('delivery') === 'complete'" class="mt-3 text-sm text-muted">
                {{ form.firstName }} {{ form.lastName }} · {{ form.address }}, {{ form.suburb }} {{ form.state }}
                {{ form.postcode }}
              </p>

              <form v-if="statusOf('delivery') === 'active'" class="mt-6" @submit.prevent="continueToPayment">
                <div class="grid gap-4">
                  <div>
                    <label for="email" class="sr-only">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      required
                      placeholder="Email*"
                      :class="fieldClass"
                    />
                  </div>
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label for="firstName" class="sr-only">First name</label>
                      <input
                        id="firstName"
                        v-model="form.firstName"
                        type="text"
                        required
                        placeholder="First Name*"
                        :class="fieldClass"
                      />
                    </div>
                    <div>
                      <label for="lastName" class="sr-only">Last name</label>
                      <input
                        id="lastName"
                        v-model="form.lastName"
                        type="text"
                        required
                        placeholder="Last Name*"
                        :class="fieldClass"
                      />
                    </div>
                  </div>
                  <div>
                    <label for="address" class="sr-only">Street address</label>
                    <input
                      id="address"
                      v-model="form.address"
                      type="text"
                      required
                      placeholder="Street Address*"
                      :class="fieldClass"
                    />
                  </div>
                  <div class="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label for="suburb" class="sr-only">Suburb</label>
                      <input
                        id="suburb"
                        v-model="form.suburb"
                        type="text"
                        required
                        placeholder="Suburb*"
                        :class="fieldClass"
                      />
                    </div>
                    <div>
                      <label for="state" class="sr-only">State</label>
                      <input
                        id="state"
                        v-model="form.state"
                        type="text"
                        required
                        placeholder="State*"
                        :class="fieldClass"
                      />
                    </div>
                    <div>
                      <label for="postcode" class="sr-only">Postcode</label>
                      <input
                        id="postcode"
                        v-model="form.postcode"
                        type="text"
                        inputmode="numeric"
                        required
                        placeholder="Postcode*"
                        :class="fieldClass"
                      />
                    </div>
                  </div>
                  <div class="sm:w-1/2 sm:pr-2">
                    <label for="phone" class="sr-only">Phone number</label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      type="tel"
                      required
                      placeholder="Phone Number*"
                      :class="fieldClass"
                    />
                  </div>
                </div>

                <p v-if="formError" class="mt-4 text-sm text-sale" role="alert">{{ formError }}</p>

                <div class="mt-8 flex justify-end">
                  <button
                    type="submit"
                    class="min-h-[var(--tap-min)] rounded-pill bg-ink px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Save &amp; Continue
                  </button>
                </div>
              </form>
            </div>

            <!-- Payment -->
            <div class="border-b border-line py-8">
              <div class="flex items-center justify-between">
                <h2
                  class="font-display text-xl font-semibold"
                  :class="statusOf('payment') === 'upcoming' && 'text-muted'"
                >
                  Payment
                </h2>
                <button
                  v-if="statusOf('payment') === 'complete'"
                  type="button"
                  class="text-sm font-medium underline"
                  @click="editStep('payment')"
                >
                  Edit
                </button>
              </div>

              <p v-if="statusOf('payment') === 'complete'" class="mt-3 text-sm text-muted">
                Card ending {{ cardLast4 || "····" }}
              </p>

              <template v-if="statusOf('payment') === 'active'">
                <div class="mt-4 rounded-md border border-line bg-surface p-4">
                  <p class="eyebrow mb-1">Demo checkout</p>
                  <p class="text-sm text-muted">
                    This form simulates a payment gateway for preview purposes. No real charge is made and no card
                    details are stored or transmitted — enter anything.
                  </p>
                </div>

                <form class="mt-6 grid gap-4" @submit.prevent="continueToReview">
                  <div>
                    <label for="cardName" class="sr-only">Name on card</label>
                    <input
                      id="cardName"
                      v-model="form.cardName"
                      type="text"
                      required
                      placeholder="Name on Card*"
                      :class="fieldClass"
                    />
                  </div>
                  <div>
                    <label for="cardNumber" class="sr-only">Card number</label>
                    <input
                      id="cardNumber"
                      v-model="form.cardNumber"
                      type="text"
                      inputmode="numeric"
                      required
                      placeholder="Card Number* (0000 0000 0000 0000)"
                      :class="fieldClass"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-4 sm:w-1/2">
                    <div>
                      <label for="expiry" class="sr-only">Expiry</label>
                      <input
                        id="expiry"
                        v-model="form.expiry"
                        type="text"
                        required
                        placeholder="MM/YY*"
                        :class="fieldClass"
                      />
                    </div>
                    <div>
                      <label for="cvc" class="sr-only">CVC</label>
                      <input
                        id="cvc"
                        v-model="form.cvc"
                        type="text"
                        inputmode="numeric"
                        required
                        placeholder="CVC*"
                        :class="fieldClass"
                      />
                    </div>
                  </div>

                  <p v-if="formError" class="text-sm text-sale" role="alert">{{ formError }}</p>

                  <div class="mt-2 flex justify-end">
                    <button
                      type="submit"
                      class="min-h-[var(--tap-min)] rounded-pill bg-ink px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                      Save &amp; Continue
                    </button>
                  </div>
                </form>
              </template>
            </div>

            <!-- Order Review -->
            <div class="pt-8">
              <h2
                class="font-display text-xl font-semibold"
                :class="statusOf('review') === 'upcoming' && 'text-muted'"
              >
                Order Review
              </h2>

              <template v-if="statusOf('review') === 'active'">
                <div class="mt-6 space-y-4 text-sm">
                  <div class="flex justify-between border-b border-line pb-4">
                    <div>
                      <p class="eyebrow">Deliver to</p>
                      <p class="mt-1">
                        {{ form.firstName }} {{ form.lastName }} · {{ form.address }}, {{ form.suburb }}
                        {{ form.state }} {{ form.postcode }}
                      </p>
                    </div>
                    <button type="button" class="shrink-0 font-medium underline" @click="editStep('delivery')">
                      Edit
                    </button>
                  </div>
                  <div class="flex justify-between border-b border-line pb-4">
                    <div>
                      <p class="eyebrow">Payment</p>
                      <p class="mt-1">Card ending {{ cardLast4 || "····" }}</p>
                    </div>
                    <button type="button" class="shrink-0 font-medium underline" @click="editStep('payment')">
                      Edit
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  class="mt-8 min-h-[var(--tap-min)] w-full rounded-pill bg-accent px-6 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  :disabled="isProcessing"
                  @click="placeOrder"
                >
                  {{ isProcessing ? "Processing…" : `Place Order — ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(total)} (demo)` }}
                </button>
              </template>
            </div>
          </div>

          <aside class="order-1 h-fit lg:order-2">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">In Your Bag</h2>
              <RouterLink to="/cart" class="text-sm font-medium underline">Edit</RouterLink>
            </div>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <PriceTag :amount="cart.subtotal.value" />
              </div>
              <div class="flex justify-between">
                <span>Delivery</span>
                <span v-if="shipping === 0">Free</span>
                <PriceTag v-else :amount="shipping" />
              </div>
              <div class="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <span>Total</span>
                <PriceTag :amount="total" />
              </div>
              <p class="text-xs text-muted">Inclusive of {{ Math.round(GST_RATE * 100) }}% GST (<PriceTag :amount="gstIncluded" />)</p>
            </div>

            <div class="mt-5 border-t border-line pt-5">
              <p v-if="shipping === 0" class="text-sm font-semibold">Free shipping — arrives in 3–5 business days</p>
              <p v-else class="text-sm font-semibold">Standard delivery — arrives in 3–5 business days</p>

              <ul class="mt-4 space-y-4">
                <li v-for="{ line, product } in lineItems" :key="`${line.handle}-${line.size}`" class="flex gap-3">
                  <div class="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="product.name"
                      class="h-full w-full object-cover"
                    />
                    <PlaceholderImage v-else :tone="product.tone" :label="product.name" class="h-full w-full" />
                  </div>
                  <div class="flex-1">
                    <PriceTag :amount="product.price" class="text-sm" />
                    <p class="text-sm font-semibold">{{ product.name }}</p>
                    <p class="text-sm text-muted">{{ product.colorway }}</p>
                    <p class="text-sm text-muted">Qty: {{ line.qty }} | Size: {{ line.size }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>
