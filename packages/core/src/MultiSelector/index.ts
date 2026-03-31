'use client';

/**
 * @file index.ts
 * @output Exports XDSMultiSelector and types
 * @position Public API entry point
 */

export {
  XDSMultiSelector,
  type XDSMultiSelectorProps,
  type XDSMultiSelectorSize,
  type XDSMultiSelectorStatusType,
} from './XDSMultiSelector';
export type {
  XDSMultiSelectorOptionType,
  XDSMultiSelectorOptionData,
  XDSMultiSelectorDivider,
  XDSMultiSelectorSection,
  XDSMultiSelectorStatus,
} from './types';
export {useMultiCombobox} from './hooks';
