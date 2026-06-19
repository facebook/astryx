// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from MobileNav.tsx, MobileNavToggle.tsx
 * @output Re-exports MobileNav components and types
 * @position Barrel export; consumed by packages/core/src/index.ts
 */

export {MobileNav} from './MobileNav';
export type {MobileNavProps} from './MobileNav';
export {MobileNavToggle} from './MobileNavToggle';
export type {MobileNavToggleProps} from './MobileNavToggle';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  MobileNav as XDSMobileNav,
  MobileNavToggle as XDSMobileNavToggle,
} from '.';
export type {
  MobileNavProps as XDSMobileNavProps,
  MobileNavToggleProps as XDSMobileNavToggleProps,
} from '.';
// <compat-aliases:end>
