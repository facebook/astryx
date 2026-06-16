// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from TabList component files
 * @output Exports XDSTabList, XDSTab, XDSTabMenu and their types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TabList/TabList.doc.mjs
 */

export {XDSTabList} from './XDSTabList';
export type {XDSTabListProps} from './XDSTabList';

export {XDSTab} from './XDSTab';
export type {XDSTabProps} from './XDSTab';

export {XDSTabMenu} from './XDSTabMenu';
export type {XDSTabMenuProps, XDSTabMenuOption} from './XDSTabMenu';

export {useXDSTabListContext} from './XDSTabListContext';
export type {XDSTabListSize, XDSTabListLayout} from './XDSTabListContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTab as Tab,
  XDSTabList as TabList,
  XDSTabMenu as TabMenu,
  useXDSTabListContext as useTabListContext,
} from '.';
export type {
  XDSTabListLayout as TabListLayout,
  XDSTabListProps as TabListProps,
  XDSTabListSize as TabListSize,
  XDSTabMenuOption as TabMenuOption,
  XDSTabMenuProps as TabMenuProps,
  XDSTabProps as TabProps,
} from '.';
// <compat-aliases:end>
