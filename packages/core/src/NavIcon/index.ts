// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports from XDSNavIcon.tsx
 * @output Exports XDSNavIcon component and types
 * @position Entry point for NavIcon module
 *
 * SYNC: When modified, update /packages/core/src/NavIcon/NavIcon.doc.mjs
 */

export {XDSNavIcon} from './XDSNavIcon';
export type {XDSNavIconProps} from './XDSNavIcon';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSNavIcon as NavIcon,
} from '.';
export type {
  XDSNavIconProps as NavIconProps,
} from '.';
// <compat-aliases:end>
