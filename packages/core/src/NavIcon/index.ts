// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports from NavIcon.tsx
 * @output Exports NavIcon component and types
 * @position Entry point for NavIcon module
 *
 * SYNC: When modified, update /packages/core/src/NavIcon/NavIcon.doc.mjs
 */

export {NavIcon} from './NavIcon';
export type {NavIconProps} from './NavIcon';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  NavIcon as XDSNavIcon,
} from '.';
export type {
  NavIconProps as XDSNavIconProps,
} from '.';
// <compat-aliases:end>
