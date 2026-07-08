// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Rating component files
 * @output Exports Rating and its types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Rating/Rating.doc.mjs
 */

export {Rating} from './Rating';
export type {
  RatingProps,
  RatingSize,
  RatingColor,
  RatingDensity,
  RatingMode,
  RatingLabelPlacement,
  RatingAnimation,
  RatingTooltip,
  RatingIcons,
  RatingIconComponent,
} from './Rating';
