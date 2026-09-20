<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRoute } from "vue-router";
import type { MegaMenuColumn } from "@/content/nav";
import { brand } from "@/content/copy";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { useCatalogue } from "@/lib/catalogue";
import { isChildOf } from "@/lib/category";
import CartIcon from "@/components/ui/icons/CartIcon.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import UserIcon from "@/components/ui/icons/UserIcon.vue";
import MegaMenu from "@/components/layout/MegaMenu.vue";

const cart = useCart();
const wishlist = useWishlist();
const auth = useAuth();
const catalogue = useCatalogue();
const route = useRoute();

// The header floats transparently over the homepage hero video (Hero.vue
// pulls up under it) only while at the very top of the page — as soon as
// the user starts scrolling, it picks up its solid background/blur again
// (and switches nav text back to dark) like a normal header everywhere else.
const SCROLL_THRESHOLD = 8;
const scrollY = ref(typeof window !== "undefined" ? window.scrollY : 0);
function onScroll() {
  scrollY.value = window.scrollY;
}
onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

const isOverHero = computed(() => route.path === "/" && scrollY.value < SCROLL_THRESHOLD);
const navTextClass = computed(() => (isOverHero.value ? "text-white" : "text-ink"));
const headerBgClass = computed(() => (isOverHero.value ? "" : "bg-paper/95 backdrop-blur-sm"));
// The logo PNG has no white variant — brightness-0 + invert turns its
// (transparent-background) artwork into solid white while over the hero.
const logoFilterClass = computed(() => (isOverHero.value ? "brightness-0 invert" : ""));

// Primary nav mirrors whatever top-level categories the backend actually
// has seeded (GET /site-api/top-categories) instead of a fixed Men/Women/
// Kids/Accessories list; each dropdown lists that category's real
// subcategories (GET /site-api/all-categories) rather than hand-authored copy.
type NavItem = { label: string; href: string; columns: MegaMenuColumn[] };
const navItems = computed<NavItem[]>(() =>
  catalogue.topCategories.value.map((cat) => {
    const subcategories = catalogue.categories.value.filter((c) => isChildOf(c, cat.id));
    const columns: MegaMenuColumn[] = subcategories.length
      ? [
          {
            heading: cat.name,
            links: [
              { label: `Shop All ${cat.name}`, href: `/catalogue?category=${cat.slug}` },
              ...subcategories.map((s) => ({ label: s.name, href: `/catalogue?category=${s.slug}` })),
            ],
          },
        ]
      : [];
    return { label: cat.name, href: `/catalogue?category=${cat.slug}`, columns };
  })
);

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
    class="top-navbar fixed inset-x-0 top-0 z-40 border-b border-line transition-colors duration-200"
    :class="headerBgClass"
    @mouseleave="scheduleCloseMegaMenu"
  >
    <div class="container flex h-[70px] xl:h-[76px] items-center justify-between gap-4" :class="navTextClass">
      <RouterLink to="/" class="inline-flex min-w-0 items-center" @click="closeMenu">
        <img
          src="/balanti-logo.png"
          :alt="brand.name"
          class="w-28 transition-[filter] duration-200 md:w-32 lg:w-36"
          :class="logoFilterClass"
        />
      </RouterLink>

      <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
        <div
          v-for="item in navItems"
          :key="item.href"
          class="relative"
          @mouseenter="item.columns.length && openMegaMenu(item.label)"
        >
          <RouterLink
            :to="item.href"
            class="inline-flex items-center py-2 text-sm font-medium transition-opacity hover:opacity-70"
            :aria-expanded="openItem === item.label"
            @click="closeMegaMenuNow"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <RouterLink to="/about" class="inline-flex items-center">
          <p class="inline-flex items-center py-2 text-sm font-medium transition-opacity hover:opacity-70">About Us</p>
        </RouterLink>
      </nav>

      <div class="flex shrink-0 items-center gap-1">
        <RouterLink
          :to="auth.isAuthenticated.value ? '/account' : '/account/login'"
          class="hidden min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md md:inline-flex"
          aria-label="Account"
        >
          <UserIcon class="h-5 w-5" />
        </RouterLink>

        <RouterLink
          to="/wishlist"
          class="relative hidden min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md md:inline-flex"
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
      v-for="item in navItems"
      :key="`panel-${item.href}`"
      class="absolute inset-x-0 top-full hidden md:block"
      v-show="openItem === item.label && item.columns.length"
      @mouseenter="openMegaMenu(item.label)"
    >
      <MegaMenu :columns="item.columns" @navigate="closeMegaMenuNow" />
    </div>

    <nav
      v-if="menuOpen"
      id="mobile-nav"
      class="container flex flex-col gap-1 border-t border-line py-3 md:hidden"
      :class="navTextClass"
      aria-label="Primary mobile"
    >
      <RouterLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        class="rounded-md px-2 py-3 text-base font-medium"
        @click="closeMenu"
      >
        {{ item.label }}
      </RouterLink>
      <RouterLink to="/about" class="rounded-md px-2 py-3 text-base font-medium" @click="closeMenu">
        About Us
      </RouterLink>

      <div class="mt-2 flex flex-col gap-1 border-t border-line pt-2">
        <RouterLink
          :to="auth.isAuthenticated.value ? '/account' : '/account/login'"
          class="flex items-center gap-3 rounded-md px-2 py-3 text-base font-medium"
          @click="closeMenu"
        >
          <UserIcon class="h-5 w-5" />
          Account
        </RouterLink>
        <RouterLink to="/wishlist" class="flex items-center gap-3 rounded-md px-2 py-3 text-base font-medium" @click="closeMenu">
          <HeartIcon class="h-5 w-5" :filled="wishlist.count.value > 0" />
          Wishlist
          <span v-if="wishlist.count.value > 0" class="text-sm text-muted">({{ wishlist.count.value }})</span>
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
