// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchLayers.ts
 * @input The app bundler's `__ASTRYX_TOUCH__` define, when the app sets one
 * @output TOUCH_LAYERS: whether this build carries touch layers, true unless
 *   the app defines `__ASTRYX_TOUCH__` as false; the guard each touch-layer
 *   import site writes so a build without touch layers leaves the layer out
 * @position Internal shared flag, read by touchPresentation.ts and spelled at
 *   each touch-layer import site
 *
 * A product that serves desktops a bundle of their own builds it with
 * `__ASTRYX_TOUCH__` defined as `false` (esbuild or Vite `define`, webpack
 * `DefinePlugin`, Next.js `compiler.define`). That bundle presents every
 * component the pointer way (touchPresentation.ts answers not touch) and
 * carries no touch layer: no gesture host or arena, no animator, no
 * component touch module. Without the define, or with it `true`, a build
 * keeps them, as one bundle for every device needs.
 *
 * The guard. A touch layer's import site reads the define itself, in the
 * module that imports the layer, and picks the layer or a no-op:
 *
 *   import {useSwitchTouch} from './useSwitchTouch';
 *
 *   function useNoSwitchTouch(): null {
 *     return null;
 *   }
 *
 *   const useTouchLayer =
 *     typeof __ASTRYX_TOUCH__ === 'undefined' || __ASTRYX_TOUCH__ !== false
 *       ? useSwitchTouch
 *       : useNoSwitchTouch;
 *
 * With the define false every bundler folds the condition, the import is
 * unused, and the layer leaves the bundle with every module only it reaches
 * (core's JavaScript is side-effect free). Spell the condition exactly as
 * above. esbuild does not carry an imported constant into another module, so
 * `TOUCH_LAYERS ? useSwitchTouch : useNoSwitchTouch` keeps the layer there;
 * Rollup, Vite and webpack drop it either way. `typeof` keeps a build without
 * the define from throwing where `process.env.ASTRYX_TOUCH` would: esbuild
 * and webpack leave `process` undefined in a browser bundle.
 *
 * SYNC: When modified, update touchLayers.test.ts, the size report's
 * touch-layers.test.mjs, and the desktop-bundle section of the
 * browser-support guide.
 */

declare global {
  /** The app's build-time define; absent unless the app sets it. */
  var __ASTRYX_TOUCH__: boolean | undefined;
}

/** This build carries touch layers: true unless `__ASTRYX_TOUCH__` is false. */
export const TOUCH_LAYERS: boolean =
  typeof __ASTRYX_TOUCH__ === 'undefined' || __ASTRYX_TOUCH__ !== false;
