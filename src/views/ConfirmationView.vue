<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { ApiError } from "@/api/http";
import { useCart } from "@/lib/cart";
import { clearPendingPayment, useCheckout } from "@/lib/checkout";
import BaseButton from "@/components/ui/BaseButton.vue";
import Spinner from "@/components/ui/Spinner.vue";

const route = useRoute();
const cart = useCart();
const checkout = useCheckout();

// Cash on Delivery: CheckoutView routes here with `?order=&total=` once the order exists.
const orderId = computed(() => String(route.query.order ?? ""));
const total = computed(() => Number(route.query.total ?? 0));

// Stripe: its success URL lands here with `?session_id=cs_...`. Landing here
// does NOT mean the payment worked — only the backend's status does (the
// webhook can trail the redirect by a few seconds), so poll until it's final.
// Polling only reads, so a refresh just re-checks.
const sessionId = computed(() => String(route.query.session_id ?? ""));

type PaymentState = "checking" | "paid" | "failed" | "processing" | "error";
const paymentState = ref<PaymentState>("checking");
const paidOrderId = ref("");
const paidTotal = ref(0);

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let pollStartedAt = 0;
let stopped = false;

function stopPolling() {
  stopped = true;
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = null;
}

function scheduleNextPoll() {
  if (stopped) return;
  if (Date.now() - pollStartedAt >= POLL_TIMEOUT_MS) {
    paymentState.value = "processing";
    stopPolling();
    return;
  }
  pollTimer = setTimeout(pollStatus, POLL_INTERVAL_MS);
}

async function pollStatus() {
  try {
    const result = await checkout.fetchStripeSessionStatus(sessionId.value);
    if (stopped) return;
    if (result.status === "PAID") {
      paidOrderId.value = result.order_id;
      paidTotal.value = result.total_amount;
      paymentState.value = "paid";
      cart.clear();
      clearPendingPayment();
      stopPolling();
      return;
    }
    if (result.status === "FAILED" || result.status === "EXPIRED") {
      paymentState.value = "failed";
      clearPendingPayment();
      stopPolling();
      return;
    }
    scheduleNextPoll();
  } catch (e) {
    if (stopped) return;
    // `code: 400` ("Unknown session_id") is final; anything else (network
    // blip, 5xx) is worth another try until the timeout.
    if (e instanceof ApiError && e.code !== undefined) {
      paymentState.value = "error";
      stopPolling();
      return;
    }
    scheduleNextPoll();
  }
}

onMounted(() => {
  if (!sessionId.value) return;
  pollStartedAt = Date.now();
  pollStatus();
});
onBeforeUnmount(stopPolling);

const formatAud = (amount: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
</script>

<template>
  <section class="!pt-12 sm:!pt-20">
    <div class="container max-w-md text-center">
      <!-- Stripe: card payment result -->
      <template v-if="sessionId">
        <template v-if="paymentState === 'checking'">
          <h1 class="font-display text-3xl font-semibold">Confirming your payment…</h1>
          <Spinner label="Checking with our payment provider" />
          <p class="text-sm text-muted">This usually takes a few seconds. Please keep this page open.</p>
        </template>

        <template v-else-if="paymentState === 'paid'">
          <p class="eyebrow mb-4 text-success">Payment received</p>
          <h1 class="font-display text-3xl font-semibold">Thanks — you're all set.</h1>
          <p class="mt-3 text-muted">
            Order <span class="font-mono text-ink">{{ paidOrderId }}</span> for {{ formatAud(paidTotal) }} is
            confirmed. We'll email you the details.
          </p>
          <BaseButton to="/" class="mt-8">Continue browsing</BaseButton>
        </template>

        <template v-else-if="paymentState === 'failed'">
          <h1 class="font-display text-3xl font-semibold">Payment did not go through</h1>
          <p class="mt-3 text-muted">You have not been charged. Your bag is still saved, so you can try again.</p>
          <BaseButton to="/checkout" class="mt-8">Back to checkout</BaseButton>
        </template>

        <template v-else-if="paymentState === 'processing'">
          <h1 class="font-display text-3xl font-semibold">Your payment is being processed</h1>
          <p class="mt-3 text-muted">We'll email you once it's confirmed.</p>
          <BaseButton to="/account" class="mt-8">View my orders</BaseButton>
        </template>

        <template v-else>
          <h1 class="font-display text-3xl font-semibold">We couldn't find that payment</h1>
          <p class="mt-3 text-muted">Check My Orders for the latest status of your order.</p>
          <BaseButton to="/account" class="mt-8">View my orders</BaseButton>
        </template>
      </template>

      <!-- Cash on Delivery -->
      <template v-else-if="orderId">
        <p class="eyebrow mb-4 text-success">Order confirmed</p>
        <h1 class="font-display text-3xl font-semibold">Thanks — you're all set.</h1>
        <p class="mt-3 text-muted">
          Order <span class="font-mono text-ink">{{ orderId }}</span> for
          {{ new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(total) }}
          is on its way. We'll email you the details.
        </p>
        <BaseButton to="/" class="mt-8">Continue browsing</BaseButton>
      </template>

      <template v-else>
        <h1>No order to show</h1>
        <p class="mt-2 text-muted">We couldn't find an order or payment to show here.</p>
        <BaseButton to="/account" class="mt-6">View my orders</BaseButton>
      </template>
    </div>
  </section>
</template>
