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
import {installTouchModule} from './touchSupportRegistry';

/** Whether some input is a coarse pointer, the condition for registering. */
const ANY_COARSE_POINTER = '(any-pointer: coarse)';

/** Whether `install()` has run on this page. */
let hasRun = false;

/**
 * Touch support for Astryx components: the gesture core, installed once for
 * the whole page. No component uses it yet; components take their touch
 * behavior from it in their own releases.
 *
 * Call `install()` once in your client entry, before you render or hydrate:
 *
 * ```
 * import TouchSupport from '@astryxdesign/core/touch-support';
 *
 * TouchSupport.install();
 * ```
 *
 * - Without it, components keep their plain behavior and stay fully usable,
 *   and a tap still acts as a click.
 * - Layout and presence motion works without it.
 * - `install()` registers the module only where some input is a coarse
 *   pointer, and registers it when one appears later, such as a tablet
 *   attached to a laptop. The module's code ships with this entry, so a page
 *   that imports it sends that code to every visitor, one using only a mouse
 *   included; a page that never imports it carries none of it.
 * - A swipe-only action still needs a non-touch path, such as a button or a
 *   menu item, for a mouse, a keyboard, or a page without touch support.
 * - `install()` can be called more than once, and it does nothing on the
 *   server, so server HTML is unchanged.
 */
const TouchSupport = Object.freeze({
  /**
   * Installs touch support for this page: the module registers now where some
   * input is a coarse pointer, or when one appears. Later calls do nothing.
   */
  install(): void {
    if (typeof window === 'undefined' || hasRun) {
      return;
    }
    hasRun = true;
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
    return hasRun;
  },
});

export default TouchSupport;
