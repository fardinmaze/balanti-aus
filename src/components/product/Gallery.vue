<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import type { ColorPhoto, Product } from "@/types/product";
import PlaceholderImage, { type Angle } from "@/components/ui/PlaceholderImage.vue";

const props = defineProps<{ product: Product; activePhotos?: ColorPhoto[] }>();

type Thumb = { key: string; url?: string; thumbUrl?: string; label: string; angle?: Angle };

const ANGLES: Angle[] = ["front", "side", "sole", "worn"];

/** First color (in API order) that actually carries photos — the gallery's default before any BuyBox selection. */
const firstColorWithPhotos = computed(() => props.product.colorOptions.find((c) => c.photos.length > 0));

/** The photo set currently on display: BuyBox's selected color if it has photos, else the first color that does. */
const displayedPhotos = computed(() => {
  if (props.activePhotos?.length) return props.activePhotos;
  return firstColorWithPhotos.value?.photos ?? [];
});

/**
 * Per-color photos (matrix mechanism, §5.1) are the only real photography
 * source for these products — the general `product.images` list isn't used
 * here. Falls back to angle placeholders only when the product has no colors
 * with photos at all (never fabricated).
 */
const thumbnails = computed<Thumb[]>(() => {
  if (displayedPhotos.value.length) {
    return displayedPhotos.value.map((photo, i) => ({
      key: `img-${i}`,
      url: photo.image,
      thumbUrl: photo.thumbnail,
      label: `${props.product.name} — photo ${i + 1}`,
    }));
  }
  const legacyImage = props.product.image;
  return ANGLES.map((angle) => ({
    key: angle,
    angle,
    label: `${angle} view`,
    url: angle === "front" ? legacyImage : undefined,
  }));
});

const activeKey = ref<string>(thumbnails.value[0]?.key ?? "front");

// Default to the first photo whenever the displayed photo set changes —
// product change, or a different color picked in BuyBox.
watch(
  () => [props.product.handle, props.activePhotos],
  () => {
    activeKey.value = thumbnails.value[0]?.key ?? "front";
  },
  { immediate: true }
);

const activeIndex = computed(() => thumbnails.value.findIndex((t) => t.key === activeKey.value));

function goToOffset(offset: number) {
  const count = thumbnails.value.length;
  if (count < 2) return;
  const nextIndex = (activeIndex.value + offset + count) % count;
  activeKey.value = thumbnails.value[nextIndex].key;
}

const activeThumb = computed(() => thumbnails.value.find((t) => t.key === activeKey.value) ?? thumbnails.value[0]);
// The hero slot shows the full-resolution photo — thumbnails are generated small
// (for the strip below) and look soft/blurry stretched up to hero size. The zoom
// modal reuses the same source, so `heroImage` doubles as `heroFullImage`.
const heroImage = computed(() => activeThumb.value?.url ?? activeThumb.value?.thumbUrl);
const heroAngle = computed<Angle>(() => activeThumb.value?.angle ?? "front");
const heroAlt = computed(() => `${props.product.name} — ${props.product.material}, ${props.product.colorway}`);

// --- Zoom viewer -----------------------------------------------------------
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;
const ZOOM_TOGGLE = 2.5;

const isZoomOpen = ref(false);
const zoomScale = ref(ZOOM_MIN);
const zoomTranslate = ref({ x: 0, y: 0 });
const isDragging = ref(false);
let dragStart = { x: 0, y: 0 };
let translateStart = { x: 0, y: 0 };
// A pointerup after an actual drag also fires a click on the image — suppress the
// next toggleZoomAtClick so panning doesn't snap the zoom back out.
let didDrag = false;

function resetZoom() {
  zoomScale.value = ZOOM_MIN;
  zoomTranslate.value = { x: 0, y: 0 };
}

function openZoom() {
  if (!heroImage.value) return;
  resetZoom();
  isZoomOpen.value = true;
}

function closeZoom() {
  isZoomOpen.value = false;
  resetZoom();
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

function goToOffsetInZoom(offset: number) {
  goToOffset(offset);
  resetZoom();
}

function onZoomKeydown(event: KeyboardEvent) {
  if (event.key === "+" || event.key === "=") zoomIn();
  else if (event.key === "-") zoomOut();
  else if (event.key === "ArrowLeft") goToOffsetInZoom(-1);
  else if (event.key === "ArrowRight") goToOffsetInZoom(1);
}

// Bound on `window` rather than the dialog element — focus may still be on the hero
// button that opened it (Teleport moves the dialog out of that button's ancestry).
watch(isZoomOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
  if (open) window.addEventListener("keydown", onZoomKeydown);
  else window.removeEventListener("keydown", onZoomKeydown);
});

onUnmounted(() => {
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onZoomKeydown);
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-start gap-3">
      <div class="relative w-full max-w-[520px] flex-1 min-w-0">
        <button
          v-if="heroImage"
          type="button"
          class="group relative h-full w-full overflow-hidden rounded-lg cursor-zoom-in"
          aria-label="Open full-size image viewer"
          @click="openZoom"
        >
          <img
            :src="heroImage"
            :alt="heroAlt"
            loading="eager"
            decoding="async"
            fetchpriority="high"
            class="h-full w-full object-cover transition-transform duration-[var(--dur-mid)] ease-[var(--ease)] group-hover:scale-[1.03]"
          />
        </button>
        <PlaceholderImage v-else :tone="product.tone" :label="product.name" :angle="heroAngle" class="h-full w-full rounded-lg" />

        <template v-if="thumbnails.length > 1">
          <button
            type="button"
            class="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
            aria-label="Previous image"
            @click="goToOffset(-1)"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            class="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
            aria-label="Next image"
            @click="goToOffset(1)"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </template>
      </div>

      <div class="flex max-h-[520px] shrink-0 flex-col gap-2 overflow-y-auto">
        <button
          v-for="thumb in thumbnails"
          :key="thumb.key"
          type="button"
          :aria-pressed="activeKey === thumb.key"
          :aria-label="`Show ${thumb.label}`"
          class="h-20 w-20 shrink-0 overflow-hidden rounded-md border transition-opacity"
          :class="activeKey === thumb.key ? 'border-ink' : 'border-line opacity-70 hover:opacity-100'"
          @click="activeKey = thumb.key"
        >
          <img
            v-if="thumb.url"
            :src="thumb.thumbUrl ?? thumb.url"
            :alt="thumb.label"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
          <PlaceholderImage v-else :tone="product.tone" :label="product.name" :angle="thumb.angle!" class="h-full w-full" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="zoom-fade">
        <div
          v-if="isZoomOpen"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          :aria-label="`${product.name} — full-size image`"
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
            aria-label="Close image viewer"
            @click="closeZoom"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <template v-if="thumbnails.length > 1">
            <button
              type="button"
              class="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
              aria-label="Previous image"
              @click="goToOffsetInZoom(-1)"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              class="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill bg-paper text-ink shadow-[var(--shadow-card)]"
              aria-label="Next image"
              @click="goToOffsetInZoom(1)"
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
              v-if="heroImage"
              :src="heroImage"
              :alt="heroAlt"
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
  </div>
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
