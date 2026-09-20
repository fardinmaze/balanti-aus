<script setup lang="ts">
import { brandValues, heritage } from "@/content/copy";
</script>

<template>
  <section class="!pt-8 !pb-8 sm:!pt-12 sm:!pb-10">
    <div class="container text-center">
      <p class="font-display text-2xl font-semibold sm:text-3xl">BALANTI — Crafted for Those Who Value More</p>
      <p class="text-muted mt-6">Balanti is a premier Australian footwear brand that brings together the elegance of Italian-inspired design with the strength and character of local craftsmanship. Established in Sydney in 2000, Balanti has built its identity around a simple philosophy: quality should be seen, felt, and experienced in every step.</p>
      <p class="text-muted mt-3">From its beginnings in premium men’s leather footwear, Balanti developed a reputation for refined design, exceptional comfort, and dependable durability. Through its specialised manufacturing and distribution network, the brand steadily expanded its presence across the Australian market, earning the trust of customers and establishing strong relationships throughout major supply chains.</p>
      <p class="text-muted mt-3">Today, Balanti represents more than footwear—it represents heritage, craftsmanship, confidence, and timeless style. Its market-proven collection of full-leather footwear extends across both men’s and women’s ranges, created for people who appreciate sophisticated design without sacrificing everyday comfort and practicality.</p>
    </div>
  </section>

  <section class="!py-8 sm:!py-10">
    <div class="container">
      <p class="font-display text-2xl font-semibold sm:text-3xl text-center mb-8">Our Brand Values</p>
      <ul class="grid gap-6 sm:grid-cols-2">
        <li v-for="value in brandValues" :key="value.title" class="rounded-lg border border-line bg-surface p-6">
          <p class="mb-2 font-display text-lg font-semibold">{{ value.title }}</p>
          <p class="text-sm text-muted">{{ value.description }}</p>
        </li>
      </ul>
    </div>
  </section>

  <section class="!py-8 sm:!py-10">
    <div class="container text-center">
      <p class="font-display text-2xl font-semibold sm:text-3xl mb-6">{{ heritage.eyebrow }}</p>
      <h2 class="font-display text-2xl font-semibold sm:text-3xl pb-8">{{ heritage.heading }}</h2>
    </div>
  </section>
</template>
