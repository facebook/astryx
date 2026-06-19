// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Slider component files
 * @output Exports Slider and its types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Slider/Slider.doc.mjs
 */

export {Slider} from './Slider';
export type {
  SliderProps,
  SliderBaseProps,
  SliderSingleProps,
  SliderRangeProps,
} from './Slider';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Slider as XDSSlider,
} from '.';
export type {
  SliderBaseProps as XDSSliderBaseProps,
  SliderProps as XDSSliderProps,
  SliderRangeProps as XDSSliderRangeProps,
  SliderSingleProps as XDSSliderSingleProps,
} from '.';
// <compat-aliases:end>
