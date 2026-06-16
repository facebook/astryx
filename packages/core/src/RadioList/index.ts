// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSRadioList, XDSRadioListItem components and types
 * @output Exports XDSRadioList, XDSRadioListProps, XDSRadioListItem, XDSRadioListItemProps
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {XDSRadioList, XDSRadioListContext} from './XDSRadioList';
export type {
  XDSRadioListProps,
  XDSRadioListSize,
  XDSRadioListContextValue,
} from './XDSRadioList';
export {XDSRadioListItem} from './XDSRadioListItem';
export type {XDSRadioListItemProps} from './XDSRadioListItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSRadioList as RadioList,
  XDSRadioListContext as RadioListContext,
  XDSRadioListItem as RadioListItem,
} from '.';
export type {
  XDSRadioListContextValue as RadioListContextValue,
  XDSRadioListItemProps as RadioListItemProps,
  XDSRadioListProps as RadioListProps,
  XDSRadioListSize as RadioListSize,
} from '.';
// <compat-aliases:end>
