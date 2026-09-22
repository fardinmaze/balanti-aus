<script setup lang="ts">
import { ref } from "vue";
import type { Product } from "@/types/product";
import DeliveryIcon from "@/components/ui/icons/DeliveryIcon.vue";
import ReturnIcon from "@/components/ui/icons/ReturnIcon.vue";

defineProps<{ product: Product }>();

type TabKey = "details" | "materials" | "delivery" | "return";
const TABS: { key: TabKey; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "materials", label: "Materials" },
  { key: "delivery", label: "Delivery" },
  { key: "return", label: "Returns" },
];

const active = ref<TabKey>("details");
</script>

<template>
  <div>
    <div role="tablist" aria-label="Product information" class="flex flex-wrap gap-x-6 gap-y-2 border-b border-line">
      <button
        v-for="tab in TABS"
        :key="tab.key"
        type="button"
        role="tab"
        :id="`product-tab-${tab.key}`"
        :aria-selected="active === tab.key"
        :aria-controls="`product-tabpanel-${tab.key}`"
        class="eyebrow -mb-px border-b-2 pb-3 transition-colors"
        :class="active === tab.key ? 'border-ink text-ink' : 'border-transparent hover:text-ink'"
        @click="active = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div
      v-if="active === 'details'"
      id="product-tabpanel-details"
      role="tabpanel"
      aria-labelledby="product-tab-details"
      class="pt-6 text-sm leading-7 text-muted"
    >
      <div v-if="product.details">
        <p v-html="product.details"></p>
      </div>
      <p v-else>No further details available for this product.</p>
    </div>

    <div
      v-else-if="active === 'materials'"
      id="product-tabpanel-materials"
      role="tabpanel"
      aria-labelledby="product-tab-materials"
      class="pt-6 text-sm leading-7 text-muted"
    >
      <p v-if="product.material" v-html="product.material"></p>
      <p v-else>Material information isn't available for this product.</p>
    </div>

    <div
      v-else-if="active === 'delivery'"
      id="product-tabpanel-delivery"
      role="tabpanel"
      aria-labelledby="product-tab-delivery"
      class="pt-6"
    >
      <RouterLink to="/support#policies" class="flex items-center gap-3 text-sm font-medium hover:text-muted">
        <DeliveryIcon class="h-6 w-6 shrink-0" />
        Delivery Policy
      </RouterLink>
    </div>

    <div
      v-else
      id="product-tabpanel-return"
      role="tabpanel"
      aria-labelledby="product-tab-return"
      class="pt-6"
    >
      <RouterLink to="/support#policies" class="flex items-center gap-3 text-sm font-medium hover:text-muted">
        <ReturnIcon class="h-6 w-6 shrink-0" />
        Returns & Exchanges Policy
      </RouterLink>
    </div>
  </div>
</template>
