// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePressFeedback.ts
 * @input The document-level press controller (utils/pressFeedback.ts)
 * @output Exports usePressFeedback
 * @position Core hook; every component that paints a press calls it and
 *   spreads its result on the element that paints
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/usePressFeedback.doc.mjs
 * - /packages/core/src/utils/pressFeedback.ts
 */

import {useEffect} from 'react';
import {installPressFeedback, pressableProps} from '../utils/pressFeedback';

/**
 * Mark an element as a pressable surface of the touch press model, and make
 * sure the document-level controller that drives it is installed.
 *
 * Spread the result on the element that paints the press. The controller
 * writes `data-pressed="on"` on it while a touch press is believed (after the
 * 150 ms onset delay, cancelled by travel or by a scroll) and
 * `data-pressed="fading"` for the 200 ms release; the element's styles paint
 * the pressed overlay off those arms, and keep `:active` for a mouse. The
 * paint is the pressed token at the press's strength, `--astryx-press-alpha`
 * (a registered custom property the release arm animates 1 → 0), so compose
 * `interactionOverlayStyles.pressedAlpha` from `@astryxdesign/core/utils` on
 * the same element to own that strength, and read it as
 * `color-mix(in srgb, var(--color-overlay-pressed) calc(var(--astryx-press-alpha) * 100%), transparent)`
 * in both arms; see utils/interactionOverlay.stylex.ts. Every Astryx component
 * that paints a press already does this; reach for it when a local component
 * paints its own press and must behave like the rest of the system under a
 * finger.
 *
 * Installation is shared and counted: the first mounted pressable installs
 * the controller, the last one to unmount removes it. No per-element listener
 * or state is added — a press costs one attribute write on one element.
 *
 * @example
 * ```
 * const pressable = usePressFeedback();
 * return <div role="button" {...pressable} {...stylex.props(styles.row)} />;
 * ```
 */
export function usePressFeedback(): typeof pressableProps {
  useEffect(() => installPressFeedback(), []);
  return pressableProps;
}
