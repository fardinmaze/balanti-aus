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

- Checkout is a **simulated payment gateway** — no real processor is wired in. `CheckoutView.vue` fakes a network round trip and generates a demo order ID; nothing is charged or transmitted.
- Product photography doesn't exist yet — `PlaceholderImage.vue` renders an art-directed tone swatch per angle instead of a real photo or stock image.
- The waitlist form (`Newsletter.vue`) is not wired to a real email service.
- Before a real launch: pick a payment processor (Stripe/Afterpay), wire a real ESP for the waitlist, replace placeholder imagery, and add Privacy/Terms pages.
