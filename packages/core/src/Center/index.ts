// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSCenter component
 * @output Exports XDSCenter and types for @xds/core/Center
 * @position Entry point for Center component
 *
 * SYNC: When modified, update /packages/core/src/Center/Center.doc.mjs
 */

export {XDSCenter} from './XDSCenter';
export type {XDSCenterProps, XDSCenterAxis, CenterAxis} from './XDSCenter';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCenter as Center,
} from '.';
export type {
  XDSCenterProps as CenterProps,
} from '.';
// <compat-aliases:end>
