// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Slider component files
 * @output Exports XDSSlider and its types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Slider/Slider.doc.mjs
 */

export {XDSSlider} from './XDSSlider';
export type {
  XDSSliderProps,
  XDSSliderBaseProps,
  XDSSliderSingleProps,
  XDSSliderRangeProps,
} from './XDSSlider';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSlider as Slider,
} from '.';
export type {
  XDSSliderBaseProps as SliderBaseProps,
  XDSSliderProps as SliderProps,
  XDSSliderRangeProps as SliderRangeProps,
  XDSSliderSingleProps as SliderSingleProps,
} from '.';
// <compat-aliases:end>
