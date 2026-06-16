// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSMetadataList.tsx and XDSMetadataListItem.tsx
 * @output Exports XDSMetadataList, XDSMetadataListItem components and their props/types
 * @position Package entry point for MetadataList
 *
 * SYNC: When modified, update /packages/core/src/MetadataList/MetadataList.doc.mjs
 */

export {XDSMetadataList} from './XDSMetadataList';
export type {
  XDSMetadataListProps,
  XDSMetadataListColumns,
} from './XDSMetadataList';
export {XDSMetadataListItem} from './XDSMetadataListItem';
export type {XDSMetadataListItemProps} from './XDSMetadataListItem';
export type {XDSMetadataListLabelConfig} from './XDSMetadataListContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSMetadataList as MetadataList,
  XDSMetadataListItem as MetadataListItem,
} from '.';
export type {
  XDSMetadataListColumns as MetadataListColumns,
  XDSMetadataListItemProps as MetadataListItemProps,
  XDSMetadataListLabelConfig as MetadataListLabelConfig,
  XDSMetadataListProps as MetadataListProps,
} from '.';
// <compat-aliases:end>
