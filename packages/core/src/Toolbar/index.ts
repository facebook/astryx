// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Toolbar component files
 * @output Exports XDSToolbar and types
 * @position Entry point for Toolbar module
 *
 * SYNC: When modified, update /packages/core/src/Toolbar/Toolbar.doc.mjs
 */

export {XDSToolbar} from './XDSToolbar';
export type {XDSToolbarProps, XDSToolbarSize} from './XDSToolbar';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSToolbar as Toolbar,
} from '.';
export type {
  XDSToolbarProps as ToolbarProps,
  XDSToolbarSize as ToolbarSize,
} from '.';
// <compat-aliases:end>
