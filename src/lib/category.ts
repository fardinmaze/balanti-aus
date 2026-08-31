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
