<script setup lang="ts">
import { computed } from "vue";
import { freeReturnsMessage } from "@/content/nav";
import { useFreeShippingLine } from "@/lib/freeDelivery";

const freeShippingLine = useFreeShippingLine();
const message = computed(() => [freeShippingLine.value, freeReturnsMessage].filter(Boolean).join(" "));
</script>

<template>
  <div class="bg-ink text-paper">
    <p class="eyebrow container py-2 text-center !text-paper/90">
      {{ message }}
    </p>
  </div>
</template>
