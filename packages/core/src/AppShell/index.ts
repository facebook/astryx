// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSAppShell component and types from XDSAppShell.tsx
 * @output Exports XDSAppShell and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/AppShell/AppShell.doc.mjs
 */

export {XDSAppShell} from './XDSAppShell';
export type {
  XDSAppShellProps,
  XDSAppShellBreakpoint,
  XDSAppShellVariant,
  XDSAppShellVariantMap,
  XDSMobileNavConfig,
} from './XDSAppShell';
export {
  useXDSAppShellMobile,
  XDSAppShellMobileContext,
} from './XDSAppShellMobileContext';
export type {XDSAppShellMobileContextValue} from './XDSAppShellMobileContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSAppShell as AppShell,
  XDSAppShellMobileContext as AppShellMobileContext,
  useXDSAppShellMobile as useAppShellMobile,
} from '.';
export type {
  XDSAppShellBreakpoint as AppShellBreakpoint,
  XDSAppShellMobileContextValue as AppShellMobileContextValue,
  XDSAppShellProps as AppShellProps,
  XDSAppShellVariant as AppShellVariant,
  XDSAppShellVariantMap as AppShellVariantMap,
  XDSMobileNavConfig as MobileNavConfig,
} from '.';
// <compat-aliases:end>
