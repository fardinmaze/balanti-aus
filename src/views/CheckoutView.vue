<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCart } from "@/lib/cart";
import { useCheckout } from "@/lib/checkout";
import { useAuth } from "@/lib/auth";
import { useAddress, addressLines } from "@/lib/address";
import { ApiError } from "@/api/http";
import type { AddressShape } from "@/api/address";
import type { PlaceOrderPayload } from "@/api/checkout";
import type { ShippingMethod } from "@/api/types";
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

// null (not 150, or any other guessed number) until GET /site-api/free-delivery
// actually resolves — a stale/guessed default previously made carts between the
// old and new threshold (e.g. $200-$400 vs a real $500 limit) wrongly qualify.
const freeShippingThreshold = computed(() => checkout.freeDelivery.value?.amount ?? null);
const qualifiesForFreeShipping = computed(() => {
  if (freeShippingThreshold.value === null) return false;
  return cart.subtotal.value >= freeShippingThreshold.value || cart.subtotal.value === 0;
});

const selectedShippingId = ref<number | null>(null);
watch(
  () => checkout.shippingMethods.value,
  (methods) => {
    if (!qualifiesForFreeShipping.value && methods.length && selectedShippingId.value === null) {
      selectedShippingId.value = methods[0].id;
    }
  }
);

// Guests can't load real shipping methods (GET /shipping-methods requires a
// Customer JWT and 401s for them) — flat fallback instead of silently
// defaulting to $0/"Free" whenever no method is available to price from.
const STATIC_DELIVERY_FEE = 50;
const shippingAmount = computed(() => {
  if (qualifiesForFreeShipping.value) return 0;
  const method = checkout.shippingMethods.value.find((m: ShippingMethod) => m.id === selectedShippingId.value);
  return method?.amount ?? method?.price ?? STATIC_DELIVERY_FEE;
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

// GET /site-api/vat-status → { vat, inclusive }. Inclusive: line.price already
// carries GST, so it's just extracted for display/the order payload — nothing
// is added to the total. Exclusive: line.price is ex-GST, so GST is computed
// on top (using the store-wide vat % from vat-status, not the per-product
// Product.vat field) and added to the total.
const vatInclusive = computed(() => checkout.vat.value?.inclusive ?? true);
const vatRate = computed(() => checkout.vat.value?.vat ?? 0);

function lineVatRate(line: CartLine) {
  return vatInclusive.value ? line.vat : vatRate.value;
}

function lineVatTotal(line: CartLine) {
  if (vatInclusive.value) {
    const rate = line.price / (1 + line.vat / 100);
    return (line.price - rate) * line.qty;
  }
  return line.price * (vatRate.value / 100) * line.qty;
}

const gstIncluded = computed(() => cart.lines.value.reduce((sum: number, line: CartLine) => sum + lineVatTotal(line), 0));

const total = computed(() => {
  const base = cart.subtotal.value - discountAmount.value + shippingAmount.value;
  return vatInclusive.value ? base : base + gstIncluded.value;
});

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

async function placeOrder() {
  formError.value = "";
  if (!deliveryComplete.value) {
    formError.value = "Fill in every delivery field before placing your order.";
    return;
  }
  try {
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
        discount_amount: discountAmount.value,
        shipping_value: shippingAmount.value,
        shipping_amount: shippingAmount.value,
        payment_value: total.value,
        payment_amount: total.value,
        adjustment: 0,
        subtotal: cart.subtotal.value,
        total: total.value,
        cart_items: cart.lines.value.map((line: CartLine) => ({
          item_id: line.itemId,
          quantity: line.qty,
          product_price: line.price,
          vat: lineVatRate(line),
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

                <form v-if="addingAddress" class="space-y-4" :class="visibleAddresses.length && 'mt-4'" @submit.prevent="saveNewAddress">
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
              <div v-if="!vatInclusive" class="flex justify-between">
                <span>GST</span>
                <PriceTag :amount="gstIncluded" />
              </div>
              <div class="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <span>Total</span>
                <PriceTag :amount="total" />
              </div>
              <p v-if="vatInclusive" class="text-xs text-muted">Includes <PriceTag :amount="gstIncluded" /> GST</p>
            </div>

            <p v-if="formError" class="mt-4 text-sm text-sale" role="alert">{{ formError }}</p>

            <button
              type="button"
              class="mt-4 min-h-[var(--tap-min)] w-full rounded-pill bg-accent px-6 text-sm font-semibold !text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              :disabled="checkout.placing.value"
              @click="placeOrder"
            >
              {{ checkout.placing.value ? "Placing order…" : `Place Order — ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(total)}` }}
            </button>

            <div class="mt-5 border-t border-line pt-5">
              <p v-if="shippingAmount === 0" class="text-sm font-semibold">Free shipping — arrives in 3–5 business days</p>
              <p v-else class="text-sm font-semibold">Standard delivery — arrives in 3–5 business days</p>

              <ul class="mt-4 space-y-4">
                <li v-for="line in cart.lines.value" :key="`${line.handle}-${line.size}`" class="flex gap-3">
                  <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface">
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
