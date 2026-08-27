<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "@/lib/cart";
import { useCheckout } from "@/lib/checkout";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/api/http";
import type { PaymentMethod, ShippingMethod } from "@/api/types";
import type { CartLine } from "@/store/modules/cart";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";

const cart = useCart();
const checkout = useCheckout();
const auth = useAuth();
const router = useRouter();

onMounted(() => checkout.fetchConfig());

const freeShippingThreshold = computed(() => checkout.freeDelivery.value?.amount ?? 150);
const qualifiesForFreeShipping = computed(
  () => cart.subtotal.value >= freeShippingThreshold.value || cart.subtotal.value === 0
);

const selectedShippingId = ref<number | null>(null);
watch(
  () => checkout.shippingMethods.value,
  (methods) => {
    if (!qualifiesForFreeShipping.value && methods.length && selectedShippingId.value === null) {
      selectedShippingId.value = methods[0].id;
    }
  }
);

const shippingAmount = computed(() => {
  if (qualifiesForFreeShipping.value) return 0;
  const method = checkout.shippingMethods.value.find((m: ShippingMethod) => m.id === selectedShippingId.value);
  return method?.amount ?? method?.price ?? 0;
});
const shippingType = computed(() => (qualifiesForFreeShipping.value ? 0 : (selectedShippingId.value ?? 0)));

const selectedPaymentId = ref<number | null>(null);
watch(
  () => checkout.paymentMethods.value,
  (methods) => {
    if (methods.length && selectedPaymentId.value === null) selectedPaymentId.value = methods[0].id;
  },
  { immediate: true }
);

const couponCode = ref("");
const couponApplied = ref<{ type: string; value: number } | null>(null);
const couponError = ref("");
const couponLoading = ref(false);

async function applyCoupon() {
  if (!couponCode.value.trim()) return;
  couponLoading.value = true;
  couponError.value = "";
  try {
    const data = (await checkout.validateCoupon(couponCode.value.trim(), cart.subtotal.value)) as Record<string, unknown>;
    couponApplied.value = { type: String(data.coupon_type ?? ""), value: Number(data.coupon_value ?? 0) };
  } catch (e) {
    couponApplied.value = null;
    couponError.value = e instanceof ApiError ? e.message : "That coupon isn't valid.";
  } finally {
    couponLoading.value = false;
  }
}

function removeCoupon() {
  couponApplied.value = null;
  couponCode.value = "";
  couponError.value = "";
}

const discountAmount = computed(() => {
  if (!couponApplied.value) return 0;
  const amount =
    couponApplied.value.type.toLowerCase() === "percentage"
      ? cart.subtotal.value * (couponApplied.value.value / 100)
      : couponApplied.value.value;
  return Math.min(amount, cart.subtotal.value);
});

const total = computed(() => cart.subtotal.value - discountAmount.value + shippingAmount.value);

const gstIncluded = computed(() =>
  cart.lines.value.reduce((sum: number, line: CartLine) => {
    const rate = line.price / (1 + line.vat / 100);
    return sum + (line.price - rate) * line.qty;
  }, 0)
);

const form = reactive({
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  suburb: "",
  state: "",
  postcode: "",
  phone: "",
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

const paymentComplete = computed(() => selectedPaymentId.value !== null);

const formError = ref("");

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
    formError.value = "Choose a payment method to continue.";
    return;
  }
  formError.value = "";
  stepIndex.value = 2;
}

function editStep(step: Step) {
  stepIndex.value = STEPS.indexOf(step);
}

const selectedPaymentMethod = computed(() =>
  checkout.paymentMethods.value.find((m: PaymentMethod) => m.id === selectedPaymentId.value)
);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function inDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function placeOrder() {
  formError.value = "";
  try {
    const result = await checkout.placeOrder({
      order_data: {
        so_date: todayIso(),
        shipment_date: inDaysIso(3),
        order_note: "",
        order_tnc: "",
      },
      order_cart: {
        shipping_type: shippingType.value,
        payment_type: selectedPaymentId.value ?? 0,
        discount_type: couponApplied.value?.type ?? null,
        discount_value: couponApplied.value?.value ?? 0,
        discount_amount: discountAmount.value,
        shipping_value: shippingAmount.value,
        shipping_amount: shippingAmount.value,
        payment_value: total.value,
        payment_amount: total.value,
        adjustment: 0,
        subtotal: cart.subtotal.value,
        total: total.value,
        cart_items: cart.lines.value.map((line: CartLine) => {
          const rate = line.price / (1 + line.vat / 100);
          const vatTotal = (line.price - rate) * line.qty;
          return {
            item_id: line.itemId,
            quantity: line.qty,
            product_price: line.price,
            vat: line.vat,
            vat_total: vatTotal,
          };
        }),
      },
      address: 0,
      coupon_code: couponApplied.value ? couponCode.value.trim() : "",
      customer_data: {
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        line1: form.address,
        city: form.suburb,
        area: form.state,
      },
    });

    const orderId = result.order_id;
    const orderTotal = total.value;
    cart.clear();

    router.push({
      name: "checkout-confirmation",
      query: { order: orderId, total: orderTotal.toFixed(0) },
    });
  } catch (e) {
    formError.value = e instanceof ApiError ? e.message : "Something went wrong placing your order.";
  }
}

const fieldClass =
  "min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted";
</script>

<template>
  <section class="!pt-10 sm:!pt-14">
    <div class="container">
      <div v-if="cart.lines.value.length === 0" class="max-w-md text-center sm:mx-auto">
        <h1>Your bag is empty</h1>
        <p class="mt-2 text-muted">Add a pair before checking out.</p>
        <RouterLink to="/" class="mt-4 inline-block underline">Continue shopping</RouterLink>
      </div>

      <template v-else>
        <h1 class="text-center">Checkout</h1>
        <p v-if="!auth.isAuthenticated.value" class="mt-2 text-center text-sm text-muted">
          Checking out as a guest.
          <RouterLink to="/account/login" class="underline">Sign in</RouterLink> for faster checkout next time.
        </p>

        <div class="mt-12 grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-20">
          <div class="order-2 lg:order-1">
            <!-- Delivery -->
            <div class="border-b border-line pb-8">
              <div class="flex items-center justify-between">
                <h2
                  class="font-display text-xl font-semibold"
                  :class="statusOf('delivery') === 'upcoming' && 'text-muted'"
                >
                  Delivery Details
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
                    <input id="email" v-model="form.email" type="email" required placeholder="Email*" :class="fieldClass" />
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
                      <input id="suburb" v-model="form.suburb" type="text" required placeholder="Suburb*" :class="fieldClass" />
                    </div>
                    <div>
                      <label for="state" class="sr-only">State</label>
                      <input id="state" v-model="form.state" type="text" required placeholder="State*" :class="fieldClass" />
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
                    <input id="phone" v-model="form.phone" type="tel" required placeholder="Phone Number*" :class="fieldClass" />
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

            <!-- Shipping & Payment -->
            <div class="border-b border-line py-8">
              <div class="flex items-center justify-between">
                <h2
                  class="font-display text-xl font-semibold"
                  :class="statusOf('payment') === 'upcoming' && 'text-muted'"
                >
                  Shipping &amp; Payment
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
                {{ selectedPaymentMethod?.name ?? "Payment method" }}
              </p>

              <template v-if="statusOf('payment') === 'active'">
                <div class="mt-6">
                  <p class="eyebrow mb-3">Shipping method</p>
                  <p v-if="qualifiesForFreeShipping" class="text-sm">Free Delivery — arrives in 3–5 business days</p>
                  <div v-else-if="checkout.shippingMethods.value.length" class="space-y-2">
                    <label
                      v-for="method in checkout.shippingMethods.value"
                      :key="method.id"
                      class="flex min-h-[var(--tap-min)] items-center justify-between rounded-md border border-line px-4 text-sm"
                    >
                      <span class="flex items-center gap-3">
                        <input v-model="selectedShippingId" type="radio" :value="method.id" name="shipping" />
                        {{ method.name }}
                      </span>
                      <PriceTag :amount="method.amount ?? method.price ?? 0" />
                    </label>
                  </div>
                  <p v-else class="text-sm text-muted">
                    You're ${{ (freeShippingThreshold - cart.subtotal.value).toFixed(0) }} away from free delivery.
                  </p>
                </div>

                <div class="mt-6">
                  <p class="eyebrow mb-3">Payment method</p>
                  <div v-if="checkout.paymentMethods.value.length" class="space-y-2">
                    <label
                      v-for="method in checkout.paymentMethods.value"
                      :key="method.id"
                      class="flex min-h-[var(--tap-min)] items-center gap-3 rounded-md border border-line px-4 text-sm"
                    >
                      <input v-model="selectedPaymentId" type="radio" :value="method.id" name="payment" />
                      {{ method.name }}
                    </label>
                    <p class="text-xs text-muted">Online payment isn't available yet — pay when your order arrives.</p>
                  </div>
                  <p v-else class="text-sm text-muted">No payment methods are available right now.</p>
                </div>

                <div class="mt-6">
                  <p class="eyebrow mb-3">Coupon code</p>
                  <div v-if="couponApplied" class="flex items-center justify-between rounded-md border border-line px-4 py-3 text-sm">
                    <span>{{ couponCode }} applied</span>
                    <button type="button" class="underline" @click="removeCoupon">Remove</button>
                  </div>
                  <div v-else class="flex gap-3">
                    <input v-model="couponCode" type="text" placeholder="Enter code" :class="fieldClass" />
                    <button
                      type="button"
                      class="shrink-0 rounded-md border border-line px-5 text-sm font-semibold disabled:opacity-50"
                      :disabled="couponLoading || !couponCode.trim()"
                      @click="applyCoupon"
                    >
                      {{ couponLoading ? "Checking…" : "Apply" }}
                    </button>
                  </div>
                  <p v-if="couponError" class="mt-2 text-sm text-sale" role="alert">{{ couponError }}</p>
                </div>

                <p v-if="formError" class="mt-4 text-sm text-sale" role="alert">{{ formError }}</p>

                <div class="mt-8 flex justify-end">
                  <button
                    type="button"
                    class="min-h-[var(--tap-min)] rounded-pill bg-ink px-8 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    @click="continueToReview"
                  >
                    Save &amp; Continue
                  </button>
                </div>
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
                      <p class="mt-1">{{ selectedPaymentMethod?.name ?? "—" }}</p>
                    </div>
                    <button type="button" class="shrink-0 font-medium underline" @click="editStep('payment')">
                      Edit
                    </button>
                  </div>
                </div>

                <p v-if="formError" class="mt-4 text-sm text-sale" role="alert">{{ formError }}</p>

                <button
                  type="button"
                  class="mt-8 min-h-[var(--tap-min)] w-full rounded-pill bg-accent px-6 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  :disabled="checkout.placing.value"
                  @click="placeOrder"
                >
                  {{ checkout.placing.value ? "Placing order…" : `Place Order — ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(total)}` }}
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
              <div v-if="couponApplied" class="flex justify-between">
                <span>Discount</span>
                <span>-<PriceTag :amount="discountAmount" /></span>
              </div>
              <div class="flex justify-between">
                <span>Delivery</span>
                <span v-if="shippingAmount === 0">Free</span>
                <PriceTag v-else :amount="shippingAmount" />
              </div>
              <div class="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <span>Total</span>
                <PriceTag :amount="total" />
              </div>
              <p class="text-xs text-muted">Includes <PriceTag :amount="gstIncluded" /> GST</p>
            </div>

            <div class="mt-5 border-t border-line pt-5">
              <p v-if="shippingAmount === 0" class="text-sm font-semibold">Free shipping — arrives in 3–5 business days</p>
              <p v-else class="text-sm font-semibold">Standard delivery — arrives in 3–5 business days</p>

              <ul class="mt-4 space-y-4">
                <li v-for="line in cart.lines.value" :key="`${line.handle}-${line.size}`" class="flex gap-3">
                  <div class="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-surface">
                    <img v-if="line.image" :src="line.image" :alt="line.name" class="h-full w-full object-cover" />
                    <PlaceholderImage v-else :tone="line.tone" :label="line.name" class="h-full w-full" />
                  </div>
                  <div class="flex-1">
                    <PriceTag :amount="line.price" class="text-sm" />
                    <p class="text-sm font-semibold">{{ line.name }}</p>
                    <p class="text-sm text-muted">{{ line.colorway }}</p>
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
