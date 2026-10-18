# BALANTI website

Vue 3 + Vite + TypeScript, styled with Tailwind CSS wired to `src/styles/design-tokens.css` (the single source of truth for color/type/space — see `../Design Contexts/CLAUDE.md`).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Structure

```
src/
  App.vue            root layout: banner, header, <RouterView>, footer, cart drawer
  main.ts             app entry
  router/              route table
  views/                route-level components (Home, Product, About, Support, Cart, Checkout, Confirmation)
  components/
    layout/            Header, Footer, UtilityBar, DemoBanner
    home/               Hero, ProductRail, StoryBlock, Newsletter
    product/            ProductCard, Gallery, BuyBox
    cart/               CartDrawer
    ui/                 BaseButton, Price, PlaceholderImage (primitives, token-driven)
  content/              copy.ts, nav.ts — real copy, not hard-coded in components
  lib/                  products.ts (product data), cart.ts (cart store)
  styles/               design-tokens.css, globals.css (Tailwind + token wiring)
```

## Current status (see `../WORKPLAN.md`)

- Checkout pays by card through **Stripe-hosted Checkout** (see `STRIPE_FRONTEND_GUIDE.md`): a payment method with `gateway: "stripe"` redirects to Stripe's `payment_url`, and `ConfirmationView.vue` polls `/site-api/stripe/session-status` until the order is `PAID`/`FAILED`/`EXPIRED`. Offline methods (`gateway: null`) place the order directly. All order maths lives in `src/lib/pricing.ts`, which mirrors the backend's repricing to the cent. The dev server is pinned to port 5173 because the backend's Stripe redirect URLs point there.
- Product photography doesn't exist yet — `PlaceholderImage.vue` renders an art-directed tone swatch per angle instead of a real photo or stock image.
- The waitlist form (`Newsletter.vue`) is not wired to a real email service.
- Before a real launch: wire a real ESP for the waitlist, replace placeholder imagery, and add Privacy/Terms pages.
