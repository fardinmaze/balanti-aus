<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

/**
 * Full-size pan/zoom modal, shared by Gallery (color photos) and ProductView's
 * description thumbnails. Fully controlled: the caller owns `open`/`index` and
 * this component just renders + emits navigation/zoom intent.
 */
const props = defineProps<{
  open: boolean;
  images: { url: string; alt: string }[];
  index: number;
  label: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "update:index": [value: number];
}>();

const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;
const ZOOM_TOGGLE = 2.5;

const zoomScale = ref(ZOOM_MIN);
const zoomTranslate = ref({ x: 0, y: 0 });
const isDragging = ref(false);
let dragStart = { x: 0, y: 0 };
let translateStart = { x: 0, y: 0 };
// A pointerup after an actual drag also fires a click on the image — suppress the
// next toggleZoomAtClick so panning doesn't snap the zoom back out.
let didDrag = false;

const activeImage = computed(() => props.images[props.index]);

function resetZoom() {
  zoomScale.value = ZOOM_MIN;
  zoomTranslate.value = { x: 0, y: 0 };
}

function close() {
  emit("update:open", false);
}

function clampScale(scale: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(scale * 100) / 100));
}

function setScale(scale: number) {
  zoomScale.value = clampScale(scale);
  if (zoomScale.value === ZOOM_MIN) zoomTranslate.value = { x: 0, y: 0 };
}

function zoomIn() {
  setScale(zoomScale.value + ZOOM_STEP);
}

function zoomOut() {
  setScale(zoomScale.value - ZOOM_STEP);
}

function toggleZoomAtClick() {
  if (didDrag) {
    didDrag = false;
    return;
  }
  setScale(zoomScale.value > ZOOM_MIN ? ZOOM_MIN : ZOOM_TOGGLE);
}

function onWheel(event: WheelEvent) {
  event.preventDefault();
  setScale(zoomScale.value + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
}

function onPointerDown(event: PointerEvent) {
  if (zoomScale.value <= ZOOM_MIN) return;
  isDragging.value = true;
  didDrag = false;
  dragStart = { x: event.clientX, y: event.clientY };
  translateStart = { ...zoomTranslate.value };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value) return;
  const dx = event.clientX - dragStart.x;
  const dy = event.clientY - dragStart.y;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag = true;
  zoomTranslate.value = { x: translateStart.x + dx, y: translateStart.y + dy };
}

function onPointerUp() {
  isDragging.value = false;
}

function goToOffset(offset: number) {
  const count = props.images.length;
  if (count < 2) return;
  const nextIndex = (props.index + offset + count) % count;
  emit("update:index", nextIndex);
  resetZoom();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "+" || event.key === "=") zoomIn();
  else if (event.key === "-") zoomOut();
  else if (event.key === "ArrowLeft") goToOffset(-1);
  else if (event.key === "ArrowRight") goToOffset(1);
}

// Bound on `window` rather than the dialog element — focus may still be on the hero
// button that opened it (Teleport moves the dialog out of that button's ancestry).
watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      resetZoom();
      window.addEventListener("keydown", onKeydown);
    } else {
      window.removeEventListener("keydown", onKeydown);
    }
  }
);

onUnmounted(() => {
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="zoom-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="`${label} — full-size image`"
      >
        <button
          type="button"
          class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
          aria-label="Close image viewer"
          @click="close"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <template v-if="images.length > 1">
          <button
            type="button"
            class="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
            aria-label="Previous image"
            @click="goToOffset(-1)"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            class="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
            aria-label="Next image"
            @click="goToOffset(1)"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </template>

        <div
          class="relative flex h-full w-full max-w-4xl select-none items-center justify-center overflow-hidden p-6 sm:p-12"
          @wheel="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointerleave="onPointerUp"
        >
          <img
            v-if="activeImage?.url"
            :src="activeImage.url"
            :alt="activeImage.alt"
            class="max-h-full max-w-full touch-none object-contain transition-transform duration-100 ease-out"
            :class="zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'"
            :style="{ transform: `translate(${zoomTranslate.x}px, ${zoomTranslate.y}px) scale(${zoomScale})` }"
            draggable="false"
            @click.stop="toggleZoomAtClick"
          />
        </div>

        <div
          class="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-pill bg-paper px-2 py-2 shadow-[var(--shadow-card)]"
        >
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-pill text-ink disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Zoom out"
            :disabled="zoomScale <= ZOOM_MIN"
            @click="zoomOut"
          >
            −
          </button>
          <span class="eyebrow w-12 text-center text-ink">{{ Math.round(zoomScale * 100) }}%</span>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-pill text-ink disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Zoom in"
            :disabled="zoomScale >= ZOOM_MAX"
            @click="zoomIn"
          >
            +
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: opacity var(--dur-mid) var(--ease);
}
.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .zoom-fade-enter-active,
  .zoom-fade-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
