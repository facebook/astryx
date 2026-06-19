// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Citation component and types from Citation.tsx
 * @output Exports Citation, CitationProps, CitationSource
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {Citation} from './Citation';
export type {CitationProps, CitationSource} from './Citation';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Citation as XDSCitation,
} from '.';
export type {
  CitationProps as XDSCitationProps,
  CitationSource as XDSCitationSource,
} from '.';
// <compat-aliases:end>
