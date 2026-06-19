// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Section component
 * @output Exports Section component and types
 * @position Entry point for @xds/core/Section module
 *
 * SYNC: When modified, update /packages/core/src/Section/Section.doc.mjs
 */

export {Section} from './Section';
export type {
  SectionProps,
  SectionVariant,
  SectionVariantMap,
} from './Section';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Section as XDSSection,
} from '.';
export type {
  SectionProps as XDSSectionProps,
  SectionVariant as XDSSectionVariant,
  SectionVariantMap as XDSSectionVariantMap,
} from '.';
// <compat-aliases:end>
