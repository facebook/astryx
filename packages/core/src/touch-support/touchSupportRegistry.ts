// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchSupportRegistry.ts
 * @input None (module-level state)
 * @output installTouchModule, getTouchModule and subscribeTouchModule: the one
 *   module-level registry that holds the installed touch module; whether
 *   `TouchSupport.install()` ran (markInstallRan, installRan); and
 *   resetTouchSupportForTests
 * @position Internal to touch-support. `TouchSupport.install()` writes it and
 *   useTouchSupport reads it (architecture:react-component-runtime INV13).
 *
 * No directive and no browser access, so it is importable on the server,
 * where nothing installs. It refers to the module by type only: reading it
 * carries none of the module's code.
 */

import type {TouchModule} from './touchModule';

let installed: TouchModule | null = null;
let ran = false;
const listeners = new Set<() => void>();

/**
 * Registers the module. Once a module is installed, a later call does
 * nothing, so nothing registers twice.
 */
export function installTouchModule(module: TouchModule): void {
  if (installed !== null) {
    return;
  }
  installed = module;
  for (const listener of [...listeners]) {
    listener();
  }
}

/** The installed module, or null before any install. */
export function getTouchModule(): TouchModule | null {
  return installed;
}

/**
 * Records that `TouchSupport.install()` ran on this page. Returns whether it
 * had already, so a second call does nothing.
 */
export function markInstallRan(): boolean {
  const already = ran;
  ran = true;
  return already;
}

/** Whether `TouchSupport.install()` ran on this page. */
export function installRan(): boolean {
  return ran;
}

/**
 * Forgets the install, as on a fresh page, and tells every reader. For tests
 * only; it is not on `TouchSupport`.
 */
export function resetTouchSupportForTests(): void {
  ran = false;
  if (installed === null) {
    return;
  }
  installed = null;
  for (const listener of [...listeners]) {
    listener();
  }
}

/** Calls `listener` when a module is installed; returns the unsubscribe. */
export function subscribeTouchModule(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
