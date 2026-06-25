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
