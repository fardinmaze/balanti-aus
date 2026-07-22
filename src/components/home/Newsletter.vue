<script setup lang="ts">
import { ref } from "vue";

type Status = "idle" | "submitting" | "success" | "error";

const email = ref("");
const status = ref<Status>("idle");
const errorMessage = ref("");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * No backend exists yet (see WORKPLAN.md) — this simulates the round trip
 * so the flow can be demoed end to end. Swap the setTimeout for a real
 * call (Klaviyo/Resend/etc.) once an ESP is chosen.
 */
async function submit() {
  if (!EMAIL_RE.test(email.value.trim())) {
    status.value = "error";
    errorMessage.value = "Enter a valid email address.";
    return;
  }

  status.value = "submitting";
  await new Promise((resolve) => setTimeout(resolve, 700));
  status.value = "success";
}
</script>

<template>
  <section>
    <div class="container max-w-xl text-center">
      <h2>Stay in the loop</h2>
      <p class="mt-2 text-muted">New styles, restocks, and first access to drops.</p>

      <form v-if="status !== 'success'" class="mt-6 flex flex-col gap-3 sm:flex-row" @submit.prevent="submit">
        <label for="newsletter-email" class="sr-only">Email address</label>
        <input
          id="newsletter-email"
          v-model="email"
          type="email"
          required
          placeholder="you@example.com"
          class="min-h-[var(--tap-min)] flex-1 rounded-md border border-line bg-surface px-4 text-sm"
          :aria-invalid="status === 'error'"
          aria-describedby="newsletter-error"
        />
        <button
          type="submit"
          class="min-h-[var(--tap-min)] rounded-pill bg-accent px-6 text-sm font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
          :disabled="status === 'submitting'"
        >
          {{ status === "submitting" ? "Joining…" : "Join" }}
        </button>
      </form>

      <p v-if="status === 'error'" id="newsletter-error" class="mt-2 text-sm text-sale" role="alert">
        {{ errorMessage }}
      </p>
      <p v-if="status === 'success'" class="mt-4 text-sm text-success" role="status">
        You're on the list — thanks for joining.
      </p>
      <p class="mt-3 text-xs text-muted">Demo form — not yet wired to an email service.</p>
    </div>
  </section>
</template>
