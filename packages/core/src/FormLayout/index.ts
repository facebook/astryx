// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Uses XDSFormLayout, XDSFormLayoutContext
 * @output Re-exports public API for FormLayout
 * @position Entry point for FormLayout module
 *
 * SYNC: When modified, update these files to stay in sync:
 */

export {XDSFormLayout} from './XDSFormLayout';
export type {XDSFormLayoutProps} from './XDSFormLayout';
export type {XDSFormLayoutDirection} from './XDSFormLayoutContext';
export {XDSFormLayoutContext} from './XDSFormLayoutContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSFormLayout as FormLayout,
  XDSFormLayoutContext as FormLayoutContext,
} from '.';
export type {
  XDSFormLayoutDirection as FormLayoutDirection,
  XDSFormLayoutProps as FormLayoutProps,
} from '.';
// <compat-aliases:end>
