import { reactive, computed, watch } from "vue";
import { getProduct } from "./products";

export type CartLine = { handle: string; size: string; qty: number };

const STORAGE_KEY = "balanti-cart";

function loadInitial(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

const state = reactive({
  lines: loadInitial(),
  isOpen: false,
});

watch(
  () => state.lines,
  (lines) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage unavailable — cart just won't persist across reloads */
    }
  },
  { deep: true }
);

function addItem(handle: string, size: string, qty = 1) {
  const existing = state.lines.find((l) => l.handle === handle && l.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    state.lines.push({ handle, size, qty });
  }
  state.isOpen = true;
}

function removeItem(handle: string, size: string) {
  const idx = state.lines.findIndex((l) => l.handle === handle && l.size === size);
  if (idx !== -1) state.lines.splice(idx, 1);
}

function updateQty(handle: string, size: string, qty: number) {
  if (qty <= 0) {
    removeItem(handle, size);
    return;
  }
  const line = state.lines.find((l) => l.handle === handle && l.size === size);
  if (line) line.qty = qty;
}

function clear() {
  state.lines.splice(0, state.lines.length);
}

function openCart() {
  state.isOpen = true;
}

function closeCart() {
  state.isOpen = false;
}

const count = computed(() => state.lines.reduce((n, l) => n + l.qty, 0));

const subtotal = computed(() =>
  state.lines.reduce((sum, l) => {
    const product = getProduct(l.handle);
    return sum + (product ? product.price * l.qty : 0);
  }, 0)
);

/**
 * Module-level singleton store — deliberately not Pinia. Two SKUs and a
 * handful of components don't need a store library; this is the same
 * pattern scaled down.
 */
export function useCart() {
  return {
    lines: computed(() => state.lines),
    isOpen: computed(() => state.isOpen),
    count,
    subtotal,
    addItem,
    removeItem,
    updateQty,
    clear,
    openCart,
    closeCart,
  };
}
