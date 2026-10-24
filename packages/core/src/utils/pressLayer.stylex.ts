// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressLayer.stylex.ts
 * @input Uses StyleX and the pressed overlay color token
 * @output Exports `pressLayerStyles` (the touch press painted on a compositor
 *   layer: `cell` for list rows, `control` for buttons, `controlOver` for
 *   cards whose overlay sits above their content) and `pressLayerConsts` (the
 *   build-time mirror of the release clocks and curves in
 *   motion/uikit/list.ts and motion/uikit/button.ts)
 * @position Internal styling utility; Item and TreeList rows, Button, and the
 *   cards (ClickableCard, SelectableCard, Thumbnail) compose it after their
 *   interactionOverlayStyles variant or their own overlay
 *
 * WHY A LAYER. The shared overlays (interactionOverlay.stylex.ts) paint the
 * touch press as a gradient whose strength is a registered custom property,
 * and the release animates that property. A custom property animation, and the
 * repaint of the background that reads it, run on the main thread: while
 * script runs, a pressed row stays at full strength and the release never
 * plays, and every frame of the fade paints. Here the press is an
 * element-sized `::before` under the row's content whose OPACITY is the
 * strength: `[data-astryx-press="on"]` shows it at once, and
 * `[data-astryx-press="fading"]` runs a keyframe animation of its opacity, 1 →
 * 0, on the cell's release clock. Engines run that on the compositor: it keeps
 * advancing every frame while the main thread is blocked, and it lays out and
 * paints nothing.
 *
 * Same pixels as the overlay it replaces: the layer is the pressed token at an
 * opacity equal to the strength, which is what the overlay's
 * `color-mix(pressed calc(strength * 100%), transparent)` paints, on the same
 * clock and curve.
 *
 * COMPOSING IT. Compose it AFTER the element's interactionOverlayStyles
 * variant (StyleX is last-wins per property). The variant keeps the hover and
 * a mouse's `:active`; this turns the variant's own touch paint off (its paint
 * declaration becomes transparent and its release animation is dropped) and
 * paints the press on the layer. The element must be positioned (the layer is
 * placed absolutely) and must not use its own `::before`; `isolation:
 * isolate` keeps the layer above the element's background (a selected fill)
 * and below its content.
 *
 * HELD. A selection hold (selectionHold.ts) writes `[data-astryx-press="held"]`
 * on the row it keeps selected through a navigation push: the layer shows at
 * full strength, and the hold's own Web Animations move it from there.
 *
 * ABOVE THE CONTENT. A card's overlay is its own `::after`, painted over its
 * content (a thumbnail's image would hide a layer below it). `controlOver`
 * paints the press there instead: the pressed token at full strength as the
 * `::after`'s image while the press is on, and an opacity release of the
 * whole `::after` on the fading arm. The card keeps that `::after`'s
 * geometry, its hover and mouse colour, and the colour's yield to the press.
 *
 * ONE CLOCK PER PROFILE. The marker's value is the press's profile: a row is
 * a `cell` and releases on UIKit's cell deselect; everything else is a
 * control and releases on UIButton's highlight release. The controller
 * removes the release attribute on the same clock (the profile table in
 * gestures), and pressLayer.test.ts holds the two together.
 *
 * SYNC: When modified, update pressGesture.ts (PRESS_FADE_MS removes the
 * attribute on the same clock), motion/uikit/list.ts and
 * motion/uikit/button.ts (the clocks and curves), selectionHold.ts (the held
 * state), pressLayer.test.ts and
 * scripts/build-css.test.mjs.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

/**
 * The releases, mirrored for the stylesheet: StyleX evaluates a style at
 * build time and cannot read the constants table, so these are the table's
 * `list.highlight` and `button.highlight` values, and pressLayer.test.ts
 * fails if they drift.
 */
export const pressLayerConsts = stylex.defineConsts({
  /** `list.highlight.releaseMs`, in ms. */
  cellReleaseMs: 200,
  /** `list.highlight.releaseCurve`, as CSS. */
  cellReleaseEase: 'cubic-bezier(0, 0, 0.2, 1)',
  /** `button.highlight.releaseMs`, in ms. */
  controlReleaseMs: 250,
  /** `button.highlight.releaseCurve`, as CSS. */
  controlReleaseEase: 'cubic-bezier(0.42, 0, 0.58, 1)',
});

const CELL_RELEASE = `${pressLayerConsts.cellReleaseMs}ms`;
const CONTROL_RELEASE = `${pressLayerConsts.controlReleaseMs}ms`;

/** Opacity 1 → 0: the layer leaves; the fading arm runs it. */
const release = stylex.keyframes({
  from: {opacity: 1},
  to: {opacity: 0},
});

const ENABLED = ':where(:not(:disabled,[aria-disabled="true"]))';
/** Written by the touch press controller while a press is believed. */
const PRESSED_ON = '[data-astryx-press="on"]';
/** Written by the touch press controller for the release's exit. */
const PRESSED_FADING = '[data-astryx-press="fading"]';
/**
 * Written by a selection hold (selectionHold.ts) while the row stays selected
 * through a navigation push; the controller never overwrites it.
 */
const PRESSED_HELD = '[data-astryx-press="held"]';

/** The pressed token as an image layer, at full strength. */
const pressedImage = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;

export const pressLayerStyles = stylex.create({
  /**
   * A list row: Item, and TreeList's row box. The release is UIKit's cell
   * deselect (`list.highlight`).
   */
  cell: {
    // The overlay variant's own touch paint: transparent, and its release
    // (a main-thread animation of the strength) dropped. The layer below
    // paints the press instead.
    '--_press-paint': 'transparent',
    animationName: null,
    animationDuration: null,
    animationTimingFunction: null,
    animationFillMode: null,
    isolation: 'isolate',
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: colorVars['--color-overlay-pressed'],
      // On at once while the press is believed, and while a selection hold
      // keeps the row selected (its own animations move it from there);
      // nothing transitions it.
      opacity: {
        default: 0,
        [ENABLED]: {default: null, [PRESSED_ON]: 1, [PRESSED_HELD]: 1},
      },
      animationName: {
        default: null,
        [ENABLED]: {default: null, [PRESSED_FADING]: release},
      },
      animationDuration: {default: null, [PRESSED_FADING]: CELL_RELEASE},
      animationTimingFunction: {
        default: null,
        [PRESSED_FADING]: pressLayerConsts.cellReleaseEase,
      },
      animationFillMode: {default: null, [PRESSED_FADING]: 'both'},
    },
  },
  /**
   * A control whose press lives on its own surface: Button (and the
   * IconButton and ToggleButton built on it). The release is UIButton's
   * (`button.highlight`).
   */
  control: {
    // As for a cell: the overlay variant's touch paint goes transparent and
    // its main-thread release is dropped; the layer paints the press.
    '--_press-paint': 'transparent',
    animationName: null,
    animationDuration: null,
    animationTimingFunction: null,
    animationFillMode: null,
    isolation: 'isolate',
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      backgroundColor: colorVars['--color-overlay-pressed'],
      opacity: {
        default: 0,
        [ENABLED]: {default: null, [PRESSED_ON]: 1},
      },
      animationName: {
        default: null,
        [ENABLED]: {default: null, [PRESSED_FADING]: release},
      },
      animationDuration: {default: null, [PRESSED_FADING]: CONTROL_RELEASE},
      animationTimingFunction: {
        default: null,
        [PRESSED_FADING]: pressLayerConsts.controlReleaseEase,
      },
      animationFillMode: {default: null, [PRESSED_FADING]: 'both'},
    },
  },
  /**
   * A control whose overlay is a `::after` over its content: the cards. The
   * card owns that `::after` (its box, its hover and mouse colour, and that
   * colour yielding to a press); this paints the press on it at full
   * strength and releases it by the `::after`'s opacity, on the control
   * clock.
   */
  controlOver: {
    // A release of the strength on the element, if an overlay variant
    // brought one, is dropped: nothing reads it here.
    animationName: null,
    animationDuration: null,
    animationTimingFunction: null,
    animationFillMode: null,
    '::after': {
      backgroundImage: {
        default: null,
        [ENABLED]: {
          default: null,
          [PRESSED_ON]: pressedImage,
          [PRESSED_FADING]: pressedImage,
        },
      },
      animationName: {
        default: null,
        [ENABLED]: {default: null, [PRESSED_FADING]: release},
      },
      animationDuration: {default: null, [PRESSED_FADING]: CONTROL_RELEASE},
      animationTimingFunction: {
        default: null,
        [PRESSED_FADING]: pressLayerConsts.controlReleaseEase,
      },
      animationFillMode: {default: null, [PRESSED_FADING]: 'both'},
    },
  },
});
