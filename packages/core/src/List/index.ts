// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from List.tsx and ListItem.tsx
 * @output Exports List, ListItem components and their props/types
 * @position Package entry point for List
 *
 * SYNC: When modified, update /packages/core/src/List/List.doc.mjs
 */

export {List} from './List';
export type {ListProps, ListStyle, ListDensity} from './List';
export {ListItem} from './ListItem';
export type {ListItemProps} from './ListItem';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  List as XDSList,
  ListItem as XDSListItem,
} from '.';
export type {
  ListDensity as XDSListDensity,
  ListItemProps as XDSListItemProps,
  ListProps as XDSListProps,
  ListStyle as XDSListStyle,
} from '.';
// <compat-aliases:end>
