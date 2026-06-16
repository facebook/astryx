// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSCitation component and types from XDSCitation.tsx
 * @output Exports XDSCitation, XDSCitationProps, XDSCitationSource
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSCitation} from './XDSCitation';
export type {XDSCitationProps, XDSCitationSource} from './XDSCitation';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCitation as Citation,
} from '.';
export type {
  XDSCitationProps as CitationProps,
  XDSCitationSource as CitationSource,
} from '.';
// <compat-aliases:end>
