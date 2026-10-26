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
import {
  installRan,
  installTouchModule,
  markInstallRan,
} from './touchSupportRegistry';

/** Whether some input is a coarse pointer, the condition for registering. */
const ANY_COARSE_POINTER = '(any-pointer: coarse)';

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
 * - Layout and presence motion works without it.
 * - People using only a mouse pay nothing: `install()` registers the module
 *   only where some input is a coarse pointer, and registers it when one
 *   appears later, such as a tablet attached to a laptop.
 * - A swipe-only action still needs a non-touch path, such as a button or a
 *   menu item, for a mouse, a keyboard, or a page without touch support.
 * - Reduce Motion is respected.
 * - `install()` can be called more than once, and it does nothing on the
 *   server, so server HTML is unchanged.
 */
const TouchSupport = Object.freeze({
  /**
   * Installs touch support for this page: the module registers now where some
   * input is a coarse pointer, or when one appears. Later calls do nothing.
   */
  install(): void {
    if (typeof window === 'undefined' || markInstallRan()) {
      return;
    }
    if (typeof window.matchMedia !== 'function') {
      return;
    }
    const query = window.matchMedia(ANY_COARSE_POINTER);
    if (query.matches) {
      installTouchModule(touchModule);
      return;
    }
    const onChange = () => {
      if (query.matches) {
        query.removeEventListener('change', onChange);
        installTouchModule(touchModule);
      }
    };
    query.addEventListener('change', onChange);
  },
  /** Whether `install()` has run on this page. */
  isInstalled(): boolean {
    return installRan();
  },
});

export default TouchSupport;
