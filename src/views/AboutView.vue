<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { cmsApi } from "@/api/cms";
import type { AboutUs } from "@/api/types";
import { story } from "@/content/copy";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";

const heroTone = "#3d2b1f";

const aboutUs = ref<AboutUs | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    aboutUs.value = (await cmsApi.aboutUs()) ?? null;
  } finally {
    loading.value = false;
  }
});

function splitParagraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Backend sentinel for "not set yet" on the `values` field — filter it out
// rather than showing a literal "No VALUE" to customers.
const UNSET_VALUE = /^no\s*value$/i;

// Falls back to the static brand copy if the CMS has nothing yet, or the
// request fails — the page should never render empty.
const storyParagraphs = computed(() => {
  const fromCms = splitParagraphs(aboutUs.value?.about);
  return fromCms.length ? fromCms : story.paragraphs;
});

const mission = computed(() => {
  const raw = aboutUs.value?.mission;
  if (!raw) return null;
  const { title, description } = typeof raw === "string" ? { title: "", description: raw } : raw;
  const trimmedTitle = title?.trim() ?? "";
  const paragraphs = splitParagraphs(description);
  return trimmedTitle || paragraphs.length ? { title: trimmedTitle, paragraphs } : null;
});

const values = computed(() => {
  const raw = aboutUs.value?.values;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map((v) => v.trim()).filter((v) => v && !UNSET_VALUE.test(v));
});
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container max-w-3xl text-center">
      <p class="eyebrow mb-4">{{ story.eyebrow }}</p>
      <h1 class="font-display text-3xl font-semibold sm:text-4xl">{{ story.heading }}</h1>
    </div>
  </section>

  <!-- <section class="!pt-0">
    <div class="container max-w-4xl">
      <PlaceholderImage :tone="heroTone" :label="story.heading" angle="worn" class="aspect-[16/9] w-full rounded-lg" />
    </div>
  </section> -->

  <section class="!pt-1">
    <div class="container max-w-2xl">
      <p v-if="loading" class="text-center text-muted">Loading our story…</p>
      <div v-else class="space-y-5 text-muted">
        <p v-for="(paragraph, i) in storyParagraphs" :key="i">{{ paragraph }}</p>
      </div>
    </div>
  </section>

  <section v-if="mission" class="!pt-10">
    <div class="container max-w-2xl">
      <div class="rounded-lg border border-line bg-surface p-8 sm:p-10">
        <p class="eyebrow mb-3">Our Mission</p>
        <h2 v-if="mission.title" class="mb-4 text-2xl">{{ mission.title }}</h2>
        <div class="space-y-3 text-muted">
          <p v-for="(paragraph, i) in mission.paragraphs" :key="i">{{ paragraph }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- <section v-if="values.length" class="!pt-10">
    <div class="container max-w-2xl">
      <p class="eyebrow mb-5 text-center">What We Stand For</p>
      <ul class="grid gap-4 sm:grid-cols-2">
        <li v-for="(value, i) in values" :key="i" class="rounded-md border border-line px-5 py-4 text-sm">
          {{ value }}
        </li>
      </ul>
    </div>
  </section> -->
</template>
