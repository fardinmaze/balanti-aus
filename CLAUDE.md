@../Design Contexts/CLAUDE.md

## Stack override

This project uses **Vue 3 + Vite + TypeScript**, not the Next.js stack described above — treat every Next/React-specific instruction in the imported file (App Router, Server Components, `next/image`, etc.) as superseded by the following:

- Routing: `vue-router` (`src/router/index.ts`), route-level components in `src/views/`.
- State: no global store library — `src/lib/cart.ts` is a module-level singleton composable (`reactive` + `computed`). Reach for Pinia only if state complexity actually grows past this.
- Components: `<script setup lang="ts">` SFCs. Presentational components in `src/components/`, one subfolder per domain (`layout`, `home`, `product`, `cart`, `ui`).
- Styling: identical token discipline — everything still comes from `src/styles/design-tokens.css` via the `@theme inline` mapping in `src/styles/globals.css`. No hard-coded hex/pixel values in components.
- Images: `PlaceholderImage.vue` until real photography lands (see README).
- Checkout: currently a **simulated payment gateway** (`CheckoutView.vue`) — keep the demo disclosure (`DemoBanner.vue`, the note on the checkout form) visible until a real processor is wired in.
