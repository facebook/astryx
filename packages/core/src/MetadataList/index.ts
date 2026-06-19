// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from MetadataList.tsx and MetadataListItem.tsx
 * @output Exports MetadataList, MetadataListItem components and their props/types
 * @position Package entry point for MetadataList
 *
 * SYNC: When modified, update /packages/core/src/MetadataList/MetadataList.doc.mjs
 */

export {MetadataList} from './MetadataList';
export type {
  MetadataListProps,
  MetadataListColumns,
} from './MetadataList';
export {MetadataListItem} from './MetadataListItem';
export type {MetadataListItemProps} from './MetadataListItem';
export type {MetadataListLabelConfig} from './MetadataListContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  MetadataList as XDSMetadataList,
  MetadataListItem as XDSMetadataListItem,
} from '.';
export type {
  MetadataListColumns as XDSMetadataListColumns,
  MetadataListItemProps as XDSMetadataListItemProps,
  MetadataListLabelConfig as XDSMetadataListLabelConfig,
  MetadataListProps as XDSMetadataListProps,
} from '.';
// <compat-aliases:end>
