// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSSection component
 * @output Exports XDSSection component and types
 * @position Entry point for @xds/core/Section module
 *
 * SYNC: When modified, update /packages/core/src/Section/Section.doc.mjs
 */

export {XDSSection} from './XDSSection';
export type {
  XDSSectionProps,
  XDSSectionVariant,
  XDSSectionVariantMap,
} from './XDSSection';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSection as Section,
} from '.';
export type {
  XDSSectionProps as SectionProps,
  XDSSectionVariant as SectionVariant,
  XDSSectionVariantMap as SectionVariantMap,
} from '.';
// <compat-aliases:end>
