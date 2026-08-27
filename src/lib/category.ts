import type { BackendCategory } from "@/api/types";

/**
 * `Category.parent` is documented as a plain integer (0 = top-level), but some
 * responses come back with it as a string or omit it — compare loosely via
 * `Number(...)` so "0"/0/undefined-vs-0 mismatches don't silently misclassify
 * every category as a subcategory (or vice versa).
 */
export function isTopLevelCategory(category: BackendCategory): boolean {
  return Number(category.parent) === 0;
}

export function isChildOf(category: BackendCategory, parentId: number): boolean {
  return Number(category.parent) === Number(parentId);
}
