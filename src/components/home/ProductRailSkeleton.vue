<script setup lang="ts">
import ProductCardSkeleton from "@/components/product/ProductCardSkeleton.vue";

withDefaults(defineProps<{ heading: string; count?: number }>(), { count: 4 });
</script>

<template>
  <section aria-busy="true" :aria-label="`Loading ${heading}`">
    <div class="container">
      <h2>{{ heading }}</h2>
      <div class="no-scrollbar -mx-14 mt-8 flex gap-6 overflow-x-hidden px-14 pb-2">
        <div v-for="i in count" :key="i" class="w-[70vw] shrink-0 sm:w-[320px]">
          <ProductCardSkeleton />
        </div>
      </div>
    </div>
  </section>
</template>
