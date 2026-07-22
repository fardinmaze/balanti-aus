<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";

// Plays back to back, not on loop — each clip plays once then hands off
// to the next, cycling through all three.
const sources = [
  "/videos/8276047-hd_1920_1080_30fps.mp4",
  "/videos/8142267-uhd_4096_2160_24fps.mp4",
  "/videos/7166787-uhd_4096_2160_30fps.mp4",
];

const videoRef = ref<HTMLVideoElement | null>(null);
const currentIndex = ref(0);
let reducedMotion = false;

async function playNext() {
  currentIndex.value = (currentIndex.value + 1) % sources.length;
  await nextTick();
  const el = videoRef.value;
  if (!el) return;
  el.load();
  if (!reducedMotion) el.play().catch(() => {});
}

onMounted(() => {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) videoRef.value?.pause();
});
</script>

<template>
  <section class="!p-0">
    <video
      ref="videoRef"
      :src="sources[currentIndex]"
      class="block h-[60vh] w-full object-cover sm:h-[80vh]"
      autoplay
      muted
      playsinline
      aria-hidden="true"
      @ended="playNext"
    />
  </section>
</template>
