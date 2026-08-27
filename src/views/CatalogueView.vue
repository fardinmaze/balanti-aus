<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCatalogue } from "@/lib/catalogue";
import { isTopLevelCategory } from "@/lib/category";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard.vue";
import FilterGroup from "@/components/catalogue/FilterGroup.vue";
import PriceRangeSlider from "@/components/catalogue/PriceRangeSlider.vue";
import SlidersIcon from "@/components/ui/icons/SlidersIcon.vue";

type SortKey = "featured" | "newest" | "price-asc" | "price-desc";
const SORT_VALUES: SortKey[] = ["featured", "newest", "price-asc", "price-desc"];

const catalogue = useCatalogue();
const route = useRoute();
const router = useRouter();

// The full category tree — including subcategories — drives the Category
// filter here (GET /site-api/all-categories); the homepage tiles use only
// top-categories. See FRONTEND_API_GUIDE.md §5.1.
const selectedCategorySlug = ref<string | null>(null);
const categoryScopedProducts = ref<Product[] | null>(null);
const categoryLoading = ref(false);

async function loadCategoryProducts(slug: string | null) {
  if (!slug) {
    categoryScopedProducts.value = null;
    return;
  }
  const category = catalogue.categories.value.find((c) => c.slug === slug);
  if (!category) {
    categoryScopedProducts.value = [];
    return;
  }
  categoryLoading.value = true;
  categoryScopedProducts.value = isTopLevelCategory(category)
    ? await catalogue.fetchParentCategoryProducts(slug)
    : await catalogue.fetchCategoryProducts(slug);
  categoryLoading.value = false;
}

watch(
  [selectedCategorySlug, () => catalogue.categories.value.length],
  () => loadCategoryProducts(selectedCategorySlug.value),
  { immediate: true }
);

const baseProducts = computed(() => categoryScopedProducts.value ?? catalogue.products.value);

const ALL_COLORS = computed(() => [...new Set(baseProducts.value.map((p) => p.colorway).filter(Boolean))].sort());
const ALL_MATERIALS = computed(() => [...new Set(baseProducts.value.map((p) => p.material).filter(Boolean))].sort());
const PRICE_MIN = computed(() => (baseProducts.value.length ? Math.min(...baseProducts.value.map((p) => p.price)) : 0));
const PRICE_MAX = computed(() => (baseProducts.value.length ? Math.max(...baseProducts.value.map((p) => p.price)) : 0));
const colorSwatches = computed(() => {
  const swatches: Record<string, string> = {};
  for (const p of baseProducts.value) if (p.colorway && !swatches[p.colorway]) swatches[p.colorway] = p.tone;
  return swatches;
});

const showFilters = ref(true);
const selectedColors = ref<string[]>([]);
const selectedMaterials = ref<string[]>([]);
const priceMin = ref(PRICE_MIN.value);
const priceMax = ref(PRICE_MAX.value);
const sort = ref<SortKey>("featured");

function toArray(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.flatMap((v) => String(v).split(",")).filter(Boolean);
  return String(value).split(",").filter(Boolean);
}

function hydrateFromQuery() {
  const q = route.query;
  selectedCategorySlug.value = q.category ? String(q.category) : null;
  selectedColors.value = toArray(q.color).filter((v) => ALL_COLORS.value.includes(v));
  selectedMaterials.value = toArray(q.material).filter((v) => ALL_MATERIALS.value.includes(v));
  priceMin.value = q.price_min ? Math.max(PRICE_MIN.value, Number(q.price_min)) : PRICE_MIN.value;
  priceMax.value = q.price_max ? Math.min(PRICE_MAX.value, Number(q.price_max)) : PRICE_MAX.value;
  const sortValue = String(q.sort ?? "");
  sort.value = SORT_VALUES.includes(sortValue as SortKey) ? (sortValue as SortKey) : "featured";
}

watch(() => route.query, hydrateFromQuery, { immediate: true });

function syncQuery() {
  const query: Record<string, string> = {};
  if (selectedCategorySlug.value) query.category = selectedCategorySlug.value;
  if (selectedColors.value.length) query.color = selectedColors.value.join(",");
  if (selectedMaterials.value.length) query.material = selectedMaterials.value.join(",");
  if (priceMin.value !== PRICE_MIN.value) query.price_min = String(priceMin.value);
  if (priceMax.value !== PRICE_MAX.value) query.price_max = String(priceMax.value);
  if (sort.value !== "featured") query.sort = sort.value;
  router.replace({ query });
}

function selectCategory(slug: string | null) {
  selectedCategorySlug.value = slug;
  syncQuery();
}

function clearAll() {
  selectedCategorySlug.value = null;
  selectedColors.value = [];
  selectedMaterials.value = [];
  priceMin.value = PRICE_MIN.value;
  priceMax.value = PRICE_MAX.value;
  syncQuery();
}

const filtered = computed(() => {
  let list = baseProducts.value;
  if (selectedColors.value.length) list = list.filter((p) => selectedColors.value.includes(p.colorway));
  if (selectedMaterials.value.length) list = list.filter((p) => selectedMaterials.value.includes(p.material));
  list = list.filter((p) => p.price >= priceMin.value && p.price <= priceMax.value);
  return list;
});

const sorted = computed(() => {
  const list = [...filtered.value];
  const index = (p: Product) => baseProducts.value.indexOf(p);
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

const selectedCategory = computed(() => catalogue.categories.value.find((c) => c.slug === selectedCategorySlug.value));
const heading = computed(() => selectedCategory.value?.name ?? "All Products");

type Chip = { key: string; label: string; remove: () => void };
const chips = computed<Chip[]>(() => {
  const list: Chip[] = [];
  if (selectedCategory.value) {
    list.push({
      key: `category-${selectedCategory.value.slug}`,
      label: selectedCategory.value.name,
      remove: () => selectCategory(null),
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
  if (priceMin.value !== PRICE_MIN.value || priceMax.value !== PRICE_MAX.value) {
    list.push({
      key: "price",
      label: `$${priceMin.value}–$${priceMax.value}`,
      remove: () => {
        priceMin.value = PRICE_MIN.value;
        priceMax.value = PRICE_MAX.value;
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
          <FilterGroup heading="Category" :count="selectedCategory ? 1 : 0">
            <label class="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="category"
                :checked="!selectedCategorySlug"
                class="h-4 w-4 accent-[var(--ink)]"
                @change="selectCategory(null)"
              />
              All
            </label>
            <label v-for="cat in catalogue.categories.value" :key="cat.id" class="flex items-center gap-3 text-sm">
              <input
                type="radio"
                name="category"
                :value="cat.slug"
                :checked="selectedCategorySlug === cat.slug"
                class="h-4 w-4 accent-[var(--ink)]"
                :class="!isTopLevelCategory(cat) && 'ml-3'"
                @change="selectCategory(cat.slug)"
              />
              <span :class="!isTopLevelCategory(cat) && 'text-muted'">{{ cat.name }}</span>
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
          <p v-if="catalogue.loading.value || categoryLoading" class="text-muted">Loading products…</p>
          <p v-else-if="sorted.length === 0" class="text-muted">
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
