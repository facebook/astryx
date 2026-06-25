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
