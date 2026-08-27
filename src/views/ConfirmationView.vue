<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import BaseButton from "@/components/ui/BaseButton.vue";

const route = useRoute();
const orderId = computed(() => String(route.query.order ?? ""));
const total = computed(() => Number(route.query.total ?? 0));
</script>

<template>
  <section class="!pt-12 sm:!pt-20">
    <div class="container max-w-md text-center">
      <template v-if="orderId">
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
        <p class="mt-2 text-muted">Looks like you navigated here directly.</p>
        <BaseButton to="/" class="mt-6">Back to home</BaseButton>
      </template>
    </div>
  </section>
</template>
