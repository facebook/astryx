// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input The global touch and gesture module (touchModule) and its registry
 * @output TouchSupport (the default export): install() and isInstalled()
 * @position Public entry `@astryxdesign/core/touch-support`
 *   (architecture:react-component-runtime INV13)
 *
 * SYNC: When modified, update TouchSupport.test.tsx and
 * scripts/touch-support-bundle.test.mjs.
 */

import {touchModule} from './touchModule';
import {getTouchModule, installTouchModule} from './touchSupportRegistry';

/**
 * Touch support for Astryx components: the gesture core and the animator,
 * installed once for the whole page.
 *
 * Call `install()` once in your client entry, before you render or hydrate:
 *
 * ```
 * import TouchSupport from '@astryxdesign/core/touch-support';
 *
 * TouchSupport.install();
 * ```
 *
 * - Components with touch behavior use it under a finger. Without it they
 *   keep their plain behavior and stay fully usable, and a tap still acts as
 *   a click.
 * - Motion such as `useAnimatedLayout` works without it.
 * - People using only a mouse pay nothing: on a fine pointer the module
 *   registers nothing.
 * - A swipe-only action still needs a non-touch path, such as a button or a
 *   menu item, for a mouse, a keyboard, or a page without touch support.
 * - Reduce Motion is respected.
 * - `install()` can be called more than once, and it does nothing on the
 *   server, so server HTML is unchanged.
 */
const TouchSupport = Object.freeze({
  /** Installs the touch module for this page; later calls do nothing. */
  install(): void {
    if (typeof window === 'undefined') {
      return;
    }
    installTouchModule(touchModule);
  },
  /** Whether `install()` has run on this page. */
  isInstalled(): boolean {
    return getTouchModule() !== null;
  },
});

export default TouchSupport;
