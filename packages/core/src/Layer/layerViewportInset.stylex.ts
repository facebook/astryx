// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerViewportInset.stylex.ts
 * @input Uses @stylexjs/stylex
 * @output CSS length expressions for the gutter a layer keeps from each
 *   viewport edge, and the custom properties an app sets to widen one edge
 * @position Layer utility; read by Popover, DropdownMenu and any layer that
 *   fits itself to the viewport
 *
 * The expressions are `defineConsts`, not plain exported strings: StyleX
 * inlines a value from another file only through `defineVars`/`defineConsts`
 * in a `.stylex.ts` file. They are written out in full for the same reason —
 * the compiler evaluates them statically.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/layerViewportInset.test.ts
 * - /packages/core/src/Layer/Layer.doc.mjs (theming.vars)
 * - /packages/core/src/theme/derivedVarRegistry.test.ts (VARS_WITHOUT_DERIVED_MAPPING)
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Custom properties an app sets — usually once, on `:root` — to declare a
 * persistent bar floating over one viewport edge: a phone navigation bar
 * fixed over the bottom of the viewport, a docked toolbar, a banner. The bar
 * contributes no layout height, so without the inset a layer the browser has
 * correctly fitted to the viewport still ends underneath it.
 *
 * Each edge's gutter is `max(--spacing-4, env(safe-area-inset-*))` plus that
 * edge's inset; an unset inset reads as `0px`. Block start/end follow the
 * layer's writing mode; in a horizontal document block-end is the bottom.
 *
 * @example
 * ```css
 * :root {
 *   --astryx-layer-inset-block-end: var(--app-nav-bar-height);
 * }
 * ```
 */
export const layerInsetVars = stylex.defineConsts({
  blockStart: '--astryx-layer-inset-block-start',
  blockEnd: '--astryx-layer-inset-block-end',
  inlineStart: '--astryx-layer-inset-inline-start',
  inlineEnd: '--astryx-layer-inset-inline-end',
});

/**
 * Gutter per viewport edge: the base `--spacing-4` gutter, widened by the
 * device safe area and by the app's inset for that edge.
 */
export const layerViewportGutter = stylex.defineConsts({
  blockStart:
    'calc(max(var(--spacing-4), env(safe-area-inset-top, 0px)) + var(--astryx-layer-inset-block-start, 0px))',
  blockEnd:
    'calc(max(var(--spacing-4), env(safe-area-inset-bottom, 0px)) + var(--astryx-layer-inset-block-end, 0px))',
  inlineStart:
    'calc(max(var(--spacing-4), env(safe-area-inset-left, 0px)) + var(--astryx-layer-inset-inline-start, 0px))',
  inlineEnd:
    'calc(max(var(--spacing-4), env(safe-area-inset-right, 0px)) + var(--astryx-layer-inset-inline-end, 0px))',
  /**
   * One gutter for both inline edges, for an anchor-aligned layer whose
   * position-try fallbacks decide at paint time which edge it meets.
   */
  inline:
    'calc(max(var(--spacing-4), env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)) + max(var(--astryx-layer-inset-inline-start, 0px), var(--astryx-layer-inset-inline-end, 0px)))',
});

/**
 * Gutters for engines without `env()`, keeping only the app's insets.
 */
export const layerViewportGutterFallback = stylex.defineConsts({
  blockStart:
    'calc(var(--spacing-4) + var(--astryx-layer-inset-block-start, 0px))',
  blockEnd: 'calc(var(--spacing-4) + var(--astryx-layer-inset-block-end, 0px))',
  inlineStart:
    'calc(var(--spacing-4) + var(--astryx-layer-inset-inline-start, 0px))',
  inlineEnd:
    'calc(var(--spacing-4) + var(--astryx-layer-inset-inline-end, 0px))',
  inline:
    'calc(var(--spacing-4) + max(var(--astryx-layer-inset-inline-start, 0px), var(--astryx-layer-inset-inline-end, 0px)))',
});
