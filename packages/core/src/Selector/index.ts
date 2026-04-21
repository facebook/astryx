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
export {XDSSelectorOption} from './XDSSelectorOption';
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
