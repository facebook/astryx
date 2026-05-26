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
