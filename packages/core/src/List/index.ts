// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSList.tsx and XDSListItem.tsx
 * @output Exports XDSList, XDSListItem components and their props/types
 * @position Package entry point for List
 *
 * SYNC: When modified, update /packages/core/src/List/List.doc.mjs
 */

export {XDSList} from './XDSList';
export type {XDSListProps, XDSListStyle, XDSListDensity} from './XDSList';
export {XDSListItem} from './XDSListItem';
export type {XDSListItemProps} from './XDSListItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSList as List,
  XDSListItem as ListItem,
} from '.';
export type {
  XDSListDensity as ListDensity,
  XDSListItemProps as ListItemProps,
  XDSListProps as ListProps,
  XDSListStyle as ListStyle,
} from '.';
// <compat-aliases:end>
