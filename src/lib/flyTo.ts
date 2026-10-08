import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * "Fly to cart / wishlist" micro-interaction: a copy of the product image
 * arcs from where the user clicked into the matching header icon, which then
 * bumps. Targets are header elements tagged `data-fly-target="cart|wishlist"`;
 * on phones the wishlist icon is hidden, so it falls back to the menu toggle
 * (`data-fly-target="menu"`). Purely decorative — never blocks the action.
 */
export type FlyTarget = "cart" | "wishlist";

const FLIGHT_SIZE = 72; // px — size of the flying thumbnail at take-off

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function findTarget(target: FlyTarget): HTMLElement | null {
  const candidates = [
    ...document.querySelectorAll<HTMLElement>(`[data-fly-target="${target}"]`),
    ...document.querySelectorAll<HTMLElement>('[data-fly-target="menu"]'),
  ];
  return candidates.find(isVisible) ?? null;
}

function bump(el: HTMLElement) {
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.3, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1, clearProps: "transform" }
  );
}

/** Quick press feedback on the button the user clicked (e.g. the heart filling in). */
export function pop(el: Element | null | undefined) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(el, { scale: 0.7 }, { scale: 1, duration: 0.45, ease: "back.out(3)", clearProps: "transform" });
}

/** Builds the flying element: the source's image if it has one, else an accent dot. */
function makeFlyer(source: Element | null): HTMLElement {
  const img = source instanceof HTMLImageElement ? source : source?.querySelector("img");
  const el = document.createElement(img ? "img" : "div");
  if (img && el instanceof HTMLImageElement) {
    el.src = img.currentSrc || img.src;
    el.alt = "";
    el.style.objectFit = "cover";
  } else {
    el.style.background = "var(--accent)";
  }
  Object.assign(el.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${FLIGHT_SIZE}px`,
    height: `${FLIGHT_SIZE}px`,
    borderRadius: "var(--r-pill)",
    boxShadow: "var(--shadow-card)",
    pointerEvents: "none",
    zIndex: "100",
    willChange: "transform, opacity",
  });
  el.setAttribute("aria-hidden", "true");
  return el;
}

function inViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return isVisible(el) && r.bottom > 0 && r.top < window.innerHeight;
}

/**
 * @param sources where the flight starts — the first one currently on screen
 *   wins (e.g. `[productImage, clickedButton]` so a scrolled-away image falls
 *   back to the button the user just pressed).
 */
export function flyTo(sources: Element | null | undefined | (Element | null | undefined)[], target: FlyTarget) {
  if (typeof window === "undefined") return;
  const targetEl = findTarget(target);
  if (!targetEl) return;

  const list = Array.isArray(sources) ? sources : [sources];
  const source = list.find((s): s is Element => !!s && inViewport(s));
  // Only the product image is worth flying; a button source flies as an accent dot.
  const imageSource = list.find((s): s is Element => !!s && !!(s instanceof HTMLImageElement || s.querySelector("img")));

  if (!source || prefersReducedMotion()) {
    bump(targetEl);
    return;
  }

  const from = source.getBoundingClientRect();
  const to = targetEl.getBoundingClientRect();
  const startX = from.left + from.width / 2 - FLIGHT_SIZE / 2;
  const startY = from.top + from.height / 2 - FLIGHT_SIZE / 2;
  const endX = to.left + to.width / 2 - FLIGHT_SIZE / 2;
  const endY = to.top + to.height / 2 - FLIGHT_SIZE / 2;

  const flyer = makeFlyer(imageSource ?? source);
  document.body.appendChild(flyer);

  // Separate x/y eases give the arc: x glides, y lifts then drops into the icon.
  gsap
    .timeline({
      onComplete: () => {
        flyer.remove();
        bump(targetEl);
      },
    })
    .set(flyer, { x: startX, y: startY, scale: 0.4, opacity: 0 })
    .to(flyer, { scale: 1, opacity: 1, duration: 0.18, ease: "back.out(2)" })
    .to(flyer, { x: endX, duration: 0.7, ease: "power1.inOut" }, ">")
    .to(flyer, { y: endY, duration: 0.7, ease: "back.in(1.4)" }, "<")
    .to(flyer, { scale: 0.25, opacity: 0.4, duration: 0.7, ease: "power2.in" }, "<");
}
