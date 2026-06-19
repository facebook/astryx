// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Skeleton component files
 * @output Exports Skeleton and its types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Skeleton/Skeleton.doc.mjs
 */

export {Skeleton} from './Skeleton';
export type {SkeletonProps, SkeletonRadius} from './Skeleton';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Skeleton as XDSSkeleton,
} from '.';
export type {
  SkeletonProps as XDSSkeletonProps,
  SkeletonRadius as XDSSkeletonRadius,
} from '.';
// <compat-aliases:end>
