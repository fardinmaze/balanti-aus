<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { products, type Gender, type Style } from "@/lib/products";
import ProductCard from "@/components/product/ProductCard.vue";
import FilterGroup from "@/components/catalogue/FilterGroup.vue";
import PriceRangeSlider from "@/components/catalogue/PriceRangeSlider.vue";
import SlidersIcon from "@/components/ui/icons/SlidersIcon.vue";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc";

const GENDER_VALUES: Gender[] = ["men", "women"];
const STYLE_VALUES: Style[] = ["formal", "casual", "boots"];
const SORT_VALUES: SortKey[] = ["featured", "newest", "price-asc", "price-desc"];

const GENDER_LABELS: Record<Gender, string> = { men: "Men's", women: "Women's" };
const STYLE_LABELS: Record<Style, string> = { formal: "Formal", casual: "Casual", boots: "Boots" };
const TYPE_LABELS: Record<string, string> = {
  boots: "Boots",
  loafers: "Loafers",
  sneakers: "Sneakers",
  sandals: "Sandals",
  socks: "Socks",
  laces: "Shoe Laces",
  "mens-bag": "Men's Bags",
  "womens-handbag": "Women's Handbags",
  accessories: "Accessories",
  kids: "Kids",
};

const ALL_COLORS = [...new Set(products.map((p) => p.colorway))].sort();
const ALL_MATERIALS = [...new Set(products.map((p) => p.material))].sort();
const PRICE_MIN = Math.min(...products.map((p) => p.price));
const PRICE_MAX = Math.max(...products.map((p) => p.price));
const colorSwatches: Record<string, string> = {};
for (const p of products) if (!colorSwatches[p.colorway]) colorSwatches[p.colorway] = p.tone;

const route = useRoute();
const router = useRouter();

const showFilters = ref(true);
const selectedGenders = ref<Gender[]>([]);
const selectedStyles = ref<Style[]>([]);
const selectedColors = ref<string[]>([]);
const selectedMaterials = ref<string[]>([]);
const priceMin = ref(PRICE_MIN);
const priceMax = ref(PRICE_MAX);
const sort = ref<SortKey>("featured");
// Not a sidebar facet — set only by the homepage "Shop by Type" rail and
// the empty Kids/Accessories entry points. Shown as a removable chip
// instead so it's still visible and clearable, per the same "show what
// was clicked" rule as the checkbox facets.
const typeParam = ref<string | null>(null);

function toArray(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.flatMap((v) => String(v).split(",")).filter(Boolean);
  return String(value).split(",").filter(Boolean);
}

function hydrateFromQuery() {
  const q = route.query;
  selectedGenders.value = toArray(q.gender).filter((v): v is Gender => GENDER_VALUES.includes(v as Gender));
  selectedStyles.value = toArray(q.style).filter((v): v is Style => STYLE_VALUES.includes(v as Style));
  selectedColors.value = toArray(q.color).filter((v) => ALL_COLORS.includes(v));
  selectedMaterials.value = toArray(q.material).filter((v) => ALL_MATERIALS.includes(v));
  priceMin.value = q.price_min ? Math.max(PRICE_MIN, Number(q.price_min)) : PRICE_MIN;
  priceMax.value = q.price_max ? Math.min(PRICE_MAX, Number(q.price_max)) : PRICE_MAX;
  const sortValue = String(q.sort ?? "");
  sort.value = SORT_VALUES.includes(sortValue as SortKey) ? (sortValue as SortKey) : "featured";
  typeParam.value = q.type ? String(q.type) : null;
}

watch(() => route.query, hydrateFromQuery, { immediate: true });

function syncQuery() {
  const query: Record<string, string> = {};
  if (selectedGenders.value.length) query.gender = selectedGenders.value.join(",");
  if (selectedStyles.value.length) query.style = selectedStyles.value.join(",");
  if (selectedColors.value.length) query.color = selectedColors.value.join(",");
  if (selectedMaterials.value.length) query.material = selectedMaterials.value.join(",");
  if (priceMin.value !== PRICE_MIN) query.price_min = String(priceMin.value);
  if (priceMax.value !== PRICE_MAX) query.price_max = String(priceMax.value);
  if (sort.value !== "featured") query.sort = sort.value;
  if (typeParam.value) query.type = typeParam.value;
  router.replace({ query });
}

function clearAll() {
  selectedGenders.value = [];
  selectedStyles.value = [];
  selectedColors.value = [];
  selectedMaterials.value = [];
  priceMin.value = PRICE_MIN;
  priceMax.value = PRICE_MAX;
  typeParam.value = null;
  syncQuery();
}

const filtered = computed(() => {
  let list = products;
  if (typeParam.value) list = list.filter((p) => p.shopType === typeParam.value);
  if (selectedGenders.value.length) list = list.filter((p) => selectedGenders.value.includes(p.gender));
  if (selectedStyles.value.length) list = list.filter((p) => selectedStyles.value.includes(p.style));
  if (selectedColors.value.length) list = list.filter((p) => selectedColors.value.includes(p.colorway));
  if (selectedMaterials.value.length) list = list.filter((p) => selectedMaterials.value.includes(p.material));
  list = list.filter((p) => p.price >= priceMin.value && p.price <= priceMax.value);
  return list;
});

const sorted = computed(() => {
  const list = [...filtered.value];
  const index = (p: (typeof products)[number]) => products.indexOf(p);
  switch (sort.value) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "newest":
      return list.sort((a, b) => index(b) - index(a));
    case "featured":
    default:
      return list.sort((a, b) => index(a) - index(b));
  }
});

const heading = computed(() => {
  const parts: string[] = [];
  if (selectedGenders.value.length === 1) parts.push(GENDER_LABELS[selectedGenders.value[0]]);
  if (typeParam.value) parts.push(TYPE_LABELS[typeParam.value] ?? typeParam.value);
  else if (selectedStyles.value.length === 1) parts.push(STYLE_LABELS[selectedStyles.value[0]]);
  return parts.length ? parts.join(" ") : "All Products";
});

type Chip = { key: string; label: string; remove: () => void };
const chips = computed<Chip[]>(() => {
  const list: Chip[] = [];
  if (typeParam.value) {
    list.push({
      key: `type-${typeParam.value}`,
      label: TYPE_LABELS[typeParam.value] ?? typeParam.value,
      remove: () => {
        typeParam.value = null;
        syncQuery();
      },
    });
  }
  for (const g of selectedGenders.value) {
    list.push({
      key: `gender-${g}`,
      label: GENDER_LABELS[g],
      remove: () => {
        selectedGenders.value = selectedGenders.value.filter((v) => v !== g);
        syncQuery();
      },
    });
  }
  for (const s of selectedStyles.value) {
    list.push({
      key: `style-${s}`,
      label: STYLE_LABELS[s],
      remove: () => {
        selectedStyles.value = selectedStyles.value.filter((v) => v !== s);
        syncQuery();
      },
    });
  }
  for (const c of selectedColors.value) {
    list.push({
      key: `color-${c}`,
      label: c,
      remove: () => {
        selectedColors.value = selectedColors.value.filter((v) => v !== c);
        syncQuery();
      },
    });
  }
  for (const m of selectedMaterials.value) {
    list.push({
      key: `material-${m}`,
      label: m,
      remove: () => {
        selectedMaterials.value = selectedMaterials.value.filter((v) => v !== m);
        syncQuery();
      },
    });
  }
  if (priceMin.value !== PRICE_MIN || priceMax.value !== PRICE_MAX) {
    list.push({
      key: "price",
      label: `$${priceMin.value}–$${priceMax.value}`,
      remove: () => {
        priceMin.value = PRICE_MIN;
        priceMax.value = PRICE_MAX;
        syncQuery();
      },
    });
  }
  return list;
});
</script>

<template>
  <section class="!pt-8 sm:!pt-12">
    <div class="container">
      <div class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1>{{ heading }}</h1>
          <p class="text-sm text-muted">{{ sorted.length }} {{ sorted.length === 1 ? "product" : "products" }}</p>
        </div>

        <div class="flex items-center gap-6">
          <button
            type="button"
            class="inline-flex items-center gap-2 text-sm font-semibold"
            @click="showFilters = !showFilters"
          >
            <SlidersIcon class="h-4 w-4" />
            {{ showFilters ? "Hide Filters" : "Show Filters" }}
          </button>

          <label class="flex items-center gap-2 text-sm font-semibold">
            Sort By
            <select
              v-model="sort"
              class="min-h-[var(--tap-min)] rounded-md border border-line bg-surface px-2 text-sm font-normal"
              @change="syncQuery"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-desc">Price: High - Low</option>
              <option value="price-asc">Price: Low - High</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="chips.length" class="mt-6 flex flex-wrap gap-2">
        <button
          v-for="chip in chips"
          :key="chip.key"
          type="button"
          class="inline-flex items-center gap-2 rounded-pill border border-line px-3 py-1.5 text-xs font-medium"
          @click="chip.remove"
        >
          {{ chip.label }}
          <span aria-hidden="true">✕</span>
          <span class="sr-only">Remove filter</span>
        </button>
        <button type="button" class="text-xs font-medium text-muted underline" @click="clearAll">
          Clear all
        </button>
      </div>

      <div class="mt-8 grid gap-10" :class="showFilters ? 'lg:grid-cols-[240px_1fr]' : 'grid-cols-1'">
        <aside v-if="showFilters">
          <FilterGroup heading="Gender" :count="selectedGenders.length">
            <label v-for="g in GENDER_VALUES" :key="g" class="flex items-center gap-3 text-sm">
              <input
                v-model="selectedGenders"
                type="checkbox"
                :value="g"
                class="h-4 w-4 accent-[var(--ink)]"
                @change="syncQuery"
              />
              {{ GENDER_LABELS[g] }}
            </label>
          </FilterGroup>

          <FilterGroup heading="Style" :count="selectedStyles.length">
            <label v-for="s in STYLE_VALUES" :key="s" class="flex items-center gap-3 text-sm">
              <input
                v-model="selectedStyles"
                type="checkbox"
                :value="s"
                class="h-4 w-4 accent-[var(--ink)]"
                @change="syncQuery"
              />
              {{ STYLE_LABELS[s] }}
            </label>
          </FilterGroup>

          <FilterGroup heading="Color" :count="selectedColors.length">
            <label v-for="c in ALL_COLORS" :key="c" class="flex items-center gap-3 text-sm">
              <input
                v-model="selectedColors"
                type="checkbox"
                :value="c"
                class="h-4 w-4 accent-[var(--ink)]"
                @change="syncQuery"
              />
              <span class="h-3 w-3 shrink-0 rounded-pill border border-line" :style="{ backgroundColor: colorSwatches[c] }" />
              {{ c }}
            </label>
          </FilterGroup>

          <FilterGroup heading="Shop By Price">
            <PriceRangeSlider
              :min="PRICE_MIN"
              :max="PRICE_MAX"
              :model-min="priceMin"
              :model-max="priceMax"
              @update:model-min="priceMin = $event"
              @update:model-max="priceMax = $event"
              @commit="syncQuery"
            />
          </FilterGroup>

          <FilterGroup heading="Upper Material" :count="selectedMaterials.length">
            <label v-for="m in ALL_MATERIALS" :key="m" class="flex items-center gap-3 text-sm">
              <input
                v-model="selectedMaterials"
                type="checkbox"
                :value="m"
                class="h-4 w-4 accent-[var(--ink)]"
                @change="syncQuery"
              />
              {{ m }}
            </label>
          </FilterGroup>
        </aside>

        <div>
          <p v-if="sorted.length === 0" class="text-muted">
            No products match your filters yet.
            <button type="button" class="underline" @click="clearAll">Clear filters</button>
          </p>
          <div v-else class="grid grid-cols-2 gap-[2px] sm:grid-cols-3" :class="!showFilters && 'lg:grid-cols-4'">
            <ProductCard v-for="product in sorted" :key="product.handle" :product="product" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
