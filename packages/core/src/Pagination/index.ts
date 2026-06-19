// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Pagination component and types
 * @output Public API for Pagination module
 * @position Barrel export; consumed by packages/core/src/index.ts
 */

export {Pagination, generatePageRange} from './Pagination';
export type {
  PaginationProps,
  PaginationVariant,
  PaginationVariantMap,
  PaginationSize,
} from './Pagination';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Pagination as XDSPagination,
} from '.';
export type {
  PaginationProps as XDSPaginationProps,
  PaginationSize as XDSPaginationSize,
  PaginationVariant as XDSPaginationVariant,
  PaginationVariantMap as XDSPaginationVariantMap,
} from '.';
// <compat-aliases:end>
