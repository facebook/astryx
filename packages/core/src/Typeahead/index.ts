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
export type {SearchableItem, SearchSource} from './types';

// Search source utilities
export {createStaticSource} from './createStaticSource';
export type {CreateStaticSourceOptions} from './createStaticSource';

// Base (unstyled) typeahead
export {BaseTypeahead} from './BaseTypeahead';
export type {BaseTypeaheadProps} from './BaseTypeahead';

// Styled typeahead
export {Typeahead} from './Typeahead';
export type {
  TypeaheadProps,
  TypeaheadSize,
  TypeaheadStatus,
  TypeaheadStatusType,
} from './Typeahead';

// Typeahead item
export {TypeaheadItem} from './TypeaheadItem';
export type {TypeaheadItemProps} from './TypeaheadItem';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  BaseTypeahead as XDSBaseTypeahead,
  Typeahead as XDSTypeahead,
  TypeaheadItem as XDSTypeaheadItem,
} from '.';
export type {
  BaseTypeaheadProps as XDSBaseTypeaheadProps,
  CreateStaticSourceOptions as XDSCreateStaticSourceOptions,
  SearchSource as XDSSearchSource,
  SearchableItem as XDSSearchableItem,
  TypeaheadItemProps as XDSTypeaheadItemProps,
  TypeaheadProps as XDSTypeaheadProps,
  TypeaheadSize as XDSTypeaheadSize,
  TypeaheadStatus as XDSTypeaheadStatus,
  TypeaheadStatusType as XDSTypeaheadStatusType,
} from '.';
// <compat-aliases:end>
