<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { footerLinks, freeReturnsMessage } from "@/content/nav";
import { useFreeShippingLine } from "@/lib/freeDelivery";
import { brand } from "@/content/copy";
import { useCatalogue } from "@/lib/catalogue";
import { siteApi } from "@/api/site";
import type { SocialLinks } from "@/api/types";
import FacebookIcon from "@/components/ui/icons/FacebookIcon.vue";
import InstagramIcon from "@/components/ui/icons/InstagramIcon.vue";
import TwitterIcon from "@/components/ui/icons/TwitterIcon.vue";
import LinkedinIcon from "@/components/ui/icons/LinkedinIcon.vue";

const year = new Date().getFullYear();
const catalogue = useCatalogue();

const freeShippingLine = useFreeShippingLine();
const utilityMessage = computed(() => [freeShippingLine.value, freeReturnsMessage].filter(Boolean).join(" "));

const socialLinks = ref<SocialLinks | null>(null);
onMounted(async () => {
  socialLinks.value = (await siteApi.socialLinks().catch(() => null)) ?? null;
});

const socialIcons = { facebook: FacebookIcon, twitter: TwitterIcon, instagram: InstagramIcon, linkedin: LinkedinIcon };
const activeSocialLinks = computed(() => {
  const links = socialLinks.value;
  if (!links) return [];
  return (Object.keys(socialIcons) as (keyof SocialLinks)[])
    .filter((platform) => links[platform])
    .map((platform) => ({ platform, url: links[platform] as string, icon: socialIcons[platform] }));
});
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="container grid gap-10 py-12 sm:grid-cols-3">
      <div>
        <p class="font-display text-lg font-semibold">{{ brand.name }}</p>
        <p class="mt-2 max-w-xs text-sm text-muted">{{ brand.tagline }}</p>

        <div v-if="activeSocialLinks.length" class="mt-4 flex items-center gap-3">
          <a
            v-for="link in activeSocialLinks"
            :key="link.platform"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="link.platform"
            class="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-ink transition-opacity hover:opacity-70"
          >
            <component :is="link.icon" class="h-4 w-4" />
          </a>
        </div>
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
        </ul>
      </div>
    </div>

    <div class="border-t border-line py-6">
      <p class="container text-xs text-muted">{{ utilityMessage }}</p>
      <p class="container mt-1 text-xs text-muted">© {{ year }} {{ brand.name }}. All rights reserved.</p>
    </div>
  </footer>
</template>
