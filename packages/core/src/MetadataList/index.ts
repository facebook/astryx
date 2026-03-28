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
