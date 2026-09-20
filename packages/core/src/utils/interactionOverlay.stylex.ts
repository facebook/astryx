// Copyright (c) Meta Platforms, Inc. and affiliates.

/* eslint-disable @astryx/no-hover-on-disabled -- Every hover branch is
 * nested beneath ENABLED below. Keeping that shared guard outside the media
 * branch is what gives hover and active matching generated specificity. */

/**
 * @file Shared hover and pressed overlay states
 * @input Uses StyleX and the semantic interaction-overlay color tokens
 * @output Exports reusable background-color and background-image state styles,
 *   the touch press's registered strength variable (`pressVars`) and the
 *   release animation's duration (`PRESS_RELEASE_DURATION`)
 * @position Internal styling utility for interactive core surfaces
 *
 * Every surface that paints a press composes one of these (or carries its own
 * `:active` rule in the same shape), so a change to how the system answers a
 * press is made here once. `pressedBackgroundColor` is the press without the
 * hover, for controls whose hover is a colour or nothing. `pressedAlpha` is the
 * touch press's strength alone, for an owner whose pressed paint lives on a
 * descendant or a pseudo-element.
 *
 * Keep the enabled guard outside the individual states. StyleX assigns an
 * extra priority bucket (and generated selector specificity) to media-nested
 * rules. Repeating `:active` inside the hover-capable branch gives hover and
 * press the same generated specificity; StyleX's native pseudo-state ordering
 * then emits `:active` last.
 *
 * TWO POINTERS, TWO PRESS MODELS. A mouse keeps `:active`. A finger does not:
 * on iOS Safari `:active` paints on the touch itself and can outlive the start
 * of a scroll, so under `@media (pointer: coarse)` the bare `:active` arm is
 * dropped and the press is written by the touch press controller
 * (`utils/pressFeedback.ts`) as `data-pressed="on"` once the press is
 * believed (150 ms, no travel, no scroll) and `data-pressed="fading"` for the
 * 200 ms release. The two arms paint those through ONE number:
 *
 *  - `--astryx-press-alpha` is the press's strength, 0 to 1. It is a
 *    registered custom property (`@property`, syntax `<number>`, declared once
 *    in the shipped stylesheet by {@link pressVars}), which is what lets it
 *    animate: the overlay itself is a gradient layer, and gradients do not
 *    interpolate, but a registered number does, and every declaration that
 *    reads it is re-resolved on each frame. The touch paint is the pressed
 *    token at that strength — `color-mix(in srgb, pressed calc(alpha * 100%),
 *    transparent)` — painted as a background IMAGE: an image change is
 *    discrete, so a composer's colour transition cannot fade the onset in.
 *  - `[data-pressed="on"]` sets the strength to 1 and paints, on the first
 *    frame. Nothing transitions a custom property a composer never named.
 *  - `[data-pressed="fading"]` keeps the same paint and runs the release
 *    animation, strength 1 → 0 over {@link PRESS_RELEASE_DURATION} (UIKit's
 *    deselect crossfade; the controller removes the attribute when the same
 *    clock runs out, and by then the paint is gone). It fades to nothing, not
 *    to the hover strength: under a finger there is no hover to land on.
 *
 * WHY AN ANIMATION AND NOT A TRANSITION. Two reasons, both about composers.
 * StyleX is last-wins per property, and composers own their `transition-*`
 * longhands (Button, Item, Tab, Link, ...): the utility can neither append the
 * strength to their transition list nor set one of its own without taking the
 * whole property from them. No composer sets `animation-*` on the element that
 * composes these, so those longhands are free. And a transition needs the
 * declared value to change at the style change, which would make the release
 * arm declare strength 0; every property reading the strength would then
 * change computed value at the lift, and a composer that transitions
 * `background-image` (Button, Token, TreeListItem — Chromium interpolates
 * same-shape gradients) would start its own, shorter fade over this one. With
 * keyframes owning both ends the release arm declares 1 like the on arm, so at
 * the lift nothing a composer transitions changes; only the animation moves.
 *
 * Browser support: Chromium 111+, Safari 16.4+ and Firefox 128+ register the
 * property and interpolate. An engine without `@property` ignores the rule,
 * animates the unregistered value discretely (the paint holds for half the
 * release, then goes) — a step, no worse than the arm before this one.
 *
 * Composers must not set `backgroundImage` of their own on the colour variants
 * (none do): the touch arms own it. Composers must not set `animation-*` on
 * the element that composes any of these (none do): StyleX would drop either
 * the release animation or theirs.
 *
 * SYNC: When modified, update pressFeedback.ts, pressGesture.ts (the fade
 * clock), hooks/usePressFeedback.doc.mjs, the components that paint the touch
 * press off an ancestor scope or a pseudo-element (Switch, Tab,
 * CheckboxInput, RadioListItem, ClickableCard, SelectableCard, Thumbnail)
 * and scripts/build-css.test.mjs.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

/**
 * The touch press's strength on the surface the controller painted, 0 to 1.
 *
 * Registered (`@property --astryx-press-alpha { syntax: "<number>";
 * initial-value: 0 }`) so it interpolates, and inherited, so an owner's
 * strength reaches the descendant that paints for it (a switch's track and
 * thumb, a tab's hover layer) and a card's or an indicator wrapper's
 * `::after`. Read it with `pressVars['--astryx-press-alpha']`, only inside a
 * `data-pressed` arm:
 * a pressed row's strength is 1 for everything inside the row.
 */
export const pressVars = stylex.defineVars({
  '--astryx-press-alpha': stylex.types.number(0),
});

/**
 * How long the release takes, as the CSS clock the animation runs on.
 *
 * SYNC: equals `PRESS_FADE_MS` in pressGesture.ts, the timer after which the
 * controller removes the attribute; pressFeedback.test.ts holds the two equal.
 * StyleX resolves imported `defineVars` and nothing else, so the number is
 * written here rather than derived from the machine's constant.
 */
export const PRESS_RELEASE_DURATION = '200ms';

const ENABLED = ':where(:not(:disabled,[aria-disabled="true"]))';
const HOVER_HOVER = '@media (hover: hover)';
const COARSE = '@media (pointer: coarse)';
/** Written by the touch press controller while a press is believed. */
const PRESSED_ON = '[data-pressed="on"]';
/** Written by the touch press controller for the release's exit. */
const PRESSED_FADING = '[data-pressed="fading"]';

const PRESS_ALPHA = pressVars['--astryx-press-alpha'];

const hoverImage = `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`;
const pressedImage = `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`;
const neutralImage = `linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`;

/**
 * The pressed token at the touch press's current strength.
 *
 * NOT usable inside another file's `stylex.create` (StyleX resolves imported
 * `defineVars` and nothing else): a component that paints the touch press off
 * an ancestor scope or a pseudo-element rebuilds this from `colorVars` and
 * {@link pressVars}, in this exact shape.
 */
export const pressedOverlayColor = `color-mix(in srgb, ${colorVars['--color-overlay-pressed']} calc(${PRESS_ALPHA} * 100%), transparent)`;
/** {@link pressedOverlayColor} as the overlay's gradient layer. */
export const pressedOverlayImage = `linear-gradient(${pressedOverlayColor}, ${pressedOverlayColor})`;

/** Strength 1 → 0; the release arm runs it over {@link PRESS_RELEASE_DURATION}. */
const pressRelease = stylex.keyframes({
  from: {[PRESS_ALPHA]: 1},
  to: {[PRESS_ALPHA]: 0},
});

/**
 * The release's curve: a gentle ease-out that spends the whole clock fading
 * (strength ≈ 0.2 at the midpoint), which is what a deselect crossfade reads
 * as. Not the system's `--ease-standard`: that curve is for things that move,
 * and is so front-loaded (strength 0.05 at the midpoint) that the release
 * would read as half its clock.
 */
const RELEASE_EASE = 'cubic-bezier(0, 0, 0.2, 1)';

/**
 * The touch press's strength and its release, on the element the controller
 * writes to. Spread into every variant below; `pressedAlpha` is this alone.
 */
const touchPress = {
  [PRESS_ALPHA]: {
    default: null,
    [PRESSED_ON]: 1,
    [PRESSED_FADING]: 1,
  },
  animationName: {default: null, [PRESSED_FADING]: pressRelease},
  animationDuration: {default: null, [PRESSED_FADING]: PRESS_RELEASE_DURATION},
  animationTimingFunction: {default: null, [PRESSED_FADING]: RELEASE_EASE},
  animationFillMode: {default: null, [PRESSED_FADING]: 'both'},
};

export const interactionOverlayStyles = stylex.create({
  backgroundColor: {
    ...touchPress,
    backgroundColor: {
      default: 'transparent',
      [ENABLED]: {
        default: null,
        ':active': {
          default: colorVars['--color-overlay-pressed'],
          [COARSE]: 'transparent',
        },
        [HOVER_HOVER]: {
          default: null,
          ':hover': colorVars['--color-overlay-hover'],
          ':active': colorVars['--color-overlay-pressed'],
        },
        // While the controller paints, the colour arms yield to the image. A
        // device with a touchscreen beside a mouse matches `:active` and the
        // emulated `:hover` under a finger too, and the press would otherwise
        // paint twice.
        [PRESSED_ON]: 'transparent',
        [PRESSED_FADING]: 'transparent',
      },
    },
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        [PRESSED_ON]: pressedOverlayImage,
        [PRESSED_FADING]: pressedOverlayImage,
      },
    },
  },
  backgroundImage: {
    ...touchPress,
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        ':active': {
          default: pressedImage,
          [COARSE]: 'none',
        },
        [HOVER_HOVER]: {
          default: null,
          ':hover': hoverImage,
          ':active': pressedImage,
        },
        [PRESSED_ON]: pressedOverlayImage,
        [PRESSED_FADING]: pressedOverlayImage,
      },
    },
  },
  backgroundImageOnNeutral: {
    ...touchPress,
    backgroundImage: {
      default: neutralImage,
      [ENABLED]: {
        default: null,
        ':active': {
          default: `${pressedImage}, ${neutralImage}`,
          [COARSE]: neutralImage,
        },
        [HOVER_HOVER]: {
          default: null,
          ':hover': `${hoverImage}, ${neutralImage}`,
          ':active': `${pressedImage}, ${neutralImage}`,
        },
        [PRESSED_ON]: `${pressedOverlayImage}, ${neutralImage}`,
        [PRESSED_FADING]: `${pressedOverlayImage}, ${neutralImage}`,
      },
    },
  },
  /**
   * The pressed arm alone, for a control whose hover answer is its own — a
   * text link changes colour, a disclosure row has none — so a press paints
   * the system's pressed overlay without adding a hover surface the control
   * never had. Same enabled guard and the same two pointers as above.
   */
  pressedBackgroundColor: {
    ...touchPress,
    backgroundColor: {
      default: null,
      [ENABLED]: {
        default: null,
        ':active': {
          default: colorVars['--color-overlay-pressed'],
          [COARSE]: 'transparent',
        },
        // The mouse arm yields to the image while the controller paints; see
        // the colour variant above.
        [PRESSED_ON]: 'transparent',
        [PRESSED_FADING]: 'transparent',
      },
    },
    backgroundImage: {
      default: null,
      [ENABLED]: {
        default: null,
        [PRESSED_ON]: pressedOverlayImage,
        [PRESSED_FADING]: pressedOverlayImage,
      },
    },
  },
  /**
   * The touch press's strength and release, and no paint of its own, for the
   * element the controller writes to when the pressed paint lives elsewhere:
   * a switch row (its track and thumb paint), a checkbox or radio row (the
   * owner's layer over the indicator paints), a tab (its hover layer paints),
   * a card (its `::after` paints). Those read
   * `pressVars['--astryx-press-alpha']` off this element, so the owner and
   * the paint fade as one.
   */
  pressedAlpha: {
    ...touchPress,
  },
});
