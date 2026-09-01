<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Product } from "@/types/product";
import PlaceholderImage, { type Angle } from "@/components/ui/PlaceholderImage.vue";

const props = defineProps<{ product: Product; activeImages?: string[] }>();

type Thumb = { key: string; url?: string; label: string; angle?: Angle };

const ANGLES: Angle[] = ["front", "side", "sole", "worn"];

/** First color (in API order) that actually carries photos — the gallery's default before any BuyBox selection. */
const firstColorWithImages = computed(() => props.product.colorOptions.find((c) => c.images.length > 0));

/** The photo set currently on display: BuyBox's selected color if it has photos, else the first color that does. */
const displayedImages = computed(() => {
  if (props.activeImages?.length) return props.activeImages;
  return firstColorWithImages.value?.images ?? [];
});

/**
 * Per-color photos (matrix mechanism, §5.1) are the only real photography
 * source for these products — the general `product.images` list isn't used
 * here. Falls back to angle placeholders only when the product has no colors
 * with photos at all (never fabricated).
 */
const thumbnails = computed<Thumb[]>(() => {
  if (displayedImages.value.length) {
    return displayedImages.value.map((url, i) => ({
      key: `img-${i}`,
      url,
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
  () => [props.product.handle, props.activeImages],
  () => {
    activeKey.value = thumbnails.value[0]?.key ?? "front";
  },
  { immediate: true }
);

const activeThumb = computed(() => thumbnails.value.find((t) => t.key === activeKey.value) ?? thumbnails.value[0]);
const heroImage = computed(() => activeThumb.value?.url);
const heroAngle = computed<Angle>(() => activeThumb.value?.angle ?? "front");
</script>

<template>
  <div class="flex flex-col gap-3">
    <img
      v-if="heroImage"
      :src="heroImage"
      :alt="`${product.name} — ${product.material}, ${product.colorway}`"
      class="aspect-[5/5] w-full rounded-lg object-cover"
    />
    <PlaceholderImage
      v-else
      :tone="product.tone"
      :label="product.name"
      :angle="heroAngle"
      class="aspect-[5/5] w-full rounded-lg"
    />

    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="thumb in thumbnails"
        :key="thumb.key"
        type="button"
        :aria-pressed="activeKey === thumb.key"
        :aria-label="`Show ${thumb.label}`"
        class="aspect-square overflow-hidden rounded-md border transition-opacity"
        :class="activeKey === thumb.key ? 'border-ink' : 'border-line opacity-70 hover:opacity-100'"
        @click="activeKey = thumb.key"
      >
        <img v-if="thumb.url" :src="thumb.url" :alt="thumb.label" class="h-full w-full object-cover" />
        <PlaceholderImage v-else :tone="product.tone" :label="product.name" :angle="thumb.angle!" class="h-full w-full" />
      </button>
    </div>
  </div>
</template>
