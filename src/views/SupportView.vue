<script setup lang="ts">
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
      <p class="mt-2 text-muted">Shipping, returns, sizing, and how to reach us.</p>
    </div>
  </section>

  <section id="shipping" class="!pt-0">
    <div class="container max-w-3xl">
      <h2>Shipping</h2>
      <ul class="space-y-2 text-muted">
        <li>Free standard shipping on orders over $150 AUD, Australia-wide.</li>
        <li>Orders are packed and dispatched from within Australia.</li>
        <li>A tracking link is emailed as soon as your order ships.</li>
      </ul>
    </div>
  </section>

  <section id="returns" class="!pt-0">
    <div class="container max-w-3xl">
      <h2>Returns</h2>
      <ul class="space-y-2 text-muted">
        <li>Free returns within 30 days of delivery.</li>
        <li>Shoes must be unworn, in original packaging, with tags attached.</li>
        <li>Refunds are issued to the original payment method once the return is received.</li>
      </ul>
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

  <section id="contact" class="!pt-0">
    <div class="container max-w-3xl">
      <h2>Contact</h2>
      <p class="text-muted">
        Questions about an order or a style? Email
        <a href="mailto:hello@balanti.com.au" class="underline">hello@balanti.com.au</a> and we'll get back to you
        within one business day.
      </p>
    </div>
  </section>
</template>
