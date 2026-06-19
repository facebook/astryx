// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Carousel component
 * @output Re-exports Carousel and its props type
 * @position Public entry point for the Carousel module
 */

export {Carousel} from './Carousel';
export type {CarouselProps} from './Carousel';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Carousel as XDSCarousel,
} from '.';
export type {
  CarouselProps as XDSCarouselProps,
} from '.';
// <compat-aliases:end>
