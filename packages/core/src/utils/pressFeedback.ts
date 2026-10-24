// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressFeedback.ts
 * @input The press paint and profiles (gestures/pressPaint.ts,
 *   gestures/PressTracker.ts), the touch presentation (touchPresentation.ts)
 *   and the document's mouse, keyboard and visibility events
 * @output Exports PRESSABLE_ATTRIBUTE, PRESSED_ATTRIBUTE, pressableProps,
 *   cellPressableProps, pressReleaseMs and installPressFeedback
 * @position The press model's marker, and the presses the gesture host does
 *   not track. A finger's or a pen's press is UIControl tracking in the
 *   gesture host (gestures/delegatedPress.ts, installed by usePressFeedback
 *   with this marker). This file paints a mouse's or the Space key's press
 *   where the stylesheet has dropped `:active`. The CSS arms that read the
 *   attribute live in interactionOverlay.stylex.ts, pressLayer.stylex.ts and
 *   the components with their own `:active` rule. Tested by
 *   pressFeedback.test.ts.
 *
 * THE MARKER IS THE PROFILE. Every component that paints a press carries
 * {@link PRESSABLE_ATTRIBUTE} on the element that paints. Its value names how
 * the press is tracked and released (gestures/PressTracker.ts,
 * `PRESS_PROFILES`): empty for a control (a button, a card, a switch), which
 * highlights in the frame the finger lands (after UIScrollView's content-touch
 * delay inside a scroller) and releases on UIButton's clock; `cell` for a list
 * row, which waits for that delay wherever it is, is cancelled by the pan
 * hysteresis, and releases on the deselect clock.
 *
 * A MOUSE AND THE SPACE KEY. Where the primary pointer is fine (a desktop),
 * nothing here runs: CSS `:active` keeps their press, as it always has. Under
 * a finger the stylesheet drops the `:active` arm (`@media (pointer:
 * coarse)`), and that query reads the PRIMARY pointer, so on a phone or a
 * tablet it also drops `:active` for a mouse or trackpad click and a Space
 * press on a focused button. There, this paints those: at once (no scroller
 * can claim a mouse button or a key, so nothing waits), held while the button
 * or key is down whatever the travel (as `:active` holds), and faded at the
 * release on the surface's own clock. The query is the shared touch
 * presentation's (touchPresentation.ts), the stylesheet's own condition.
 *
 * Every write goes through `paintPress`, so the fade timer and the attribute
 * cannot drift apart, and a value another owner holds (a row kept `held`
 * through a navigation) is never overwritten or cleared.
 *
 * SYNC: When modified, update hooks/usePressFeedback.ts,
 * hooks/usePressFeedback.doc.mjs, utils/interactionOverlay.stylex.ts and
 * pressFeedback.test.ts.
 */

import {paintPress} from '../gestures/pressPaint';
import {PRESS_PROFILES, type PressProfile} from '../gestures/PressTracker';
import {readTouchPresentation} from './touchPresentation';

/**
 * The marker. Every Astryx component that paints a press carries it on the
 * element that paints; a local component can opt in by spreading
 * {@link pressableProps} (or calling `usePressFeedback`) on its own pressable
 * element and reading {@link PRESSED_ATTRIBUTE} in its styles. Its value is
 * the press profile.
 */
export const PRESSABLE_ATTRIBUTE = 'data-astryx-pressable';

/**
 * `on` while the press is held; `fading` for the release's exit; `held` while
 * an owner keeps a row selected through a navigation.
 */
export const PRESSED_ATTRIBUTE = 'data-astryx-press';

/** Spread onto the element that paints a control's press. */
export const pressableProps: {readonly [PRESSABLE_ATTRIBUTE]: ''} = {
  [PRESSABLE_ATTRIBUTE]: '',
};

/** Spread onto the element that paints a list row's press: a cell's. */
export const cellPressableProps: {readonly [PRESSABLE_ATTRIBUTE]: 'cell'} = {
  [PRESSABLE_ATTRIBUTE]: 'cell',
};

/**
 * How long the release on `element` takes, ms: its profile's clock, the one
 * its stylesheet arm animates on. An empty or unknown marker is a control.
 */
export function pressReleaseMs(element: Element): number {
  const profiles: Readonly<Record<string, PressProfile>> = PRESS_PROFILES;
  const name = element.getAttribute(PRESSABLE_ATTRIBUTE) ?? '';
  return (profiles[name] ?? PRESS_PROFILES.control).releaseMs;
}

/** A surface that is not enabled does not press, however it is pressed. */
const DISABLED = ':disabled, [aria-disabled="true"]';

/**
 * The `<input>` types a Space press activates. Browsers hold `:active` on
 * these (and on `<button>`) while Space is down; on a link or a
 * `role="button"` element Space does nothing, so neither paints there.
 */
const SPACE_ACTIVATED_INPUT_TYPES: ReadonlySet<string> = new Set([
  'button',
  'checkbox',
  'image',
  'radio',
  'reset',
  'submit',
]);

interface HeldPress {
  element: HTMLElement;
  /** The mouse pointer holding it; `null` for the Space key. */
  pointerId: number | null;
}

/** The mouse button's or the Space key's press, while it is down. */
let held: HeldPress | null = null;
/** How many callers hold the listeners installed; they exist while > 0. */
let holders = 0;

/** The nearest enabled pressable surface at or above `target`. */
function surfaceAt(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }
  const found = target.closest(`[${PRESSABLE_ATTRIBUTE}]`);
  if (!(found instanceof HTMLElement) || found.matches(DISABLED)) {
    return null;
  }
  return found;
}

/**
 * Whether presses with a mouse or a key are this file's to paint: the
 * stylesheet dropped `:active` for them. Asked at the press, never at render,
 * so a layout that must not depend on the pointer stays independent of it.
 */
function stylesheetDroppedActive(): boolean {
  return readTouchPresentation().isTouch;
}

/** Start a mouse button's or the Space key's press on the surface under `target`. */
function press(target: EventTarget | null, pointerId: number | null): void {
  release();
  const element = surfaceAt(target);
  if (element != null && paintPress(element, 'on')) {
    held = {element, pointerId};
  }
}

/** The button or the key came up: the press fades on its surface's clock. */
function release(): void {
  if (held == null) {
    return;
  }
  const {element} = held;
  held = null;
  paintPress(element, 'fading', {
    releaseMs: pressReleaseMs(element),
    onlyFrom: ['on'],
  });
}

/** The platform took the press away: the paint goes at once. */
function cancel(): void {
  if (held == null) {
    return;
  }
  const {element} = held;
  held = null;
  paintPress(element, 'none', {onlyFrom: ['on']});
}

function onPointerDown(event: PointerEvent): void {
  // A finger's or a pen's press is the gesture host's. Only the primary
  // button: that is the press `:active` paints.
  if (
    event.pointerType === 'mouse' &&
    event.button === 0 &&
    stylesheetDroppedActive()
  ) {
    press(event.target, event.pointerId);
  }
}

function onPointerUp(event: PointerEvent): void {
  if (held != null && held.pointerId === event.pointerId) {
    release();
  }
}

function onPointerCancel(event: PointerEvent): void {
  if (held != null && held.pointerId === event.pointerId) {
    cancel();
  }
}

/**
 * `dragstart`, and NOT `contextmenu`: a press that becomes a drag has taken
 * the gesture, but a right-click is a mouse act this file never tracks.
 */
function onDragStart(): void {
  if (held?.pointerId != null) {
    cancel();
  }
}

/** Whether a Space press on this element is an activation browsers paint as `:active`. */
function activatesOnSpace(target: EventTarget | null): boolean {
  if (target instanceof HTMLButtonElement) {
    return true;
  }
  return (
    target instanceof HTMLInputElement &&
    SPACE_ACTIVATED_INPUT_TYPES.has(target.type)
  );
}

/**
 * Space went down on a focused button. Heard in the BUBBLE phase, after the
 * page's own handlers, so a press the page cancelled (`preventDefault`)
 * paints nothing, exactly as `:active` does not engage for one.
 */
function onKeyDown(event: KeyboardEvent): void {
  if (
    event.key !== ' ' ||
    event.repeat ||
    event.isComposing ||
    event.defaultPrevented ||
    !activatesOnSpace(event.target) ||
    !stylesheetDroppedActive()
  ) {
    return;
  }
  press(event.target, null);
}

function onKeyUp(event: KeyboardEvent): void {
  if (event.key === ' ' && held != null && held.pointerId == null) {
    release();
  }
}

/**
 * Focus left the pressed button, or the window lost focus: the key's release
 * may never arrive, so the press ends now, with its fade.
 */
function onBlur(): void {
  if (held != null && held.pointerId == null) {
    release();
  }
}

/** A surface hidden mid-press must not come back painted. */
function onVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    cancel();
  }
}

const PASSIVE_CAPTURE = {capture: true, passive: true} as const;
const PASSIVE = {passive: true} as const;

function addListeners(): void {
  window.addEventListener('pointerdown', onPointerDown, PASSIVE_CAPTURE);
  window.addEventListener('pointerup', onPointerUp, PASSIVE_CAPTURE);
  window.addEventListener('pointercancel', onPointerCancel, PASSIVE_CAPTURE);
  window.addEventListener('dragstart', onDragStart, PASSIVE_CAPTURE);
  window.addEventListener('keydown', onKeyDown, PASSIVE);
  window.addEventListener('keyup', onKeyUp, PASSIVE);
  // `blur` does not bubble: the capture phase hears the element losing focus
  // and the window losing it.
  window.addEventListener('blur', onBlur, PASSIVE_CAPTURE);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function removeListeners(): void {
  window.removeEventListener('pointerdown', onPointerDown, PASSIVE_CAPTURE);
  window.removeEventListener('pointerup', onPointerUp, PASSIVE_CAPTURE);
  window.removeEventListener('pointercancel', onPointerCancel, PASSIVE_CAPTURE);
  window.removeEventListener('dragstart', onDragStart, PASSIVE_CAPTURE);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  window.removeEventListener('blur', onBlur, PASSIVE_CAPTURE);
  document.removeEventListener('visibilitychange', onVisibilityChange);
}

/**
 * Install the mouse and Space-key half of the press model for the document.
 * Shared and counted: the first caller installs the listeners, the last one
 * to release them removes them (and any press still held). Returns the
 * release function.
 */
export function installPressFeedback(): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  if (holders === 0) {
    addListeners();
  }
  holders += 1;
  let isReleased = false;
  return () => {
    if (isReleased) {
      return;
    }
    isReleased = true;
    holders -= 1;
    if (holders === 0) {
      removeListeners();
      cancel();
    }
  };
}
