// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @output Utility functions for XDSSelector
 * @position Utilities; used by XDSSelector.tsx
 */

import type {
  XDSSelectorOptionType,
  XDSSelectorOptionData,
  XDSSelectorDivider,
  XDSSelectorSection,
} from './types';

/**
 * Type guard: check if option is a selectable option (string or OptionData)
 */
export function isOptionData(
  option: XDSSelectorOptionType,
): option is XDSSelectorOptionData | string {
  if (typeof option === 'string') return true;
  return !('type' in option);
}

/**
 * Type guard: check if option is a divider
 */
export function isDivider(
  option: XDSSelectorOptionType,
): option is XDSSelectorDivider {
  return (
    typeof option === 'object' && 'type' in option && option.type === 'divider'
  );
}

/**
 * Type guard: check if option is a section
 */
export function isSection(
  option: XDSSelectorOptionType,
): option is XDSSelectorSection {
  return (
    typeof option === 'object' && 'type' in option && option.type === 'section'
  );
}

/**
 * Normalize string or option to consistent shape
 */
export function normalizeOption(
  option: string | XDSSelectorOptionData,
): XDSSelectorOptionData {
  if (typeof option === 'string') {
    return {value: option, label: option};
  }
  return {
    ...option,
    label: option.label ?? option.value,
  };
}

/**
 * Get all selectable options (flattening sections)
 */
export function getSelectableOptions(
  options: XDSSelectorOptionType[],
): XDSSelectorOptionData[] {
  const result: XDSSelectorOptionData[] = [];

  for (const option of options) {
    if (isOptionData(option)) {
      result.push(normalizeOption(option));
    } else if (isSection(option)) {
      for (const opt of option.options) {
        result.push(normalizeOption(opt));
      }
    }
    // Skip dividers
  }

  return result;
}
