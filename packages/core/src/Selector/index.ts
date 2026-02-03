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
export {XDSSelectorItem, type XDSSelectorItemProps} from './XDSSelectorItem';
export type {
  XDSSelectorOption,
  XDSSelectorItemData,
  XDSSelectorDivider,
  XDSSelectorSection,
} from './types';
export {
  isItemData,
  isDivider,
  isSection,
  normalizeItem,
  getSelectableItems,
} from './utils';
export {useCombobox, useSelectedItemOffset} from './hooks';
