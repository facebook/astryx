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
