// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Typeahead components and types
 * @output Exports all Typeahead module public API
 * @position Entry point for Typeahead module
 *
 * SYNC: When adding new Typeahead files, update exports here
 */

// Shared types
export type {XDSSearchableItem, XDSSearchSource} from './types';

// Search source utilities
export {createStaticSource} from './createStaticSource';
export type {CreateStaticSourceOptions} from './createStaticSource';

// Base (unstyled) typeahead
export {XDSBaseTypeahead} from './XDSBaseTypeahead';
export type {XDSBaseTypeaheadProps} from './XDSBaseTypeahead';

// Styled typeahead
export {XDSTypeahead} from './XDSTypeahead';
export type {
  XDSTypeaheadProps,
  XDSTypeaheadSize,
  XDSTypeaheadStatus,
  XDSTypeaheadStatusType,
} from './XDSTypeahead';

// Typeahead item
export {XDSTypeaheadItem} from './XDSTypeaheadItem';
export type {XDSTypeaheadItemProps} from './XDSTypeaheadItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSBaseTypeahead as BaseTypeahead,
  XDSTypeahead as Typeahead,
  XDSTypeaheadItem as TypeaheadItem,
} from '.';
export type {
  XDSBaseTypeaheadProps as BaseTypeaheadProps,
  XDSSearchSource as SearchSource,
  XDSSearchableItem as SearchableItem,
  XDSTypeaheadItemProps as TypeaheadItemProps,
  XDSTypeaheadProps as TypeaheadProps,
  XDSTypeaheadSize as TypeaheadSize,
  XDSTypeaheadStatus as TypeaheadStatus,
  XDSTypeaheadStatusType as TypeaheadStatusType,
} from '.';
// <compat-aliases:end>
