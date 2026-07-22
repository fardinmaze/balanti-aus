<script setup lang="ts">
import { story } from "@/content/copy";
import { products } from "@/lib/products";
import BaseButton from "@/components/ui/BaseButton.vue";
import PlaceholderImage from "@/components/ui/PlaceholderImage.vue";

const [, loafer] = products;
</script>

<template>
  <section>
    <div class="container grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <PlaceholderImage
        :tone="loafer.tone"
        :label="loafer.name"
        angle="side"
        class="order-2 aspect-[4/3] w-full rounded-lg lg:order-1"
      />
      <div class="order-1 lg:order-2">
        <p class="eyebrow mb-4">{{ story.eyebrow }}</p>
        <h2>{{ story.heading }}</h2>
        <p v-for="(paragraph, i) in story.paragraphs" :key="i" class="mt-4 text-muted">
          {{ paragraph }}
        </p>
        <BaseButton variant="ghost" to="/about" class="mt-6">Read our story</BaseButton>
      </div>
    </div>
  </section>
</template>
