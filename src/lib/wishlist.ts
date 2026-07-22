import { reactive, computed, watch } from "vue";

const STORAGE_KEY = "balanti-wishlist";

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const state = reactive({
  handles: loadInitial(),
});

watch(
  () => state.handles,
  (handles) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(handles));
    } catch {
      /* storage unavailable — wishlist just won't persist across reloads */
    }
  },
  { deep: true }
);

function isWishlisted(handle: string) {
  return state.handles.includes(handle);
}

function toggle(handle: string) {
  const idx = state.handles.indexOf(handle);
  if (idx === -1) state.handles.push(handle);
  else state.handles.splice(idx, 1);
}

function remove(handle: string) {
  const idx = state.handles.indexOf(handle);
  if (idx !== -1) state.handles.splice(idx, 1);
}

const count = computed(() => state.handles.length);

/** Module-level singleton store — same pattern as lib/cart.ts. */
export function useWishlist() {
  return {
    handles: computed(() => state.handles),
    count,
    isWishlisted,
    toggle,
    remove,
  };
}
