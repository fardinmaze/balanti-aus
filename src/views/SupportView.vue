<script setup lang="ts">
import { onMounted, ref } from "vue";
import { policies, policiesLastUpdated } from "@/content/policies";
import { settingsApi } from "@/api/settings";
import type { ShopContactInfo } from "@/api/types";

const FALLBACK_EMAIL = "hello@balanti.com.au";

const contactInfo = ref<ShopContactInfo | null>(null);
onMounted(async () => {
  contactInfo.value = (await settingsApi.shopContactInfo().catch(() => null)) ?? null;
});

const sizeChart = [
  { uk: "UK 6", au: "AU 7", cm: "24.5 cm" },
  { uk: "UK 7", au: "AU 8", cm: "25.5 cm" },
  { uk: "UK 8", au: "AU 9", cm: "26.5 cm" },
  { uk: "UK 9", au: "AU 10", cm: "27.5 cm" },
  { uk: "UK 10", au: "AU 11", cm: "28.5 cm" },
  { uk: "UK 11", au: "AU 12", cm: "29.5 cm" },
  { uk: "UK 12", au: "AU 13", cm: "30.5 cm" },
];

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
  <section class="!pt-8 sm:!pt-12">
    <div class="container max-w-3xl text-center">
      <h1>Support</h1>
      <p class="mt-2 text-muted">Size guide, FAQ, Policies, and how to reach us.</p>
    </div>
  </section>

  <section id="size-guide" class="!pt-0">
    <div class="container max-w-3xl">
      <h2>Size guide</h2>
      <p class="mb-4 text-muted">Between sizes? Size up for a roomier fit, especially with thicker socks.</p>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[360px] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-line">
              <th class="py-2 pr-4 font-semibold">UK</th>
              <th class="py-2 pr-4 font-semibold">AU</th>
              <th class="py-2 font-semibold">Foot length</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sizeChart" :key="row.uk" class="border-b border-line">
              <td class="py-2 pr-4">{{ row.uk }}</td>
              <td class="py-2 pr-4">{{ row.au }}</td>
              <td class="py-2">{{ row.cm }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section id="faq" class="!pt-0">
    <div class="container max-w-3xl">
      <h2>FAQ</h2>
      <div class="divide-y divide-line border-t border-line">
        <details v-for="faq in faqs" :key="faq.q" class="py-4">
          <summary class="cursor-pointer text-sm font-semibold">{{ faq.q }}</summary>
          <p class="mt-2 text-sm text-muted">{{ faq.a }}</p>
        </details>
      </div>
    </div>
  </section>

  <section id="policies" class="!pt-0">
    <div class="container max-w-3xl">
      <h2>Policies</h2>
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

  <section id="contact" class="!pt-0">
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
