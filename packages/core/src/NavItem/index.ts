// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports from navItemStyles.stylex.ts
 * @output Exports navItemStyles and NavItemSize type
 * @position Entry point for NavItem module
 */

export {navItemStyles} from './navItemStyles.stylex';
export type {NavItemSize} from './navItemStyles.stylex';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export type {
  NavItemSize as XDSNavItemSize,
} from '.';
// <compat-aliases:end>
