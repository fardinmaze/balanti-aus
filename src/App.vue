<script setup lang="ts">
import Header from "@/components/layout/Header.vue";
import Footer from "@/components/layout/Footer.vue";
import CartDrawer from "@/components/cart/CartDrawer.vue";
import ToastStack from "@/components/ui/ToastStack.vue";
</script>

<template>
  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
    Skip to content
  </a>
  <Header />
  <main id="main" class="flex-1 pt-[70px] lg:pt-[76px]">
    <RouterView />
  </main>
  <Footer />
  <CartDrawer />
  <ToastStack />
</template>
