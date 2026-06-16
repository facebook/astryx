// Copyright (c) Meta Platforms, Inc. and affiliates.

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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSPagination as Pagination,
} from '.';
export type {
  XDSPaginationProps as PaginationProps,
  XDSPaginationSize as PaginationSize,
  XDSPaginationVariant as PaginationVariant,
  XDSPaginationVariantMap as PaginationVariantMap,
} from '.';
// <compat-aliases:end>
