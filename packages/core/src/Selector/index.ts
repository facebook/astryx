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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSelector as Selector,
  XDSSelectorOption as SelectorOption,
} from '.';
export type {
  XDSSelectorDivider as SelectorDivider,
  XDSSelectorOptionData as SelectorOptionData,
  XDSSelectorOptionType as SelectorOptionType,
  XDSSelectorProps as SelectorProps,
  XDSSelectorSection as SelectorSection,
  XDSSelectorSize as SelectorSize,
  XDSSelectorStatus as SelectorStatus,
  XDSSelectorStatusType as SelectorStatusType,
} from '.';
// <compat-aliases:end>
