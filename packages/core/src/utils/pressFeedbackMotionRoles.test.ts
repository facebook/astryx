// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressFeedbackMotionRoles.test.ts
 * @input The press controller (pressFeedback.ts) with resolveMotion standing
 *   in for a theme that retunes the press roles
 * @output The controller's clocks read their `timing.press` motion roles
 *   through resolveMotion under the pressed element: the release's clock
 *   (the deselect role) on a control and on a row, a quick tap's flash, and
 *   on a desktop a mouse's release. A control's longer release is its layer's
 *   own animation, which the release waits for (endAfterRelease); jsdom runs
 *   no animation, so only the clock shows here
 * @position Unit proof beside pressFeedback.test.ts. A theme reaches the
 *   roles only through `spec:AST-108`'s knobs (`spec:AST-094` DEC-15), and
 *   resolveMotion answers the table value unless one is set, so the stand-in
 *   here is the only way to see a clock follow its role.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

/** The roles a theme would retune, and what this stand-in answers. */
const THEME: Readonly<Record<string, number>> = {
  buttonReleaseMs: 400,
  highlightOutMs: 320,
  flashMs: 140,
};

vi.mock('../motion/resolveMotion', () => ({
  resolveMotion: (
    _element: unknown,
    group: Record<string, number | object>,
    key?: string,
  ): number | object | undefined =>
    key === undefined ? group : (THEME[key] ?? group[key]),
}));

const {installPressFeedback, PRESSABLE_ATTRIBUTE, PRESSED_ATTRIBUTE} =
  await import('./pressFeedback');

let release: () => void = () => {};
let restoreMatchMedia: (() => void) | null = null;

function press(element: Element, type: string, pointerType = 'touch'): void {
  const event = new Event(type, {bubbles: true, cancelable: true});
  Object.assign(event, {
    button: 0,
    ctrlKey: false,
    clientX: 10,
    clientY: 10,
    pointerId: 1,
    pointerType,
  });
  element.dispatchEvent(event);
}

function lift(element: Element): void {
  const event = new Event('touchend', {bubbles: true});
  Object.assign(event, {touches: []});
  element.dispatchEvent(event);
}

/** A phone or a tablet: the primary pointer is coarse. */
function coarsePrimaryPointer(): void {
  const matchMedia = window.matchMedia;
  window.matchMedia = (query: string) => ({
    ...matchMedia(query),
    matches: query.includes('(pointer: coarse)') || matchMedia(query).matches,
  });
  restoreMatchMedia = () => {
    window.matchMedia = matchMedia;
  };
}

function surface(marker: string): HTMLElement {
  const element = document.createElement(marker === '' ? 'button' : 'div');
  element.setAttribute(PRESSABLE_ATTRIBUTE, marker);
  document.body.appendChild(element);
  return element;
}

beforeEach(() => {
  vi.useFakeTimers();
  document.body.innerHTML = '';
  release = installPressFeedback();
});

afterEach(() => {
  release();
  restoreMatchMedia?.();
  restoreMatchMedia = null;
  vi.useRealTimers();
});

describe("the press controller's clocks read their motion roles (#8268)", () => {
  it("a release's clock reads its role, `timing.press.highlightOutMs`, on a control and on a row", () => {
    coarsePrimaryPointer();
    for (const tag of ['button', 'div']) {
      const pressable = document.createElement(tag);
      pressable.setAttribute(PRESSABLE_ATTRIBUTE, '');
      document.body.appendChild(pressable);
      press(pressable, 'pointerdown');
      expect(pressable.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
      press(pressable, 'pointerup');
      lift(pressable);
      expect(pressable.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
      vi.advanceTimersByTime(THEME.highlightOutMs - 1);
      expect(pressable.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
      vi.advanceTimersByTime(1);
      expect(pressable.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    }
  });

  it("a quick tap's flash lasts its role: `timing.press.flashMs`", () => {
    coarsePrimaryPointer();
    // A row in a scroll view waits the content-touch delay, so a tap that
    // lifts before it flashes at the lift.
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    Object.defineProperty(scroller, 'clientHeight', {value: 100});
    Object.defineProperty(scroller, 'scrollHeight', {value: 400});
    const cell = document.createElement('div');
    cell.setAttribute(PRESSABLE_ATTRIBUTE, '');
    scroller.appendChild(cell);
    document.body.appendChild(scroller);
    press(cell, 'pointerdown');
    vi.advanceTimersByTime(20);
    press(cell, 'pointerup');
    lift(cell);
    expect(cell.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    vi.advanceTimersByTime(THEME.flashMs - 1);
    expect(cell.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    vi.advanceTimersByTime(1);
    expect(cell.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
  });

  it("on a desktop a mouse's release lasts the deselect clock's role, as a finger's does there", () => {
    const control = surface('');
    press(control, 'pointerdown', 'mouse');
    expect(control.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    press(control, 'pointerup', 'mouse');
    vi.advanceTimersByTime(THEME.highlightOutMs - 1);
    expect(control.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(1);
    expect(control.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });
});
