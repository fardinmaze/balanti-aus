<script setup lang="ts">
/**
 * Plain multi-column link "sitemap" block — same pattern as the reference
 * screenshot (bold column headers, quiet link list below, no cards/icons).
 * Adapted to BALANTI's real catalog rather than copying Nike's literal
 * categories.
 */
const columns = [
  {
    heading: "Shoes",
    links: [
      { label: "Oxfords", href: "/products/balanti-oxford" },
      { label: "Wingtip Oxfords", href: "/products/balanti-wingtip-oxford" },
      { label: "Derby Shoes", href: "/products/balanti-derby" },
      { label: "Loafers", href: "/products/balanti-loafer" },
      { label: "Penny Loafers", href: "/products/balanti-penny-loafer" },
    ],
  },
  {
    heading: "More Styles",
    links: [
      { label: "Monk Straps", href: "/products/balanti-monk-strap" },
      { label: "Chelsea Boots", href: "/products/balanti-chelsea-boot" },
      { label: "Ankle Boots", href: "/products/balanti-ankle-boot" },
      { label: "Ballet Flats", href: "/products/balanti-ballet-flat" },
      { label: "Slip-On Sneakers", href: "/products/balanti-slip-on-sneaker" },
    ],
  },
  {
    heading: "Shop By",
    links: [
      { label: "Men", href: "/category/men" },
      { label: "Women", href: "/category/women" },
      { label: "Kids", href: "/category/kids" },
    ],
  },
  {
    heading: "Accessories",
    links: [
      { label: "Socks", href: "/catalogue?type=socks" },
      { label: "Shoe Laces", href: "/catalogue?type=laces" },
      { label: "Men's Bags", href: "/catalogue?type=mens-bag" },
      { label: "Women's Handbags", href: "/catalogue?type=womens-handbag" },
      { label: "Sandals", href: "/catalogue?type=sandals" },
    ],
  },
];
</script>

<template>
  <section>
    <div class="container grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-8">
      <div v-for="column in columns" :key="column.heading">
        <h3 class="font-display text-lg font-semibold">{{ column.heading }}</h3>
        <ul class="mt-4 space-y-3">
          <li v-for="link in column.links" :key="link.href">
            <RouterLink :to="link.href" class="text-sm text-muted transition-colors hover:text-ink">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
