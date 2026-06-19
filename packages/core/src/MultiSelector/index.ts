// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports MultiSelector and types
 * @position Public API entry point
 */

export {
  MultiSelector,
  type MultiSelectorProps,
  type MultiSelectorSize,
  type MultiSelectorStatusType,
} from './MultiSelector';
export type {
  MultiSelectorOptionType,
  MultiSelectorOptionData,
  MultiSelectorDivider,
  MultiSelectorSection,
  MultiSelectorStatus,
} from './types';
export {useMultiCombobox} from './hooks';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  MultiSelector as XDSMultiSelector,
  useMultiCombobox as useXDSMultiCombobox,
} from '.';
export type {
  MultiSelectorDivider as XDSMultiSelectorDivider,
  MultiSelectorOptionData as XDSMultiSelectorOptionData,
  MultiSelectorOptionType as XDSMultiSelectorOptionType,
  MultiSelectorProps as XDSMultiSelectorProps,
  MultiSelectorSection as XDSMultiSelectorSection,
  MultiSelectorSize as XDSMultiSelectorSize,
  MultiSelectorStatus as XDSMultiSelectorStatus,
  MultiSelectorStatusType as XDSMultiSelectorStatusType,
} from '.';
// <compat-aliases:end>
