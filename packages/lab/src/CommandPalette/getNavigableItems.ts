/**
 * @file getNavigableItems.ts
 * @input Items array
 * @output Filtered list of navigable (enabled) items
 * @position Utility; shared by root (auto-highlight) and input (keyboard nav)
 */

export interface RegisteredItem {
  value: string;
  isDisabled?: boolean;
}

/**
 * Returns the subset of registered items that are navigable (not disabled).
 */
export function getNavigableItems(items: RegisteredItem[]): RegisteredItem[] {
  return items.filter(item => !item.isDisabled);
}
