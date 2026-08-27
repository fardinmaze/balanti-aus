<script setup lang="ts">
import { RouterLink } from "vue-router";
import { footerLinks, utilityMessage } from "@/content/nav";
import { brand } from "@/content/copy";
import { useCatalogue } from "@/lib/catalogue";

const year = new Date().getFullYear();
const catalogue = useCatalogue();
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="container grid gap-10 py-12 sm:grid-cols-3">
      <div>
        <p class="font-display text-lg font-semibold">{{ brand.name }}</p>
        <p class="mt-2 max-w-xs text-sm text-muted">{{ brand.tagline }}</p>
      </div>

      <div>
        <p class="eyebrow mb-3">Help</p>
        <ul class="space-y-2">
          <li v-for="link in footerLinks.help" :key="link.href">
            <RouterLink :to="link.href" class="text-sm text-ink hover:opacity-70">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="eyebrow mb-3">Shop</p>
        <ul class="space-y-2">
          <li v-for="cat in catalogue.topCategories.value" :key="cat.id">
            <RouterLink :to="`/catalogue?category=${cat.slug}`" class="text-sm text-ink hover:opacity-70">{{ cat.name }}</RouterLink>
          </li>
          <li v-for="link in footerLinks.about" :key="link.href">
            <RouterLink :to="link.href" class="text-sm text-ink hover:opacity-70">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="border-t border-line py-6">
      <p class="container text-xs text-muted">{{ utilityMessage }}</p>
      <p class="container mt-1 text-xs text-muted">© {{ year }} {{ brand.name }}. All rights reserved.</p>
    </div>
  </footer>
</template>
