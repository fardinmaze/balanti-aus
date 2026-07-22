<script setup lang="ts">
import { ref, onMounted } from "vue";

const videoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  // Respect prefers-reduced-motion: hold on the first frame instead of
  // autoplaying a full-bleed background video.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    videoRef.value?.pause();
  }
});
</script>

<template>
  <section class="!p-0">
    <video
      ref="videoRef"
      class="block h-[60vh] w-full object-cover sm:h-[80vh]"
      autoplay
      muted
      loop
      playsinline
      aria-hidden="true"
    >
      <source src="/videos/8276047-hd_1920_1080_30fps.mp4" type="video/mp4" />
    </video>
  </section>
</template>
