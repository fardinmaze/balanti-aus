<script setup lang="ts"></script>

<template>
  <section class="relative !p-0">
    <div class="relative w-full overflow-hidden">
      <img src="/section.png" alt="" aria-hidden="true" class="h-[95vh] w-full object-cover sm:h-auto" />
      <div class="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div class="absolute inset-0 flex items-center">
        <div class="container relative text-center">
          <h6 class="!text-white inline-block border-b border-white/70">About Balanti</h6>
          <h2 class="!text-white pt-6">Crafted for Those Who Value More</h2>
          <p class="mx-auto mt-6 max-w-5xl text-white/85 text-sm sm:text-base leading-relaxed">
            Balanti is a premier Australian footwear brand that brings together the elegance of Italian-inspired design with the strength and character of local craftsmanship. Established in Sydney in 2000, Balanti has built its identity around a simple philosophy: quality should be seen, felt, and experienced in every step.
          </p>
          <RouterLink
            to="/about"
            class="mt-8 inline-flex h-10 items-center justify-center rounded-pill border border-white px-5 text-sm font-semibold !text-white transition-colors hover:bg-white hover:!text-ink"
          >
            More About Us
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
