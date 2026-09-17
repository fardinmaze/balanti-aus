<script setup lang="ts">
import { useToast } from "@/lib/toast";

const { toasts, dismiss } = useToast();
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex flex-col items-center gap-2 px-4">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          role="status"
          class="pointer-events-auto flex max-w-sm items-center gap-3 rounded-pill bg-ink px-4 py-3 text-sm font-medium text-paper shadow-[var(--shadow-card)]"
        >
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="shrink-0 text-paper/70 hover:text-paper"
            aria-label="Dismiss"
            @click="dismiss(toast.id)"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity var(--dur-mid) var(--ease), transform var(--dur-mid) var(--ease);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
.toast-leave-active {
  position: absolute;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
