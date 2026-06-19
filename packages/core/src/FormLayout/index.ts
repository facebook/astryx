// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Uses FormLayout, FormLayoutContext
 * @output Re-exports public API for FormLayout
 * @position Entry point for FormLayout module
 *
 * SYNC: When modified, update these files to stay in sync:
 */

export {FormLayout} from './FormLayout';
export type {FormLayoutProps} from './FormLayout';
export type {FormLayoutDirection} from './FormLayoutContext';
export {FormLayoutContext} from './FormLayoutContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  FormLayout as XDSFormLayout,
  FormLayoutContext as XDSFormLayoutContext,
} from '.';
export type {
  FormLayoutDirection as XDSFormLayoutDirection,
  FormLayoutProps as XDSFormLayoutProps,
} from '.';
// <compat-aliases:end>
