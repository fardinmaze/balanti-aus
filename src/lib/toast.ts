import { reactive } from "vue";

export type Toast = { id: number; message: string };

const DEFAULT_DURATION_MS = 4000;

const toasts = reactive<Toast[]>([]);
let nextId = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function dismiss(id: number) {
  const index = toasts.findIndex((t) => t.id === id);
  if (index !== -1) toasts.splice(index, 1);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

function show(message: string, duration = DEFAULT_DURATION_MS): number {
  const id = ++nextId;
  toasts.push({ id, message });
  timers.set(
    id,
    setTimeout(() => dismiss(id), duration)
  );
  return id;
}

/** App-wide toast queue — rendered by ToastStack.vue (mounted once in App.vue). */
export function useToast() {
  return { toasts, show, dismiss };
}
