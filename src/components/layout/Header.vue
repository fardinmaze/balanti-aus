<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import { RouterLink } from "vue-router";
import { megaMenuNav } from "@/content/nav";
import { brand } from "@/content/copy";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import CartIcon from "@/components/ui/icons/CartIcon.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import MegaMenu from "@/components/layout/MegaMenu.vue";

const cart = useCart();
const wishlist = useWishlist();
const menuOpen = ref(false);
const openItem = ref<string | null>(null);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function closeMenu() {
  menuOpen.value = false;
}

function openMegaMenu(label: string) {
  if (closeTimer) clearTimeout(closeTimer);
  openItem.value = label;
}

function scheduleCloseMegaMenu() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    openItem.value = null;
  }, 150);
}

function closeMegaMenuNow() {
  if (closeTimer) clearTimeout(closeTimer);
  openItem.value = null;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    closeMenu();
    closeMegaMenuNow();
  }
}

window.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <header
    class="top-navbar sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm"
    @mouseleave="scheduleCloseMegaMenu"
  >
    <div class="container flex h-16 items-center justify-between gap-4">
      <RouterLink to="/" class="font-display text-xl font-semibold tracking-tight" @click="closeMenu">
        {{ brand.name }}
      </RouterLink>

      <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
        <div
          v-for="item in megaMenuNav"
          :key="item.href"
          class="relative"
          @mouseenter="openMegaMenu(item.label)"
        >
          <RouterLink
            :to="item.href"
            class="inline-flex items-center py-2 text-sm font-medium text-ink transition-opacity hover:opacity-70"
            :aria-expanded="openItem === item.label"
            @click="closeMegaMenuNow"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </nav>

      <div class="flex items-center gap-1">
        <RouterLink
          to="/wishlist"
          class="relative inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md"
          aria-label="Wishlist"
        >
          <HeartIcon class="h-5 w-5" :filled="wishlist.count.value > 0" />
          <span
            v-if="wishlist.count.value > 0"
            class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-pill bg-accent text-[10px] font-semibold text-accent-contrast"
          >
            {{ wishlist.count.value }}
          </span>
        </RouterLink>

        <button
          type="button"
          class="relative inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md"
          aria-label="Open cart"
          @click="cart.openCart()"
        >
          <CartIcon class="h-5 w-5" />
          <span
            v-if="cart.count.value > 0"
            class="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-pill bg-accent text-[10px] font-semibold text-accent-contrast"
          >
            {{ cart.count.value }}
          </span>
        </button>

        <button
          type="button"
          class="inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          @click="menuOpen = !menuOpen"
        >
          <svg v-if="!menuOpen" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-for="item in megaMenuNav"
      :key="`panel-${item.href}`"
      class="absolute inset-x-0 top-full hidden md:block"
      v-show="openItem === item.label"
      @mouseenter="openMegaMenu(item.label)"
    >
      <MegaMenu :columns="item.columns" @navigate="closeMegaMenuNow" />
    </div>

    <nav
      v-if="menuOpen"
      id="mobile-nav"
      class="container flex flex-col gap-1 border-t border-line py-3 md:hidden"
      aria-label="Primary mobile"
    >
      <RouterLink
        v-for="item in megaMenuNav"
        :key="item.href"
        :to="item.href"
        class="rounded-md px-2 py-3 text-base font-medium"
        @click="closeMenu"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
</template>
