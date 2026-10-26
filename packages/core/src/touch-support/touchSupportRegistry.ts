// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchSupportRegistry.ts
 * @input None (module-level state)
 * @output installTouchModule, getTouchModule and subscribeTouchModule: the one
 *   module-level registry that holds the installed touch module
 * @position Internal to touch-support. `TouchSupport.install()` writes it and
 *   useTouchSupport reads it (architecture:react-component-runtime INV13).
 *
 * No directive and no browser access, so it is importable on the server,
 * where nothing installs. It refers to the module by type only: reading it
 * carries none of the module's code.
 */

import type {TouchModule} from './touchModule';

let installed: TouchModule | null = null;
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

/** Calls `listener` when a module is installed; returns the unsubscribe. */
export function subscribeTouchModule(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
