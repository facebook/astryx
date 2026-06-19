// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Selector and types
 * @position Public API entry point
 */

export {
  Selector,
  type SelectorProps,
  type SelectorSize,
  type SelectorStatus,
  type SelectorStatusType,
} from './Selector';
export {SelectorOption} from './SelectorOption';
export type {
  SelectorOptionType,
  SelectorOptionData,
  SelectorDivider,
  SelectorSection,
} from './types';
export {useCombobox, useSelectedItemOffset} from './hooks';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Selector as XDSSelector,
  SelectorOption as XDSSelectorOption,
  useCombobox as useXDSCombobox,
  useSelectedItemOffset as useXDSSelectedItemOffset,
} from '.';
export type {
  SelectorDivider as XDSSelectorDivider,
  SelectorOptionData as XDSSelectorOptionData,
  SelectorOptionType as XDSSelectorOptionType,
  SelectorProps as XDSSelectorProps,
  SelectorSection as XDSSelectorSection,
  SelectorSize as XDSSelectorSize,
  SelectorStatus as XDSSelectorStatus,
  SelectorStatusType as XDSSelectorStatusType,
} from '.';
// <compat-aliases:end>
