import { readonly, ref } from "vue";
import type { BackendCategory } from "@/api/types";

/**
 * `/all-categories` returns a one-level-deep tree (each top-level row carries
 * its own children in `subcategories`) rather than a flat list with a
 * `parent` field — verified against a live response, there is no `parent`
 * field at all. Flatten it once here so the rest of the app (category filter,
 * mega menu, "Shop by Type") can keep treating categories as a flat list,
 * with `isTop`/`parentId` standing in for the documented-but-nonexistent
 * `parent` field.
 */
export type FlatCategory = Omit<BackendCategory, "subcategories"> & {
  isTop: boolean;
  parentId: number | null;
};

export function flattenCategories(tree: BackendCategory[]): FlatCategory[] {
  const flat: FlatCategory[] = [];
  for (const top of tree) {
    const { subcategories, ...rest } = top;
    flat.push({ ...rest, isTop: true, parentId: null });
    for (const sub of subcategories ?? []) {
      const { subcategories: _nested, ...subRest } = sub;
      flat.push({ ...subRest, isTop: false, parentId: top.id });
    }
  }
  return flat;
}

export function isTopLevelCategory(category: FlatCategory): boolean {
  return category.isTop;
}

export function isChildOf(category: FlatCategory, parentId: number): boolean {
  return category.parentId === parentId;
}

/** Only these top-level categories are surfaced in the storefront (homepage
 *  tiles, navbar, catalogue filter); anything else the backend seeds, e.g.
 *  Unisex, stays hidden. */
const SHOWN_TOP_CATEGORY_SLUGS = ["men", "women"];

export function isShownTopCategory(category: { slug: string }): boolean {
  return SHOWN_TOP_CATEGORY_SLUGS.includes(category.slug);
}

/** Flat category list limited to the shown top-level categories and their subcategories. */
export function shownCategories(categories: FlatCategory[]): FlatCategory[] {
  const shownTopIds = new Set(categories.filter((c) => c.isTop && isShownTopCategory(c)).map((c) => c.id));
  return categories.filter((c) => shownTopIds.has(c.isTop ? c.id : (c.parentId as number)));
}

/** Unisex products belong under every shown top-level category, so a parent-category fetch for a shown
 *  category also asks for them: "men" → "men,unisex". */
const SHARED_CATEGORY_SLUG = "unisex";

export function parentCategoryQuerySlug(slug: string): string {
  return `${slug},${SHARED_CATEGORY_SLUG}`;
}

/** The shown top-level category (men/women) the shopper last browsed in the catalogue. A shared-category
 *  (unisex) product has no gender of its own, so its breadcrumb borrows this instead. Mirrored to
 *  sessionStorage so a refresh on the product page keeps it. */
const BROWSED_TOP_CATEGORY_KEY = "balanti:browsed-top-category";
const browsedTopCategorySlug = ref<string | null>(readBrowsedTopCategory());

function readBrowsedTopCategory(): string | null {
  try {
    return sessionStorage.getItem(BROWSED_TOP_CATEGORY_KEY);
  } catch {
    return null;
  }
}

/** Records the shown top-level category behind a catalogue category slug (itself, or a subcategory's parent). */
export function rememberBrowsedCategory(slug: string, categories: FlatCategory[]): void {
  const category = categories.find((c) => c.slug === slug);
  const top = category && (category.isTop ? category : categories.find((c) => c.id === category.parentId));
  if (!top || !isShownTopCategory(top)) return;
  browsedTopCategorySlug.value = top.slug;
  try {
    sessionStorage.setItem(BROWSED_TOP_CATEGORY_KEY, top.slug);
  } catch {
    // Storage unavailable — the in-memory ref still covers this session.
  }
}

export function isSharedCategory(category: { slug: string }): boolean {
  return category.slug === SHARED_CATEGORY_SLUG;
}

export const browsedTopCategory = readonly(browsedTopCategorySlug);
