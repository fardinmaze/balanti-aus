import type { Directive } from "vue";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll-reveal: fades + lifts an element in the first time it scrolls into view.
 *
 *   v-reveal            → the element itself
 *   v-reveal.children   → each direct child (product grids); children added later
 *                         ("Load more", filter changes) are picked up on update
 *
 * Elements that enter in the same frame are staggered together, so a grid
 * cascades instead of popping in all at once. Purely visual — with reduced
 * motion or no IntersectionObserver nothing is ever hidden.
 */
const seen = new WeakSet<Element>();
let queue: Element[] = [];
let flushScheduled = false;
let observer: IntersectionObserver | null = null;

function flush() {
  flushScheduled = false;
  const batch = queue;
  queue = [];
  gsap.to(batch, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.07,
    clearProps: "opacity,transform",
  });
}

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer!.unobserve(entry.target);
        // Background tabs don't run animation frames — show it now rather than
        // leave content invisible until the tab is focused.
        if (document.hidden) {
          gsap.set(entry.target, { clearProps: "opacity,transform" });
          continue;
        }
        queue.push(entry.target);
        if (!flushScheduled) {
          flushScheduled = true;
          requestAnimationFrame(flush);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
  );
  return observer;
}

function enabled(): boolean {
  return typeof window !== "undefined" && "IntersectionObserver" in window && !prefersReducedMotion();
}

function targets(el: HTMLElement, children: boolean | undefined): Element[] {
  return children ? Array.from(el.children) : [el];
}

function prime(el: Element) {
  if (seen.has(el)) return;
  seen.add(el);
  gsap.set(el, { opacity: 0, y: 24 });
  getObserver().observe(el);
}

export const vReveal: Directive<HTMLElement> = {
  mounted(el, binding) {
    if (enabled()) targets(el, binding.modifiers.children).forEach(prime);
  },
  updated(el, binding) {
    if (binding.modifiers.children && enabled()) targets(el, true).forEach(prime);
  },
  beforeUnmount(el, binding) {
    for (const t of targets(el, binding.modifiers.children)) observer?.unobserve(t);
  },
};

declare module "vue" {
  interface ComponentCustomProperties {
    vReveal: typeof vReveal;
  }
}
