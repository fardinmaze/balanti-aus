<script setup lang="ts">
import { story } from "@/content/copy";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";

const heroTone = "#3d2b1f";
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container max-w-3xl text-center">
      <p class="eyebrow mb-4">{{ story.eyebrow }}</p>
      <h1 class="font-display text-3xl font-semibold sm:text-4xl">{{ story.heading }}</h1>
    </div>
  </section>

  <section class="!pt-0">
    <div class="container grid max-w-4xl gap-10 lg:grid-cols-2 lg:items-center">
      <PlaceholderImage :tone="heroTone" :label="story.heading" angle="worn" class="aspect-[4/3] w-full rounded-lg" />
      <div class="space-y-4">
        <p v-for="(paragraph, i) in story.paragraphs" :key="i" class="text-muted">{{ paragraph }}</p>
      </div>
    </div>
  </section>
</template>
