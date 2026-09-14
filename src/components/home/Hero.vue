<script setup lang="ts">
import { ref, onMounted } from "vue";

const videoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) videoRef.value?.pause();
});
</script>

<template>
  <section class="!p-0">
    <video
      ref="videoRef"
      src="/balanti-hero-video.mp4"
      class="block h-[calc(100vh-4rem)] w-full object-cover"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    />
  </section>
</template>
