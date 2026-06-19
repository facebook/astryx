// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Thumbnail component barrel export
 */

export {Thumbnail} from './Thumbnail';
export type {ThumbnailProps} from './Thumbnail';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Thumbnail as XDSThumbnail,
} from '.';
export type {
  ThumbnailProps as XDSThumbnailProps,
} from '.';
// <compat-aliases:end>
