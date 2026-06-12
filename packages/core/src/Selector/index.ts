// Copyright (c) Meta Platforms, Inc. and affiliates.

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
  type XDSSelectorDropdownPlacement,
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
export {useCombobox, useSelectedItemOffset} from './hooks';
