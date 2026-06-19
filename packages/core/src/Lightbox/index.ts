// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Lightbox component, useLightbox hook, and types
 * @output Exports Lightbox, useLightbox, and all related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {Lightbox} from './Lightbox';
export type {
  LightboxProps,
  LightboxMedia,
  LightboxMediaType,
} from './Lightbox';

export {useLightbox} from './useLightbox';
export type {
  UseLightboxOptions,
  UseLightboxReturn,
} from './useLightbox';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Lightbox as XDSLightbox,
  useLightbox as useXDSLightbox,
} from '.';
export type {
  LightboxMedia as XDSLightboxMedia,
  LightboxMediaType as XDSLightboxMediaType,
  LightboxProps as XDSLightboxProps,
  UseLightboxOptions as XDSUseLightboxOptions,
  UseLightboxReturn as XDSUseLightboxReturn,
} from '.';
// <compat-aliases:end>
