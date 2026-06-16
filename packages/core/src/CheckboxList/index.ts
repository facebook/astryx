// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSCheckboxList, XDSCheckboxListItem components and types
 * @output Exports XDSCheckboxList, XDSCheckboxListProps, XDSCheckboxListItem, XDSCheckboxListItemProps
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {XDSCheckboxList} from './XDSCheckboxList';
export type {XDSCheckboxListProps} from './XDSCheckboxList';
export {XDSCheckboxListItem} from './XDSCheckboxListItem';
export type {XDSCheckboxListItemProps} from './XDSCheckboxListItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCheckboxList as CheckboxList,
  XDSCheckboxListItem as CheckboxListItem,
} from '.';
export type {
  XDSCheckboxListItemProps as CheckboxListItemProps,
  XDSCheckboxListProps as CheckboxListProps,
} from '.';
// <compat-aliases:end>
