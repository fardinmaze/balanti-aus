<script setup lang="ts">
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton.vue";

withDefaults(defineProps<{ heading: string; mobileHeading?: string; count?: number }>(), { count: 4 });
</script>

<template>
  <section aria-busy="true" :aria-label="`Loading ${heading}`">
    <div class="container">
      <h2>
        <span class="sm:hidden">{{ mobileHeading ?? heading }}</span>
        <span class="hidden sm:inline">{{ heading }}</span>
      </h2>
      <div class="no-scrollbar -mx-4 mt-8 flex items-start gap-6 overflow-x-hidden px-4 pb-2 sm:-mx-14 sm:px-14">
        <div v-for="i in count" :key="i" class="w-[70vw] shrink-0 sm:w-[320px]">
          <ProductCardSkeleton />
        </div>
      </div>
    </div>
  </section>
</template>
