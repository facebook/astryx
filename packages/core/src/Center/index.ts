// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Center component
 * @output Exports Center and types for @xds/core/Center
 * @position Entry point for Center component
 *
 * SYNC: When modified, update /packages/core/src/Center/Center.doc.mjs
 */

export {Center} from './Center';
export type {CenterProps, CenterAxis} from './Center';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Center as XDSCenter,
} from '.';
export type {
  CenterAxis as XDSCenterAxis,
  CenterProps as XDSCenterProps,
} from '.';
// <compat-aliases:end>
