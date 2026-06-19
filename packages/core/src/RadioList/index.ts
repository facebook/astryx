// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports RadioList, RadioListItem components and types
 * @output Exports RadioList, RadioListProps, RadioListItem, RadioListItemProps
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {RadioList, RadioListContext} from './RadioList';
export type {
  RadioListProps,
  RadioListSize,
  RadioListContextValue,
} from './RadioList';
export {RadioListItem} from './RadioListItem';
export type {RadioListItemProps} from './RadioListItem';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  RadioList as XDSRadioList,
  RadioListContext as XDSRadioListContext,
  RadioListItem as XDSRadioListItem,
} from '.';
export type {
  RadioListContextValue as XDSRadioListContextValue,
  RadioListItemProps as XDSRadioListItemProps,
  RadioListProps as XDSRadioListProps,
  RadioListSize as XDSRadioListSize,
} from '.';
// <compat-aliases:end>
