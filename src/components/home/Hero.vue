<script setup lang="ts">
import { ref, onMounted } from "vue";

const desktopVideoRef = ref<HTMLVideoElement | null>(null);
const mobileVideoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    desktopVideoRef.value?.pause();
    mobileVideoRef.value?.pause();
  }
});
</script>

<template>
  <section class="!p-0 -mt-[70px] lg:-mt-[76px]">
    <video
      ref="desktopVideoRef"
      src="/web-hero.mp4"
      class="hidden h-screen w-full object-cover md:block"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    />
    <video
      ref="mobileVideoRef"
      src="/web-hero-verical.mp4"
      class="block h-screen w-full object-cover md:hidden"
      autoplay
      loop
      muted
      playsinline
      aria-hidden="true"
    />
  </section>
</template>
