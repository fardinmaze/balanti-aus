<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import type { MegaMenuColumn } from "@/content/nav";
import { brand } from "@/content/copy";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth";
import { useCatalogue } from "@/lib/catalogue";
import { isChildOf, isShownTopCategory } from "@/lib/category";
import CartIcon from "@/components/ui/icons/CartIcon.vue";
import HeartIcon from "@/components/ui/icons/HeartIcon.vue";
import UserIcon from "@/components/ui/icons/UserIcon.vue";
import LogoutIcon from "@/components/ui/icons/LogoutIcon.vue";
import MegaMenu from "@/components/layout/MegaMenu.vue";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

const cart = useCart();
const wishlist = useWishlist();
const auth = useAuth();
const catalogue = useCatalogue();
const route = useRoute();
const router = useRouter();

const userName = computed(() => {
  const u = auth.user.value;
  return [u?.first_name, u?.last_name].filter(Boolean).join(" ") || "My account";
});

function signOut() {
  menuOpen.value = false;
  auth.logout();
  router.push("/");
}

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
const isScrolled = computed(() => scrollY.value >= SCROLL_THRESHOLD);
// Over the hero the bar is see-through — except while a menu is open, where
// white links over the video would be hard to read.
const isTransparent = computed(() => isOverHero.value && !openItem.value && !menuOpen.value);
const navTextClass = computed(() => (isTransparent.value ? "text-white" : "text-ink"));
// Eased by the header's transition; the bottom hairline stays in every state.
// Transparent only over the hero top — otherwise the original near-solid bar,
// plus a soft shadow once the page has scrolled.
const headerBgClass = computed(() => {
  if (isTransparent.value) return "bg-transparent";
  return ["bg-paper/95 backdrop-blur-sm", isScrolled.value ? "shadow-[var(--shadow-card)]" : ""];
});
// The logo PNG has no white variant — brightness-0 + invert turns its
// (transparent-background) artwork into solid white while over the hero.
const logoFilterClass = computed(() => (isTransparent.value ? "brightness-0 invert" : ""));

// Primary nav mirrors whatever top-level categories the backend actually
// has seeded (GET /site-api/top-categories) instead of a fixed Men/Women/
// Kids/Accessories list; each dropdown lists that category's real
// subcategories (GET /site-api/all-categories) rather than hand-authored copy.
type NavItem = { label: string; href: string; columns: MegaMenuColumn[] };
const navItems = computed<NavItem[]>(() =>
  catalogue.topCategories.value.filter(isShownTopCategory).map((cat) => {
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

// Moving straight from one category to another while the panel is open only
// swaps its contents; a fresh open (or a full close) gets the unfold/fold.
let switchingPanels = false;

function openMegaMenu(label: string) {
  if (closeTimer) clearTimeout(closeTimer);
  switchingPanels = openItem.value !== null && openItem.value !== label;
  openItem.value = label;
}

function scheduleCloseMegaMenu() {
  if (closeTimer) clearTimeout(closeTimer);
  closeTimer = setTimeout(() => {
    switchingPanels = false;
    openItem.value = null;
  }, 150);
}

function closeMegaMenuNow() {
  if (closeTimer) clearTimeout(closeTimer);
  switchingPanels = false;
  openItem.value = null;
}

function onPanelEnter(el: Element, done: () => void) {
  const items = el.querySelectorAll("[data-mega-item]");
  // A quick hover-out/in can interrupt a running fold — never let two tweens fight over the panel.
  gsap.killTweensOf([el, ...items]);
  if (prefersReducedMotion()) return done();
  const tl = gsap.timeline({ onComplete: done });
  if (switchingPanels) {
    tl.fromTo(items, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.25, stagger: 0.02, ease: "power2.out", clearProps: "opacity,transform" });
  } else {
    tl.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.4, ease: "power3.out", clearProps: "clipPath" })
      .fromTo(items, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: "power2.out", clearProps: "opacity,transform" }, 0.12);
  }
}

function onPanelLeave(el: Element, done: () => void) {
  gsap.killTweensOf([el, ...el.querySelectorAll("[data-mega-item]")]);
  gsap.set(el.querySelectorAll("[data-mega-item]"), { clearProps: "opacity,transform" });
  if (prefersReducedMotion()) return done();
  const finish = () => {
    gsap.set(el, { clearProps: "clipPath,opacity" });
    done();
  };
  if (switchingPanels) gsap.to(el, { opacity: 0, duration: 0.12, ease: "power1.out", onComplete: finish });
  else gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.22, ease: "power2.in", onComplete: finish });
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
    class="top-navbar fixed inset-x-0 top-0 z-40 border-b border-line transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[var(--dur-reveal)] ease-[var(--ease)]"
    :class="headerBgClass"
    @mouseleave="scheduleCloseMegaMenu"
  >
    <div
      class="container flex h-[70px] xl:h-[76px] items-center justify-between gap-4 transition-colors duration-[var(--dur-reveal)] ease-[var(--ease)]"
      :class="navTextClass"
    >
      <RouterLink to="/" class="inline-flex min-w-0 items-center" @click="closeMenu">
        <img
          src="/balanti-logo-11.png"
          :alt="brand.name"
          class="w-28 transition-[filter] duration-[var(--dur-reveal)] ease-[var(--ease)] md:w-32 lg:w-36"
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
            class="inline-flex items-center py-2 text-sm font-medium relative after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[var(--dur-mid)] after:ease-[var(--ease)] hover:after:scale-x-100 aria-expanded:after:scale-x-100"
            :aria-expanded="openItem === item.label"
            @click="closeMegaMenuNow"
          >
            {{ item.label }}
          </RouterLink>
        </div>
        <RouterLink to="/about" class="inline-flex items-center">
          <span class="inline-flex items-center py-2 text-sm font-medium relative after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-[var(--dur-mid)] after:ease-[var(--ease)] hover:after:scale-x-100">About Us</span>
        </RouterLink>
      </nav>

      <div class="flex shrink-0 items-center gap-1">
        <RouterLink
          :to="auth.isAuthenticated.value ? '/account' : '/account/login'"
          class="hidden min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md md:inline-flex"
          :aria-label="auth.isAuthenticated.value ? `My account (${userName})` : 'Sign in'"
          :title="auth.isAuthenticated.value ? 'My account' : 'Sign in'"
        >
          <UserIcon class="h-5 w-5" />
        </RouterLink>

        <RouterLink
          to="/wishlist"
          class="relative hidden min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md md:inline-flex"
          aria-label="Wishlist"
          data-fly-target="wishlist"
        >
          <HeartIcon class="h-5 w-5" inherit-color :filled="wishlist.count.value > 0" />
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
          data-fly-target="cart"
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

        <template v-if="auth.isAuthenticated.value">
          <span class="mx-1 hidden h-5 w-px bg-current opacity-20 md:block" aria-hidden="true" />
          <button
            type="button"
            class="hidden min-h-[var(--tap-min)] items-center gap-1.5 rounded-md px-2 text-sm font-medium transition-opacity hover:opacity-70 md:inline-flex"
            @click="signOut"
          >
            <LogoutIcon class="h-5 w-5" />
            <span class="hidden lg:inline">Sign out</span>
            <span class="sr-only lg:hidden">Sign out</span>
          </button>
        </template>

        <button
          type="button"
          class="inline-flex min-h-[var(--tap-min)] min-w-[var(--tap-min)] items-center justify-center rounded-md md:hidden"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          data-fly-target="menu"
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

    <Transition
      v-for="item in navItems"
      :key="`panel-${item.href}`"
      :css="false"
      @enter="onPanelEnter"
      @leave="onPanelLeave"
    >
      <div
        v-show="openItem === item.label && item.columns.length"
        class="absolute inset-x-0 top-full hidden md:block"
        @mouseenter="openMegaMenu(item.label)"
      >
        <MegaMenu :columns="item.columns" @navigate="closeMegaMenuNow" />
      </div>
    </Transition>

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
          {{ auth.isAuthenticated.value ? "My account" : "Sign in" }}
        </RouterLink>
        <RouterLink to="/wishlist" class="flex items-center gap-3 rounded-md px-2 py-3 text-base font-medium" @click="closeMenu">
          <HeartIcon class="h-5 w-5" inherit-color :filled="wishlist.count.value > 0" />
          Wishlist
          <span v-if="wishlist.count.value > 0" class="text-sm text-muted">({{ wishlist.count.value }})</span>
        </RouterLink>
        <button
          v-if="auth.isAuthenticated.value"
          type="button"
          class="flex items-center gap-3 rounded-md px-2 py-3 text-left text-base font-medium"
          @click="signOut"
        >
          <LogoutIcon class="h-5 w-5" />
          Sign out
        </button>
      </div>
    </nav>
  </header>
</template>
