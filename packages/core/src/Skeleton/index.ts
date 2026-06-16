// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Skeleton component files
 * @output Exports XDSSkeleton and its types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Skeleton/Skeleton.doc.mjs
 */

export {XDSSkeleton} from './XDSSkeleton';
export type {XDSSkeletonProps, XDSSkeletonRadius} from './XDSSkeleton';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSkeleton as Skeleton,
} from '.';
export type {
  XDSSkeletonProps as SkeletonProps,
  XDSSkeletonRadius as SkeletonRadius,
} from '.';
// <compat-aliases:end>
