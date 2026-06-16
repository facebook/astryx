// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSAspectRatio.tsx
 * @output Exports XDSAspectRatio component and props type
 * @position Package entry point for AspectRatio
 *
 * SYNC: When modified, update /packages/core/src/AspectRatio/AspectRatio.doc.mjs
 */

export {XDSAspectRatio} from './XDSAspectRatio';
export type {XDSAspectRatioProps, XDSAspectRatioShape} from './XDSAspectRatio';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSAspectRatio as AspectRatio,
} from '.';
export type {
  XDSAspectRatioProps as AspectRatioProps,
  XDSAspectRatioShape as AspectRatioShape,
} from '.';
// <compat-aliases:end>
