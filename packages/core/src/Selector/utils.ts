/**
 * @file utils.ts
 * @output Utility functions for XDSSelector
 * @position Utilities; used by XDSSelector.tsx
 */

import type {
  XDSSelectorOption,
  XDSSelectorItemData,
  XDSSelectorDivider,
  XDSSelectorSection,
} from './types';

/**
 * Type guard: check if option is a selectable item (string or ItemData)
 */
export function isItemData(
  option: XDSSelectorOption,
): option is XDSSelectorItemData | string {
  if (typeof option === 'string') return true;
  return !('type' in option);
}

/**
 * Type guard: check if option is a divider
 */
export function isDivider(
  option: XDSSelectorOption,
): option is XDSSelectorDivider {
  return (
    typeof option === 'object' && 'type' in option && option.type === 'divider'
  );
}

/**
 * Type guard: check if option is a section
 */
export function isSection(
  option: XDSSelectorOption,
): option is XDSSelectorSection {
  return (
    typeof option === 'object' && 'type' in option && option.type === 'section'
  );
}

/**
 * Normalize string or item to consistent shape
 */
export function normalizeItem(
  option: string | XDSSelectorItemData,
): XDSSelectorItemData {
  if (typeof option === 'string') {
    return {value: option, label: option};
  }
  return {
    ...option,
    label: option.label ?? option.value,
  };
}

/**
 * Get all selectable items from options (flattening sections)
 */
export function getSelectableItems(
  options: XDSSelectorOption[],
): XDSSelectorItemData[] {
  const items: XDSSelectorItemData[] = [];

  for (const option of options) {
    if (isItemData(option)) {
      items.push(normalizeItem(option));
    } else if (isSection(option)) {
      for (const item of option.items) {
        items.push(normalizeItem(item));
      }
    }
    // Skip dividers
  }

  return items;
}
