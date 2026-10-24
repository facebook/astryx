// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePressFeedback.ts
 * @input The gesture host's delegated press tracking
 *   (gestures/delegatedPress.ts) and the mouse and Space-key half of the press
 *   model (utils/pressFeedback.ts)
 * @output Exports usePressFeedback and UsePressFeedbackOptions
 * @position Core hook; every component that paints a press calls it and
 *   spreads its result on the element that paints
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/usePressFeedback.doc.mjs
 * - /packages/core/src/utils/pressFeedback.ts
 */

import {useEffect} from 'react';
import {usePressAttribute} from '../gestures/delegatedPress';
import {
  cellPressableProps,
  installPressFeedback,
  pressableProps,
} from '../utils/pressFeedback';

export interface UsePressFeedbackOptions {
  /**
   * How the press is tracked and released. `control` (a button, a card, a
   * switch) highlights in the frame the finger lands, after the content-touch
   * delay inside a scroller, and releases on UIButton's clock. `cell` (a list
   * row) waits for that delay wherever it is, is cancelled by 10 px of
   * travel, and releases on the deselect clock.
   * @default 'control'
   */
  profile?: 'control' | 'cell';
}

/**
 * The gesture host's install options, one object for every caller: installs
 * are counted, and the first one's options hold.
 */
const PRESS_ATTRIBUTE_OPTIONS = {} as const;

/**
 * Mark an element as a pressable surface of the touch press model, and make
 * sure the document-level tracking that drives it is installed.
 *
 * Spread the result on the element that paints the press, and compose one of
 * `interactionOverlayStyles` (from `@astryxdesign/core/utils`) on the same
 * element: `backgroundColor` or `backgroundImage` for a surface whose hover
 * and press are the system's overlays, `pressedBackgroundColor` for one
 * whose hover is its own. Under a finger the gesture host tracks the press
 * the way UIKit tracks a control or a cell (see `profile`) and writes its
 * attribute on the element while the press is held and for the release; the
 * composed style paints the pressed token on the first frame and fades it on
 * the profile's clock. A mouse on a desktop keeps `:active`. On a phone or
 * tablet the stylesheet drops `:active` for every press, so a mouse,
 * trackpad or Space-key press is painted there too, at once. A press is
 * themed through `--color-overlay-pressed`.
 * Every Astryx component that paints a press already does this; reach for it
 * when a local component paints its own press and must behave like the rest
 * of the system under a finger.
 *
 * Installation is shared and counted: the first mounted pressable installs
 * the tracking, the last one to unmount removes it. No per-element listener
 * or state is added — a press costs one attribute write on one element.
 *
 * @example
 * ```
 * const pressable = usePressFeedback();
 * return <button {...pressable} {...stylex.props(styles.button)} />;
 *
 * const row = usePressFeedback({profile: 'cell'});
 * return <div role="button" {...row} {...stylex.props(styles.row)} />;
 * ```
 */
export function usePressFeedback(
  options: UsePressFeedbackOptions = {},
): typeof pressableProps | typeof cellPressableProps {
  usePressAttribute(PRESS_ATTRIBUTE_OPTIONS);
  useEffect(() => installPressFeedback(), []);
  return options.profile === 'cell' ? cellPressableProps : pressableProps;
}
