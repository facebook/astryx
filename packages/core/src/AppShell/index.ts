// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports AppShell component and types from AppShell.tsx
 * @output Exports AppShell and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/AppShell/AppShell.doc.mjs
 */

export {AppShell} from './AppShell';
export type {
  AppShellProps,
  AppShellBreakpoint,
  AppShellVariant,
  AppShellVariantMap,
  MobileNavConfig,
} from './AppShell';
export {
  useAppShellMobile,
  AppShellMobileContext,
} from './AppShellMobileContext';
export type {AppShellMobileContextValue} from './AppShellMobileContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  AppShell as XDSAppShell,
  AppShellMobileContext as XDSAppShellMobileContext,
  useAppShellMobile as useXDSAppShellMobile,
} from '.';
export type {
  AppShellBreakpoint as XDSAppShellBreakpoint,
  AppShellMobileContextValue as XDSAppShellMobileContextValue,
  AppShellProps as XDSAppShellProps,
  AppShellVariant as XDSAppShellVariant,
  AppShellVariantMap as XDSAppShellVariantMap,
  MobileNavConfig as XDSMobileNavConfig,
} from '.';
// <compat-aliases:end>
