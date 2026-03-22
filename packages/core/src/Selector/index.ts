'use client';

/**
 * @file index.ts
 * @output Exports XDSSelector and types
 * @position Public API entry point
 */

export {
  XDSSelector,
  type XDSSelectorProps,
  type XDSSelectorSize,
  type XDSSelectorStatus,
  type XDSSelectorStatusType,
} from './XDSSelector';
export {
  XDSSelectorOption,
  type XDSSelectorOptionProps,
} from './XDSSelectorOption';
export type {
  XDSSelectorOptionType,
  XDSSelectorOptionData,
  XDSSelectorDivider,
  XDSSelectorSection,
} from './types';
export {
  isOptionData,
  isDivider,
  isSection,
  normalizeOption,
  getSelectableOptions,
} from './utils';
export {useCombobox, useSelectedItemOffset} from './hooks';

// Backward compatibility — deprecated exports
export {XDSSelectorItem, type XDSSelectorItemProps} from './XDSSelectorItem';
export type {
  XDSSelectorOption as XDSSelectorOptionLegacy,
  XDSSelectorItemData,
} from './types';
export {isItemData, normalizeItem, getSelectableItems} from './utils';
