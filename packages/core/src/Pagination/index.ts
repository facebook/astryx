'use client';

/**
 * @file index.ts
 * @input XDSPagination component and types
 * @output Public API for Pagination module
 * @position Barrel export; consumed by packages/core/src/index.ts
 */

export {XDSPagination, generatePageRange} from './XDSPagination';
export type {
  XDSPaginationProps,
  XDSPaginationVariant,
  XDSPaginationVariantMap,
  XDSPaginationSize,
} from './XDSPagination';
