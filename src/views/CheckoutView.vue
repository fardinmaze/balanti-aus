<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCart } from "@/lib/cart";
import { clearPendingPayment, savePendingPayment, useCheckout } from "@/lib/checkout";
import {
  computeOrderTotals,
  parsePricingCorrection,
  PRICE_MISMATCH_MESSAGE,
  qualifiesForFreeDelivery,
  type CouponRule,
  type OrderTotals,
  type PricingCorrection,
} from "@/lib/pricing";
import { useAuth } from "@/lib/auth";
import { useAddress, addressLines } from "@/lib/address";
import { ApiError } from "@/api/http";
import type { AddressShape } from "@/api/address";
import type { PlaceOrderPayload } from "@/api/checkout";
import type { PaymentMethod, ShippingMethod } from "@/api/types";
import type { CartLine } from "@/store/modules/cart";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";
import PriceTag from "@/components/ui/Price.vue";
import BaseButton from "@/components/ui/BaseButton.vue";

const cart = useCart();
const checkout = useCheckout();
const auth = useAuth();
const address = useAddress();
const router = useRouter();

onMounted(() => {
  checkout.fetchConfig();
  if (auth.isAuthenticated.value) address.fetchAddresses();
});

const couponCode = ref("");
const couponApplied = ref<CouponRule | null>(null);
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

// null (not 150, or any other guessed number) until GET /site-api/free-delivery
// actually resolves — a stale/guessed default previously made carts between the
// old and new threshold (e.g. $200-$400 vs a real $500 limit) wrongly qualify.
const freeShippingThreshold = computed(() => checkout.freeDelivery.value?.amount ?? null);
// Assessed on the subtotal before any coupon — the backend's rule for
// `shipping_type: 0`, which it re-checks when the order is placed.
const qualifiesForFreeShipping = computed(
  () => cart.subtotal.value === 0 || qualifiesForFreeDelivery(cart.subtotal.value, freeShippingThreshold.value)
);

// Every method from the backend is offered, above the free-delivery threshold too
// (its charge is just waived there).
const deliveryMethods = computed(() => checkout.shippingMethods.value);

const selectedShippingId = ref<number | null>(null);
// Defaults to the first method that carries a delivery charge, so a $0 option
// (e.g. "In Store Purchase") is only used when the shopper picks it. Immediate,
// since methods are cached in the store and may already be loaded.
watch(
  deliveryMethods,
  (methods) => {
    if (!methods.length) return;
    if (!methods.some((m: ShippingMethod) => m.id === selectedShippingId.value)) {
      selectedShippingId.value = (methods.find((m: ShippingMethod) => (m.charge ?? 0) > 0) ?? methods[0]).id;
    }
  },
  { immediate: true }
);

const selectedShipping = computed(() =>
  deliveryMethods.value.find((m: ShippingMethod) => m.id === selectedShippingId.value)
);
const shippingCharge = computed(() => selectedShipping.value?.charge ?? 0);
// The delivery method is always the one the shopper picked; free delivery only
// zeroes its charge in the totals (lib/pricing.ts), it isn't a method of its own.
const shippingType = computed(() => selectedShippingId.value ?? 0);
const needsShippingMethod = computed(() => !selectedShipping.value);

const selectedPaymentId = ref<number | null>(null);
watch(
  () => checkout.paymentMethods.value,
  (methods) => {
    if (methods.length && selectedPaymentId.value === null) selectedPaymentId.value = methods[0].id;
  },
  { immediate: true }
);
const selectedPayment = computed(() =>
  checkout.paymentMethods.value.find((m: PaymentMethod) => m.id === selectedPaymentId.value)
);

function isCardMethod(method: PaymentMethod | undefined) {
  return method?.gateway === "stripe";
}

// Prices are GST-inclusive (guide §4/§5.4): GST is only extracted per line for
// display and the order payload — never added on top of the total.
function lineVatTotal(line: CartLine) {
  const rate = line.price / (1 + line.vat / 100);
  return (line.price - rate) * line.qty;
}

const gstIncluded = computed(() => cart.lines.value.reduce((sum: number, line: CartLine) => sum + lineVatTotal(line), 0));

// What the shopper is shown, what goes in the payload, and what the
// backend's own repricing must agree with to the cent (lib/pricing.ts).
const computedTotals = computed(() =>
  computeOrderTotals({
    lines: cart.lines.value,
    coupon: couponApplied.value,
    freeDeliveryThreshold: freeShippingThreshold.value,
    shippingCharge: shippingCharge.value,
    paymentCharge: selectedPayment.value?.charge ?? 0,
  })
);

// After a "total does not match" rejection, the backend's figures win — but
// only while the order still looks exactly like the one it repriced.
const pricingInputsKey = computed(() =>
  JSON.stringify([
    cart.lines.value.map((l: CartLine) => [l.itemId, l.size, l.qty, l.price]),
    couponApplied.value,
    shippingType.value,
    selectedPaymentId.value,
  ])
);
const priceCorrection = ref<{ key: string; pricing: PricingCorrection; pricesChanged: boolean } | null>(null);
const correctionActive = computed(() => priceCorrection.value?.key === pricingInputsKey.value);

const totals = computed<OrderTotals>(() => {
  const base = computedTotals.value;
  // Free delivery is checked first and always wins: at or above the threshold
  // delivery is $0, even if a rejected order came back with a delivery charge.
  // The corrected item prices are already in the cart, so `base` reflects them.
  if (!correctionActive.value || base.freeDelivery) return base;
  const p = priceCorrection.value!.pricing;
  return {
    ...base,
    subtotal: p.subtotal ?? base.subtotal,
    discount: p.discount ?? base.discount,
    shipping: p.shipping ?? base.shipping,
    paymentCharge: p.paymentCharge ?? base.paymentCharge,
    total: p.total ?? base.total,
  };
});

function applyPricingCorrection(data: unknown) {
  const pricing = parsePricingCorrection(data);
  if (!pricing) return;
  const pricesChanged = pricing.items.some((item) =>
    cart.lines.value.some((l: CartLine) => l.itemId === item.itemId && l.price !== item.price)
  );
  for (const item of pricing.items) cart.setItemPrice(item.itemId, item.price);
  // Keyed on the repriced cart, so editing the bag/coupon/method drops it.
  priceCorrection.value = { key: pricingInputsKey.value, pricing, pricesChanged };
}

// Only claim "prices have changed" when an item's price actually did.
const showPriceChangeNotice = computed(() => correctionActive.value && priceCorrection.value!.pricesChanged);

// Guest checkout only — the backend reads `customer_data` solely when there's
// no Authorization header (guide §5.4); logged-in orders carry an `address`
// row id instead (see below).
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

const deliveryNote = ref("");

// Logged-in checkout: pick a saved address book row (defaulting to the
// customer's `is_default` one), or add a new one inline.
const visibleAddresses = computed(() => address.addresses.value.filter((a) => addressLines(a.address).length > 0));
const selectedAddressId = ref<number | null>(null);
const addingAddress = ref(false);

watch(
  visibleAddresses,
  (list) => {
    if (!auth.isAuthenticated.value) return;
    if (selectedAddressId.value !== null && list.some((a) => a.id === selectedAddressId.value)) return;
    const preferred = list.find((a) => a.is_default) ?? list[0];
    if (preferred) {
      selectedAddressId.value = preferred.id;
      addingAddress.value = false;
    } else {
      selectedAddressId.value = null;
      addingAddress.value = true;
    }
  },
  { immediate: true }
);

const selectedAddress = computed(() => visibleAddresses.value.find((a) => a.id === selectedAddressId.value));

function emptyAddressForm(): AddressShape {
  return { full_name: "", line1: "", line2: "", suburb: "", state: "", postcode: "", country: "Australia", phone: "" };
}
const newAddressForm = reactive(emptyAddressForm());
const newAddressSaving = ref(false);
const newAddressError = ref("");

function startAddingAddress() {
  Object.assign(newAddressForm, emptyAddressForm());
  newAddressError.value = "";
  addingAddress.value = true;
}

function cancelAddingAddress() {
  addingAddress.value = false;
  newAddressError.value = "";
}

async function saveNewAddress() {
  newAddressSaving.value = true;
  newAddressError.value = "";
  try {
    const created = await address.addAddress({ ...newAddressForm });
    if (created) {
      selectedAddressId.value = created.id;
      addingAddress.value = false;
    }
  } catch (e) {
    newAddressError.value = e instanceof ApiError ? e.message : "Couldn't save that address.";
  } finally {
    newAddressSaving.value = false;
  }
}

const deliveryComplete = computed(() => {
  if (auth.isAuthenticated.value) return selectedAddressId.value !== null && !addingAddress.value;
  return !!(
    form.email.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.address.trim() &&
    form.suburb.trim() &&
    form.state.trim() &&
    form.postcode.trim() &&
    form.phone.trim()
  );
});

const formError = ref("");

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function inDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Set synchronously on the first click — `checkout.placing` alone leaves a
// gap before the disabled attribute renders, and a double click = two orders.
const submitting = ref(false);
const redirectingToPayment = ref(false);

// Browser Back from Stripe's page can restore this page from the bfcache with
// the button still locked — unlock it.
function onPageShow(e: PageTransitionEvent) {
  if (!e.persisted) return;
  submitting.value = false;
  redirectingToPayment.value = false;
}
onMounted(() => window.addEventListener("pageshow", onPageShow));
onBeforeUnmount(() => window.removeEventListener("pageshow", onPageShow));

async function placeOrder() {
  if (submitting.value) return;
  formError.value = "";
  if (!deliveryComplete.value) {
    formError.value = "Fill in every delivery field before placing your order.";
    return;
  }
  if (needsShippingMethod.value) {
    formError.value = deliveryMethods.value.length
      ? "Choose a delivery method before placing your order."
      : "We couldn't load delivery options. Refresh the page and try again.";
    return;
  }
  submitting.value = true;
  try {
    const orderTotals = totals.value;
    const payload: PlaceOrderPayload = {
      order_data: {
        so_date: todayIso(),
        shipment_date: inDaysIso(3),
        order_note: "",
        order_tnc: "",
      },
      order_cart: {
        shipping_type: shippingType.value,
        payment_type: selectedPaymentId.value ?? 0,
        delivery_note: deliveryNote.value.trim(),
        discount_type: couponApplied.value?.type ?? null,
        discount_value: couponApplied.value?.value ?? 0,
        discount_amount: orderTotals.discount,
        shipping_value: orderTotals.shipping,
        shipping_amount: orderTotals.shipping,
        payment_value: orderTotals.paymentCharge,
        payment_amount: orderTotals.paymentCharge,
        adjustment: 0,
        subtotal: orderTotals.subtotal,
        total: orderTotals.total,
        cart_items: cart.lines.value.map((line: CartLine) => ({
          item_id: line.itemId,
          quantity: line.qty,
          product_price: line.price,
          vat: line.vat,
          vat_total: lineVatTotal(line),
          ...(line.colorId != null ? { color: line.colorId } : {}),
          ...(line.sizeId != null ? { size: line.sizeId } : {}),
        })),
      },
      // Logged in: a real address-book row id (or 0 for the account's default).
      // Guest: always 0 — there's no address book to point at.
      address: auth.isAuthenticated.value ? (selectedAddressId.value ?? 0) : 0,
      coupon_code: couponApplied.value ? couponCode.value.trim() : "",
    };

    if (auth.isAuthenticated.value) {
      // Sourced from the account + the selected address book row, not typed —
      // the delivery step only asks a guest to fill this in by hand.
      const addr = (selectedAddress.value?.address ?? {}) as Record<string, unknown>;
      const user = auth.user.value;
      payload.customer_data = {
        full_name: String(addr.full_name ?? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()),
        email: user?.email_address ?? "",
        phone: String(addr.phone ?? user?.phone_number ?? ""),
        line1: String(addr.line1 ?? ""),
        city: String(addr.suburb ?? ""),
        area: String(addr.state ?? ""),
      };
    } else {
      payload.customer_data = {
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        line1: form.address,
        city: form.suburb,
        area: form.state,
      };
    }

    const result = await checkout.placeOrder(payload);

    // Stripe: the order now exists as PENDING_PAYMENT. Keep the bag — it's only
    // cleared once the confirmation page sees the payment as PAID.
    if (result.payment_url) {
      savePendingPayment({ orderId: result.order_id, sessionId: result.session_id ?? "" });
      redirectingToPayment.value = true;
      window.location.assign(result.payment_url);
      return;
    }

    // No payment_url: an offline (Cash on Delivery) order — done.
    const orderId = result.order_id;
    cart.clear();
    submitting.value = false;

    router.push({
      name: "checkout-confirmation",
      query: { order: orderId, total: orderTotals.total.toFixed(0) },
    });
  } catch (e) {
    submitting.value = false;
    if (e instanceof ApiError && e.message.startsWith(PRICE_MISMATCH_MESSAGE)) {
      applyPricingCorrection(e.data);
      if (totals.value.freeDelivery && !priceCorrection.value?.pricesChanged) {
        formError.value = "We couldn't place your order with free delivery. Please try again shortly or contact us.";
        return;
      }
    }
    formError.value = e instanceof ApiError ? e.message : "Something went wrong placing your order.";
  }
}

// Stripe's cancel URL (`/checkout?cancelled=1`) — nothing was charged and the
// bag is untouched; placing the order again creates a fresh one.
const route = useRoute();
const paymentCancelled = computed(() => route.query.cancelled === "1");
watch(
  paymentCancelled,
  (cancelled) => {
    if (cancelled) clearPendingPayment();
  },
  { immediate: true }
);
function dismissCancelled() {
  router.replace({ query: {} });
}

const formatAud = (amount: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

const placeOrderLabel = computed(() => {
  if (redirectingToPayment.value) return "Redirecting to secure payment…";
  if (submitting.value || checkout.placing.value) return "Placing order…";
  const verb = isCardMethod(selectedPayment.value) ? "Pay" : "Place Order";
  return `${verb} — ${formatAud(totals.value.total)}`;
});

const fieldClass =
  "min-h-[52px] w-full rounded-md border border-line bg-surface px-4 text-sm placeholder:text-muted";
</script>

<template>
  <section class="!pt-10 sm:!pt-14">
    <div class="container">
      <div
        v-if="paymentCancelled"
        class="mx-auto mb-8 flex max-w-2xl items-start justify-between gap-4 rounded-md border border-line bg-surface px-4 py-3 text-sm"
        role="status"
      >
        <p><span class="font-semibold">Payment cancelled.</span> You have not been charged.</p>
        <button type="button" class="shrink-0 underline" @click="dismissCancelled">Dismiss</button>
      </div>

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

        <div class="mt-12 grid gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
          <div class="order-2 lg:order-1">
            <!-- Delivery -->
            <div>
              <h2 class="font-display text-xl font-semibold">Delivery Details</h2>

              <div class="mt-3">
                <label for="deliveryNote" class="mb-2 block text-sm font-semibold">Delivery note (optional)</label>
                <textarea
                  id="deliveryNote"
                  v-model="deliveryNote"
                  rows="2"
                  placeholder="e.g. Leave with building concierge, ring the doorbell twice…"
                  class="w-full rounded-md border border-line bg-surface px-4 py-3 text-sm placeholder:text-muted"
                />
              </div>

              <!-- Logged in: pick a saved address, defaulting to is_default -->
              <div v-if="auth.isAuthenticated.value" class="mt-3">
                <p v-if="address.loading.value && !visibleAddresses.length" class="text-sm text-muted">
                  Loading your addresses…
                </p>

                <div v-if="visibleAddresses.length && !addingAddress" class="space-y-3">
                  <label
                    v-for="addr in visibleAddresses"
                    :key="addr.id"
                    class="flex cursor-pointer items-start gap-3 rounded-md border p-4 text-sm"
                    :class="selectedAddressId === addr.id ? 'border-ink' : 'border-line'"
                  >
                    <input
                      v-model="selectedAddressId"
                      type="radio"
                      name="deliveryAddress"
                      :value="addr.id"
                      class="mt-1 h-4 w-4 accent-[var(--ink)]"
                    />
                    <span class="flex-1">
                      <span class="flex items-center gap-2 font-semibold">
                        <span>{{ addressLines(addr.address)[0] }}</span>
                        <span
                          v-if="addr.is_default"
                          class="rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-white"
                        >
                          Default
                        </span>
                      </span>
                      <span v-for="(line, i) in addressLines(addr.address).slice(1)" :key="i" class="block text-muted">
                        {{ line }}
                      </span>
                    </span>
                  </label>

                  <button type="button" class="text-sm font-semibold underline" @click="startAddingAddress">
                    + Deliver to a different address
                  </button>
                </div>

                <form v-if="addingAddress" class="space-y-4" :class="visibleAddresses?.length ? 'mt-4' : ''" @submit.prevent="saveNewAddress">
                  <input v-model="newAddressForm.full_name" type="text" required placeholder="Full Name*" :class="fieldClass" />
                  <input v-model="newAddressForm.line1" type="text" required placeholder="Street Address*" :class="fieldClass" />
                  <input v-model="newAddressForm.line2" type="text" placeholder="Apt / Suite" :class="fieldClass" />
                  <div class="grid gap-4 sm:grid-cols-3">
                    <input v-model="newAddressForm.suburb" type="text" required placeholder="Suburb*" :class="fieldClass" />
                    <input v-model="newAddressForm.state" type="text" required placeholder="State*" :class="fieldClass" />
                    <input
                      v-model="newAddressForm.postcode"
                      type="text"
                      inputmode="numeric"
                      required
                      placeholder="Postcode*"
                      :class="fieldClass"
                    />
                  </div>
                  <input v-model="newAddressForm.phone" type="tel" required placeholder="Phone*" :class="fieldClass" />
                  <p v-if="newAddressError" class="text-sm text-sale" role="alert">{{ newAddressError }}</p>
                  <div class="flex gap-3">
                    <BaseButton type="submit" :disabled="newAddressSaving">
                      {{ newAddressSaving ? "Saving…" : "Save address" }}
                    </BaseButton>
                    <BaseButton v-if="visibleAddresses.length" type="button" variant="ghost" @click="cancelAddingAddress">
                      Cancel
                    </BaseButton>
                  </div>
                </form>
              </div>

              <!-- Guest: type the delivery address by hand -->
              <div v-else class="mt-6">
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
              </div>
            </div>

            <!-- Delivery method — at or above the free-delivery threshold the charge is waived in the totals -->
            <div class="mt-10">
              <h2 class="font-display text-xl font-semibold">Delivery Method</h2>
              <p
                v-if="qualifiesForFreeShipping && cart.subtotal.value > 0"
                class="mt-3 rounded-md bg-surface px-4 py-3 text-sm font-semibold"
                role="status"
              >
                You've got free delivery on this order.
              </p>
              <div v-if="deliveryMethods.length" class="mt-3 space-y-3">
                <label
                  v-for="method in deliveryMethods"
                  :key="method.id"
                  class="flex cursor-pointer items-center gap-3 rounded-md border p-4 text-sm"
                  :class="selectedShippingId === method.id ? 'border-ink' : 'border-line'"
                >
                  <input
                    v-model="selectedShippingId"
                    type="radio"
                    name="shippingMethod"
                    :value="method.id"
                    class="h-4 w-4 accent-[var(--ink)]"
                  />
                  <span class="flex flex-1 items-center justify-between gap-2 font-semibold">
                    <span>{{ method.name }}</span>
                    <PriceTag :amount="qualifiesForFreeShipping ? 0 : (method.charge ?? 0)" class="font-normal" />
                  </span>
                </label>
                <p v-if="freeShippingThreshold && !qualifiesForFreeShipping" class="text-xs text-muted">
                  Free delivery on orders of <PriceTag :amount="freeShippingThreshold" /> or more.
                </p>
              </div>
              <p v-else-if="checkout.configLoaded.value" class="mt-3 text-sm text-sale" role="alert">
                We couldn't load delivery options. Refresh the page and try again.
              </p>
            </div>

            <!-- Payment — Stripe vs offline is decided by `gateway`, never by name -->
            <div v-if="checkout.paymentMethods.value.length" class="mt-10">
              <h2 class="font-display text-xl font-semibold">Payment</h2>
              <div class="mt-3 space-y-3">
                <label
                  v-for="method in checkout.paymentMethods.value"
                  :key="method.id"
                  class="flex cursor-pointer items-start gap-3 rounded-md border p-4 text-sm"
                  :class="selectedPaymentId === method.id ? 'border-ink' : 'border-line'"
                >
                  <input
                    v-model="selectedPaymentId"
                    type="radio"
                    name="paymentMethod"
                    :value="method.id"
                    class="mt-1 h-4 w-4 accent-[var(--ink)]"
                  />
                  <span class="flex-1">
                    <span class="flex items-center justify-between gap-2 font-semibold">
                      <span>{{ isCardMethod(method) ? "Pay by card" : method.name }}</span>
                      <PriceTag v-if="method.charge" :amount="method.charge" class="font-normal" />
                    </span>
                    <span v-if="isCardMethod(method)" class="block text-muted">
                      You'll be taken to Stripe's secure page to pay. We never see your card details.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <aside class="order-1 h-fit lg:order-2">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">In Your Bag</h2>
              <RouterLink to="/cart" class="text-sm font-medium underline">Edit</RouterLink>
            </div>

            <div class="mt-4">
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

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <PriceTag :amount="totals.subtotal" />
              </div>
              <div v-if="couponApplied || totals.discount > 0" class="flex justify-between">
                <span>Discount</span>
                <span>-<PriceTag :amount="totals.discount" /></span>
              </div>

              <div class="flex justify-between">
                <span>Delivery</span>
                <PriceTag :amount="totals.shipping" />
              </div>

              <div v-if="totals.paymentCharge > 0" class="flex justify-between">
                <span>Payment fee</span>
                <PriceTag :amount="totals.paymentCharge" />
              </div>

              <div class="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <span>Total</span>
                <PriceTag :amount="totals.total" />
              </div>
              <p class="text-xs text-muted">Includes <PriceTag :amount="gstIncluded" /> GST</p>
            </div>

            <p v-if="showPriceChangeNotice" class="mt-4 rounded-md bg-surface px-4 py-3 text-sm" role="status">
              Prices have changed since you added these items. Your bag now shows the current prices — check the
              total above, then place your order again.
            </p>
            <p v-if="formError" class="mt-4 text-sm text-sale" role="alert">{{ formError }}</p>

            <button
              type="button"
              class="mt-4 min-h-[var(--tap-min)] w-full rounded-pill bg-accent px-6 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              :disabled="submitting || checkout.placing.value"
              @click="placeOrder"
            >
              {{ placeOrderLabel }}
            </button>

            <div class="mt-5 border-t border-line pt-5">
              <p class="text-sm font-semibold">Standard delivery — arrives in 3–5 business days</p>

              <ul class="mt-4 space-y-4">
                <li v-for="line in cart.lines.value" :key="`${line.handle}-${line.size}`" class="flex gap-3">
                  <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
                    <img v-if="line.thumbnail" :src="line.thumbnail" :alt="line.name" class="h-full w-full object-cover" />
                    <PlaceholderImage v-else :tone="line.tone" :label="line.name" class="h-full w-full" />
                  </div>
                  <div class="flex-1">
                    <PriceTag :amount="line.price" class="text-sm" />
                    <p class="text-sm font-semibold">{{ line.name }}</p>
                    <p class="text-sm text-muted">{{ line.colorway }}</p>
                    <p v-if="line.sku" class="text-sm text-muted">SKU: {{ line.sku }}</p>
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
