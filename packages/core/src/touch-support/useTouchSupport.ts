// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTouchSupport.ts
 * @input The touch-support registry and React's useSyncExternalStore
 * @output useTouchSupport, the dependency check: the installed touch module,
 *   or null
 * @position Internal. The one way a component reaches the global touch and
 *   gesture module (architecture:react-component-runtime INV13); Core imports
 *   it by relative path, Lab through `@astryxdesign/core/internal/touch`, an
 *   entry lint keeps to Core and Lab.
 *
 * Null on the server, in the render that hydrates server HTML (the server
 * snapshot), and on any page that never calls `TouchSupport.install()`: the
 * component then keeps its plain behavior. After an install, every component
 * that reads it renders once more, with the module. It refers to the module
 * by type only, so a component that calls it carries none of the module's
 * code.
 *
 * SYNC: When modified, update TouchSupport.test.tsx.
 */

import {useSyncExternalStore} from 'react';
import type {TouchModule} from './touchModule';
import {getTouchModule, subscribeTouchModule} from './touchSupportRegistry';

const getServerSnapshot = (): TouchModule | null => null;

/** The installed touch module, or null where none is installed. */
export function useTouchSupport(): TouchModule | null {
  return useSyncExternalStore(
    subscribeTouchModule,
    getTouchModule,
    getServerSnapshot,
  );
}
