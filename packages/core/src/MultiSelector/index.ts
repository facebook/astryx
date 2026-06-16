// Copyright (c) Meta Platforms, Inc. and affiliates.

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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSMultiSelector as MultiSelector,
} from '.';
export type {
  XDSMultiSelectorDivider as MultiSelectorDivider,
  XDSMultiSelectorOptionData as MultiSelectorOptionData,
  XDSMultiSelectorOptionType as MultiSelectorOptionType,
  XDSMultiSelectorProps as MultiSelectorProps,
  XDSMultiSelectorSection as MultiSelectorSection,
  XDSMultiSelectorSize as MultiSelectorSize,
  XDSMultiSelectorStatus as MultiSelectorStatus,
  XDSMultiSelectorStatusType as MultiSelectorStatusType,
} from '.';
// <compat-aliases:end>
