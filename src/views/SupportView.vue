<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { policies, policiesLastUpdated } from "@/content/policies";
import { settingsApi } from "@/api/settings";
import type { ShopContactInfo } from "@/api/types";

const FALLBACK_EMAIL = "hello@balanti.com.au";

const contactInfo = ref<ShopContactInfo | null>(null);
onMounted(async () => {
  contactInfo.value = (await settingsApi.shopContactInfo().catch(() => null)) ?? null;
});

const sizeChart = [
  { mm: 245, cm: 24.5, bd: "39", auUk: "6", us: "7", eu: "39", fit: "True to size" },
  { mm: 250, cm: 25.0, bd: "40", auUk: "6.5", us: "7.5", eu: "40", fit: "True to size" },
  { mm: 255, cm: 25.5, bd: "40–41", auUk: "7", us: "8", eu: "40–41", fit: "True to size" },
  { mm: 260, cm: 26.0, bd: "41", auUk: "7.5", us: "8.5", eu: "41", fit: "True to size" },
  { mm: 265, cm: 26.5, bd: "42", auUk: "8", us: "9", eu: "42", fit: "True to size" },
  { mm: 270, cm: 27.0, bd: "42–43", auUk: "8.5", us: "9.5", eu: "42–43", fit: "True to size" },
  { mm: 275, cm: 27.5, bd: "43", auUk: "9", us: "10", eu: "43", fit: "True to size" },
  { mm: 280, cm: 28.0, bd: "44", auUk: "9.5", us: "10.5", eu: "44", fit: "True to size" },
  { mm: 285, cm: 28.5, bd: "45", auUk: "10.5", us: "11.5", eu: "45", fit: "Best for wider feet" },
  { mm: 290, cm: 29.0, bd: "46", auUk: "11", us: "12", eu: "46", fit: "True to size" },
  { mm: 295, cm: 29.5, bd: "47", auUk: "11.5", us: "12.5", eu: "47", fit: "Best for wider feet" },
  { mm: 300, cm: 30.0, bd: "48", auUk: "12", us: "13", eu: "48", fit: "True to size" },
];

const footLengthMm = ref<number | null>(null);

const recommendedSize = computed(() => {
  const target = footLengthMm.value;
  if (!target) return null;
  return sizeChart.reduce((closest, row) =>
    Math.abs(row.mm - target) < Math.abs(closest.mm - target) ? row : closest,
  );
});

const faqs = [
  {
    q: "What's the difference between the Oxford and the Loafer?",
    a: "The Oxford is a closed-lace formal shoe built for the office. The Loafer is slip-on, lower break-in, and moves between smart-casual and business without changing character. Both share the same full-grain leather and resoleable construction.",
  },
  {
    q: "How should I break these in?",
    a: "Full-grain leather softens with wear. Start with a few short wears around the house or a half-day at the desk before a full day on your feet.",
  },
  {
    q: "Can I get these resoled?",
    a: "Yes — both styles use a resoleable construction, so a worn sole doesn't mean a new pair.",
  },
];
</script>

<template>
  <section class="!pt-8 !pb-6 sm:!pt-12 sm:!pb-8">
    <div class="container max-w-3xl text-center">
      <h1>Support</h1>
      <p class="mt-2 text-muted">Size guide, FAQ, Policies, and how to reach us.</p>
    </div>
  </section>

  <section id="size-guide" class="!pt-0 !pb-8 sm:!pb-10">
    <div class="container max-w-3xl">
      <h2>Size Guide</h2>
      <p class="mb-4 text-muted">
        Leather shoes fit differently across regions — convert your usual size below, or measure your foot length in millimetres for the most accurate fit.
      </p>

      <div class="mb-6">
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-semibold mb-1">Measure your foot (mm)</span>
          <input
            v-model.number="footLengthMm"
            type="number"
            step="5"
            min="245"
            max="300"
            placeholder="e.g. 275"
            class="size-guide-input w-40 rounded-md border border-line bg-surface px-3 py-2 text-sm"
          />
        </label>

        <div v-if="recommendedSize" class="mt-4 max-w-xs rounded-lg border border-line bg-surface p-5">
          <p class="text-xs text-muted">{{ recommendedSize.mm }} mm ({{ recommendedSize.cm.toFixed(1) }} cm)</p>
          <p class="mt-1 font-display text-2xl font-semibold">BD {{ recommendedSize.bd }}</p>
          <p class="mt-1 text-sm text-muted">
            AU/UK {{ recommendedSize.auUk }} · US {{ recommendedSize.us }} · EU {{ recommendedSize.eu }}
          </p>
          <p class="mt-3 text-sm font-semibold">{{ recommendedSize.fit }}</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-line">
              <th class="py-2 pr-4 font-semibold">Foot length</th>
              <th class="py-2 pr-4 font-semibold">BD</th>
              <th class="py-2 pr-4 font-semibold">AU / UK</th>
              <th class="py-2 pr-4 font-semibold">US Men's</th>
              <th class="py-2 pr-4 font-semibold">EU</th>
              <th class="py-2 font-semibold">Fit note</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in sizeChart"
              :key="row.bd"
              class="border-b border-line"
              :class="{ 'bg-surface': recommendedSize?.bd === row.bd }"
            >
              <td class="py-2 pr-4 whitespace-nowrap">{{ row.mm }} mm ({{ row.cm.toFixed(1) }} cm)</td>
              <td class="py-2 pr-4">{{ row.bd }}</td>
              <td class="py-2 pr-4">{{ row.auUk }}</td>
              <td class="py-2 pr-4">{{ row.us }}</td>
              <td class="py-2 pr-4">{{ row.eu }}</td>
              <td class="py-2">{{ row.fit }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section id="faq" class="!pt-0 !pb-8 sm:!pb-10">
    <div class="container max-w-3xl">
      <h2 class="pt-6">FAQ</h2>
      <div class="divide-y divide-line border-t border-line">
        <details v-for="faq in faqs" :key="faq.q" class="py-4">
          <summary class="cursor-pointer text-sm font-semibold">{{ faq.q }}</summary>
          <p class="mt-2 text-sm text-muted">{{ faq.a }}</p>
        </details>
      </div>
    </div>
  </section>

  <section id="policies" class="!pt-0 !pb-8 sm:!pb-10">
    <div class="container max-w-3xl">
      <h2 class="pt-1">Policies</h2>
      <p class="text-muted">Privacy, cookies, terms, delivery, returns and payment — the full detail behind the summaries above.</p>
      <p class="mt-1 text-xs text-muted">Last updated {{ policiesLastUpdated }}</p>

      <div class="mt-4 rounded-md border border-line bg-surface p-4 text-sm text-muted">
        This policy set is a working draft: business details such as our registered entity, ABN, postal address,
        phone number and business hours are still bracketed placeholders below and are not yet finalised.
      </div>

      <div class="mt-8 divide-y divide-line border-t border-line">
        <details v-for="policy in policies" :key="policy.id" :id="policy.id" class="py-6">
          <summary class="cursor-pointer font-display text-lg font-semibold sm:text-xl">
            {{ policy.title }}
          </summary>
          <p class="mt-2 text-sm text-muted">{{ policy.summary }}</p>

          <div class="mt-6 space-y-6">
            <div v-for="block in policy.blocks" :key="block.heading">
              <h3 class="text-sm font-semibold">{{ block.heading }}</h3>
              <p v-for="(paragraph, i) in block.paragraphs" :key="i" class="mt-2 text-sm text-muted">
                {{ paragraph }}
              </p>
              <ul v-if="block.list" class="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
                <li v-for="(item, i) in block.list" :key="i">{{ item }}</li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>

  <section id="contact" class="!pt-0 !pb-10 sm:!pb-14">
    <div class="container max-w-3xl">
      <h2>Contact</h2>
      <p class="text-muted">
        Questions about an order or a style? Email
        <a :href="`mailto:${contactInfo?.email_address ?? FALLBACK_EMAIL}`" class="font-semibold">{{
          contactInfo?.email_address ?? FALLBACK_EMAIL
        }}</a>
        <template v-if="contactInfo?.phone_number">
          or call
          <a :href="`tel:${contactInfo.phone_number}`" class="font-semibold">{{ contactInfo.phone_number }}</a>
        </template>
        and we'll get back to you within one business day.
      </p>
    </div>
  </section>
</template>

<style scoped>
/* design-tokens.css imports as unlayered CSS, which beats any Tailwind
   utility (they live in @layer utilities) regardless of specificity —
   only a plain CSS rule can override the global :focus-visible ring here. */
.size-guide-input:focus,
.size-guide-input:focus-visible {
  outline: none;
}
</style>
