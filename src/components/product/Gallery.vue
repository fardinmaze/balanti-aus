<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ColorPhoto, Product } from "@/types/product";
import PlaceholderImage, { type Angle } from "@/components/ui/PlaceholderImage.vue";
import ImageZoomViewer from "@/components/product/ImageZoomViewer.vue";

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
const isZoomOpen = ref(false);
const zoomImages = computed(() => thumbnails.value.map((t) => ({ url: t.url ?? t.thumbUrl ?? "", alt: t.label })));

function openZoom() {
  if (!heroImage.value) return;
  isZoomOpen.value = true;
}

function onZoomIndexChange(nextIndex: number) {
  const key = thumbnails.value[nextIndex]?.key;
  if (key) activeKey.value = key;
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div class="relative aspect-square min-w-0 shrink w-[min(100%,calc(100vh-180px))] lg:w-[min(640px,calc(100vh-180px))] xl:w-[min(840px,calc(100vh-180px))]">
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

      <div
        class="flex shrink-0 flex-row gap-1 sm:gap-3 overflow-x-auto pb-1 sm:max-h-[min(840px,calc(100vh-180px))] sm:flex-col sm:overflow-x-visible sm:overflow-y-auto sm:pb-0"
      >
        <button
          v-for="thumb in thumbnails"
          :key="thumb.key"
          type="button"
          :aria-pressed="activeKey === thumb.key"
          :aria-label="`Show ${thumb.label}`"
          class="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-md border transition-opacity md:h-32 md:w-32"
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

    <ImageZoomViewer
      v-model:open="isZoomOpen"
      :images="zoomImages"
      :index="activeIndex"
      :label="product.name"
      @update:index="onZoomIndexChange"
    />
  </div>
</template>
