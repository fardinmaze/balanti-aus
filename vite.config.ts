import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // The backend's Stripe success/cancel URLs point at localhost:5173 (STRIPE_FRONTEND_GUIDE.md) —
  // fail loudly instead of silently moving to 5174, where Stripe's redirect would miss us.
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
