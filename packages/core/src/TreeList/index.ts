// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from TreeList.tsx and TreeListTypes.ts
 * @output Exports TreeList component and its types
 * @position Package entry point for TreeList
 *
 * SYNC: When modified, update /packages/core/src/TreeList/TreeList.doc.mjs
 */

export {TreeList} from './TreeList';
export type {TreeListProps, TreeListDensity} from './TreeList';
export type {TreeListItemData} from './TreeListTypes';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  TreeList as XDSTreeList,
} from '.';
export type {
  TreeListDensity as XDSTreeListDensity,
  TreeListItemData as XDSTreeListItemData,
  TreeListProps as XDSTreeListProps,
} from '.';
// <compat-aliases:end>
