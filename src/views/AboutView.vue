<script setup lang="ts">
import { brandValues, heritage } from "@/content/copy";
</script>

<template>
  <section class="!pt-8 !pb-8 sm:!pt-12 sm:!pb-10 max-w-[1280px] mx-auto">
    <div class="container text-center">
      <p class="font-display text-2xl font-semibold sm:text-3xl">BALANTI — Crafted for Those Who Value More</p>
      <p class="text-muted mt-6">Balanti is a premier Australian footwear brand that brings together the elegance of Italian-inspired design with the strength and character of local craftsmanship. Established in Sydney in 2000, Balanti has built its identity around a simple philosophy: quality should be seen, felt, and experienced in every step.</p>
      <p class="text-muted mt-3">From its beginnings in premium men’s leather footwear, Balanti developed a reputation for refined design, exceptional comfort, and dependable durability. Through its specialised manufacturing and distribution network, the brand steadily expanded its presence across the Australian market, earning the trust of customers and establishing strong relationships throughout major supply chains.</p>
      <p class="text-muted mt-3">Today, Balanti represents more than footwear—it represents heritage, craftsmanship, confidence, and timeless style. Its market-proven collection of full-leather footwear extends across both men’s and women’s ranges, created for people who appreciate sophisticated design without sacrificing everyday comfort and practicality.</p>
    </div>
  </section>

    <section class="!py-8 sm:!py-10 max-w-[1280px] mx-auto">
    <div class="container text-center">
      <p class="font-display text-2xl font-semibold sm:text-3xl mb-6">Balanti Family History</p>
      <p class="text-muted mt-3">The surname Balanti is of Italian origin, derived from the word "balante," which refers to a person who balances or a tightrope walker. This term comes from the Latin "balans," meaning "balancing." The etymology suggests a historical connection to professions or roles involving balance, agility, or performance, potentially linked to entertainers or acrobats in medieval Italy.</p>
      <p class="text-muted mt-3">As a surname, Balanti may have originally been a nickname for individuals who exhibited remarkable dexterity or balance, possibly reflecting a family lineage of performers. Over time, such nicknames evolved into hereditary surnames as families sought to establish their identity and status within society.</p>
      <p class="text-muted mt-3">Geographically, the surname Balanti is primarily found in regions of Italy, particularly in the central and northern parts. However, due to migration patterns, individuals bearing this surname may also be found in various countries, especially where Italian communities have established themselves, such as the United States and Canada.</p>
      <p class="text-muted mt-3">Spelling variants of Balanti may include Balante and Balantiello, which reflect regional dialects and phonetic adaptations. These variants highlight the linguistic diversity within Italian surnames and may indicate different branches of the same family or related lineages. Related surnames might include Balan and Balanz, which share similar roots and meanings pertaining to balance.</p>
      <p class="text-muted mt-3">Overall, the surname Balanti encapsulates a rich cultural heritage, rooted in historical occupations and social roles that emphasize performance and agility, reflecting a unique aspect of Italian ancestry and identity.</p>
      <p class="text-muted mt-3">Similar surnames: Galanti, Balan, Galati, Galant, Lalani, Benanti, Galante, Balint, Valenti, Balent.</p>
    </div>
  </section>

  <section class="!py-8 sm:!py-10 max-w-[1280px] mx-auto">
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

  <section class="!py-8 sm:!py-10 max-w-[1280px] mx-auto">
    <div class="container text-center">
      <p class="font-display text-2xl font-semibold sm:text-3xl mb-6">{{ heritage.eyebrow }}</p>
      <h2 class="font-display text-2xl font-semibold sm:text-3xl pb-8">{{ heritage.heading }}</h2>
    </div>
  </section>
</template>
