// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSMobileNav.tsx, XDSMobileNavToggle.tsx
 * @output Re-exports MobileNav components and types
 * @position Barrel export; consumed by packages/core/src/index.ts
 */

export {XDSMobileNav} from './XDSMobileNav';
export type {XDSMobileNavProps} from './XDSMobileNav';
export {XDSMobileNavToggle} from './XDSMobileNavToggle';
export type {XDSMobileNavToggleProps} from './XDSMobileNavToggle';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSMobileNav as MobileNav,
  XDSMobileNavToggle as MobileNavToggle,
} from '.';
export type {
  XDSMobileNavProps as MobileNavProps,
  XDSMobileNavToggleProps as MobileNavToggleProps,
} from '.';
// <compat-aliases:end>
