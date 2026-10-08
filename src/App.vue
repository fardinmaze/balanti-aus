<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import CartDrawer from "@/components/cart/CartDrawer.vue";
import ToastStack from "@/components/ui/ToastStack.vue";

// Soft fade between pages. Opacity only — a transform on <main> would turn it
// into the containing block for fixed overlays inside pages (zoom viewer etc.).
// Query-only changes (catalogue filters) and the first load don't animate.
const mainEl = ref<HTMLElement | null>(null);
const removeAfterEach = useRouter().afterEach((to, from, failure) => {
  if (failure || !from.matched.length || to.path === from.path || prefersReducedMotion()) return;
  nextTick(() => {
    if (!mainEl.value) return;
    gsap.fromTo(mainEl.value, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out", clearProps: "opacity" });
  });
});
onBeforeUnmount(removeAfterEach);
</script>

<template>
  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
    Skip to content
  </a>
  <Header />
  <main id="main" ref="mainEl" class="flex-1 pt-[70px] lg:pt-[76px]">
    <RouterView />
  </main>
  <Footer />
  <CartDrawer />
  <ToastStack />
</template>
