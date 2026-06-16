// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSLightbox component, useXDSLightbox hook, and types
 * @output Exports XDSLightbox, useXDSLightbox, and all related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSLightbox} from './XDSLightbox';
export type {
  XDSLightboxProps,
  XDSLightboxMedia,
  XDSLightboxMediaType,
} from './XDSLightbox';

export {useXDSLightbox} from './useXDSLightbox';
export type {
  UseXDSLightboxOptions,
  UseXDSLightboxReturn,
} from './useXDSLightbox';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSLightbox as Lightbox,
  useXDSLightbox as useLightbox,
} from '.';
export type {
  XDSLightboxMedia as LightboxMedia,
  XDSLightboxMediaType as LightboxMediaType,
  XDSLightboxProps as LightboxProps,
} from '.';
// <compat-aliases:end>
