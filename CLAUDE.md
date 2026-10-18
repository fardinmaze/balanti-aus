@../Design Contexts/CLAUDE.md

## Stack override

This project uses **Vue 3 + Vite + TypeScript**, not the Next.js stack described above — treat every Next/React-specific instruction in the imported file (App Router, Server Components, `next/image`, etc.) as superseded by the following:

- Routing: `vue-router` (`src/router/index.ts`), route-level components in `src/views/`.
- State: Vuex (`src/store/`, one namespaced module per domain), wrapped by thin composables in `src/lib/` (`useCart`, `useCheckout`, `useAuth`, …) that components use instead of touching the store directly.
- Components: `<script setup lang="ts">` SFCs. Presentational components in `src/components/`, one subfolder per domain (`layout`, `home`, `product`, `cart`, `ui`).
- Styling: identical token discipline — everything still comes from `src/styles/design-tokens.css` via the `@theme inline` mapping in `src/styles/globals.css`. No hard-coded hex/pixel values in components.
- Images: `PlaceholderImage.vue` until real photography lands (see README).
- Checkout: card payments go through **Stripe-hosted Checkout** (`STRIPE_FRONTEND_GUIDE.md`). Branch on a payment method's `gateway` (`"stripe"` vs `null`), never its `name`. All order pricing goes through `src/lib/pricing.ts` — the backend rejects an order whose `total` is more than 1 cent off its own figure, so never compute totals anywhere else.
