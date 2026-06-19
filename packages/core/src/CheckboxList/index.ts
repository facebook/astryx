// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports CheckboxList, CheckboxListItem components and types
 * @output Exports CheckboxList, CheckboxListProps, CheckboxListItem, CheckboxListItemProps
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {CheckboxList} from './CheckboxList';
export type {CheckboxListProps} from './CheckboxList';
export {CheckboxListItem} from './CheckboxListItem';
export type {CheckboxListItemProps} from './CheckboxListItem';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  CheckboxList as XDSCheckboxList,
  CheckboxListItem as XDSCheckboxListItem,
} from '.';
export type {
  CheckboxListItemProps as XDSCheckboxListItemProps,
  CheckboxListProps as XDSCheckboxListProps,
} from '.';
// <compat-aliases:end>
