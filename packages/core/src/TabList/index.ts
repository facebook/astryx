// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from TabList component files
 * @output Exports TabList, Tab, TabMenu and their types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TabList/TabList.doc.mjs
 */

export {TabList} from './TabList';
export type {TabListProps} from './TabList';

export {Tab} from './Tab';
export type {TabProps} from './Tab';

export {TabMenu} from './TabMenu';
export type {TabMenuProps, TabMenuOption} from './TabMenu';

export {useTabListContext} from './TabListContext';
export type {TabListSize, TabListLayout} from './TabListContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Tab as XDSTab,
  TabList as XDSTabList,
  TabMenu as XDSTabMenu,
  useTabListContext as useXDSTabListContext,
} from '.';
export type {
  TabListLayout as XDSTabListLayout,
  TabListProps as XDSTabListProps,
  TabListSize as XDSTabListSize,
  TabMenuOption as XDSTabMenuOption,
  TabMenuProps as XDSTabMenuProps,
  TabProps as XDSTabProps,
} from '.';
// <compat-aliases:end>
