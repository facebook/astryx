// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSTreeList.tsx and XDSTreeListTypes.ts
 * @output Exports XDSTreeList component and its types
 * @position Package entry point for TreeList
 *
 * SYNC: When modified, update /packages/core/src/TreeList/TreeList.doc.mjs
 */

export {XDSTreeList} from './XDSTreeList';
export type {XDSTreeListProps, XDSTreeListDensity} from './XDSTreeList';
export type {XDSTreeListItemData} from './XDSTreeListTypes';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTreeList as TreeList,
} from '.';
export type {
  XDSTreeListDensity as TreeListDensity,
  XDSTreeListItemData as TreeListItemData,
  XDSTreeListProps as TreeListProps,
} from '.';
// <compat-aliases:end>
