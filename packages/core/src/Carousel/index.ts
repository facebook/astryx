// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input XDSCarousel component
 * @output Re-exports XDSCarousel and its props type
 * @position Public entry point for the Carousel module
 */

export {XDSCarousel} from './XDSCarousel';
export type {XDSCarouselProps} from './XDSCarousel';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCarousel as Carousel,
} from '.';
export type {
  XDSCarouselProps as CarouselProps,
} from '.';
// <compat-aliases:end>
