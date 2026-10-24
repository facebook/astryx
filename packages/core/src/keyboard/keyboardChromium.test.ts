// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardChromium.test.ts
 * @input vitest, jsdom, getKeyboardLayoutGuide, a stand-in visual viewport in
 *   Chrome's profile and a stand-in navigator.virtualKeyboard
 * @output Tests the guide on Chrome (spec:AST-099 FR8, proposed): a keyboard
 *   coming up rides from its report, dated back to Gboard's start, on
 *   Gboard's slide (the accessory bar's report rides to the last keyboard's
 *   height), a hide rides down from the blur or from its report, focus moving
 *   between fields holds Chrome's momentary hide, and the page's
 *   VirtualKeyboard is never touched
 * @position Unit tests for the Chrome part of keyboard/keyboardLayoutGuide.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {keyboard as androidKeyboard} from '../motion/android';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';
import type {KeyboardTransition} from './keyboardModel';

let view: EventTarget & {height: number; offsetTop: number; scale: number};
let virtualKeyboard: EventTarget & {overlaysContent: boolean};
let a: HTMLInputElement;
let b: HTMLInputElement;
let button: HTMLButtonElement;
const seen: KeyboardTransition[] = [];
let unsubscribe: () => void = () => {};

const report = (cover: number) => {
  view.height = window.innerHeight - cover;
  view.dispatchEvent(new Event('resize'));
};

describe('the keyboard layout guide on Chrome', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    view = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: view,
    });
    virtualKeyboard = Object.assign(new EventTarget(), {
      overlaysContent: false,
    });
    Object.defineProperty(window.navigator, 'virtualKeyboard', {
      configurable: true,
      value: virtualKeyboard,
    });
    // Under a finger: the keyboard module measures Chrome's visual viewport.
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query === '(pointer: coarse)',
          media: query,
        }) as unknown as MediaQueryList,
    );
    document.body.innerHTML =
      '<input id="a"><button id="pop">Open</button><input id="b">';
    a = document.getElementById('a') as HTMLInputElement;
    b = document.getElementById('b') as HTMLInputElement;
    button = document.getElementById('pop') as HTMLButtonElement;
    seen.length = 0;
    unsubscribe = getKeyboardLayoutGuide(window).subscribe(t => seen.push(t));
  });

  afterEach(() => {
    unsubscribe();
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.innerHTML = '';
    Reflect.deleteProperty(window, 'visualViewport');
    Reflect.deleteProperty(window.navigator, 'virtualKeyboard');
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('rides a keyboard coming up from its report, dated back to Gboard’s start, on Gboard’s slide', () => {
    expect(getKeyboardLayoutGuide(window).profile).toBe('chromium');
    a.focus();
    let reportAt = 0;
    view.addEventListener(
      'resize',
      event => {
        reportAt = event.timeStamp;
      },
      {once: true},
    );
    report(312);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({kind: 'show', to: 312, animated: true});
    expect(seen[0]?.start).toBeCloseTo(
      reportAt - androidKeyboard.showReportLagMs,
      6,
    );
    expect(seen[0]?.curve).toEqual({
      durationMs: androidKeyboard.showMs,
      points: androidKeyboard.showCurve,
    });
  });

  it('rides to the last keyboard’s height for the accessory bar’s report, and the keyboard’s report confirms it', () => {
    a.focus();
    report(312);
    a.blur();
    report(0);
    vi.advanceTimersByTime(1000);
    seen.length = 0;
    b.focus();
    report(48);
    expect(seen.at(-1)).toMatchObject({
      kind: 'show',
      to: 312,
      animated: true,
      predicted: true,
    });
    report(312);
    // Confirmed: no second motion.
    expect(seen).toHaveLength(1);
    expect(getKeyboardLayoutGuide(window).transition.predicted).toBe(false);
  });

  it('rides a hide down from hideAfterBlurMs after our blur, on Gboard’s slide', () => {
    a.focus();
    report(312);
    vi.advanceTimersByTime(1000);
    let blurAt = 0;
    a.addEventListener(
      'focusout',
      event => {
        blurAt = event.timeStamp;
      },
      {once: true},
    );
    a.blur();
    const hide = seen.at(-1);
    expect(hide).toMatchObject({kind: 'hide', to: 0, animated: true});
    expect(hide?.start).toBeCloseTo(
      blurAt + androidKeyboard.hideAfterBlurMs,
      6,
    );
    expect(hide?.curve).toEqual({
      durationMs: androidKeyboard.hideMs,
      points: androidKeyboard.hideCurve,
    });
    // Chrome's report confirms it.
    report(0);
    expect(seen.at(-1)).toBe(hide);
  });

  it('rides a hide nothing predicted (Back) down from its report, dated back to Gboard’s start', () => {
    a.focus();
    report(312);
    vi.advanceTimersByTime(1000);
    let reportAt = 0;
    view.addEventListener(
      'resize',
      event => {
        reportAt = event.timeStamp;
      },
      {once: true},
    );
    report(0);
    expect(seen.at(-1)).toMatchObject({kind: 'hide', to: 0, animated: true});
    expect(seen.at(-1)?.start).toBeCloseTo(
      reportAt - androidKeyboard.hideReportLagMs,
      6,
    );
  });

  it('holds the momentary hide Chrome reports while focus moves to another field', () => {
    a.focus();
    report(360);
    vi.advanceTimersByTime(1000);
    expect(seen.map(t => t.kind)).toEqual(['show']);
    // Through a popover's container to its field: Chrome reports the
    // keyboard gone, then back, within about 50 ms.
    button.focus();
    b.focus();
    vi.advanceTimersByTime(30);
    report(0);
    vi.advanceTimersByTime(15);
    report(360);
    vi.advanceTimersByTime(500);
    expect(seen.map(t => t.kind)).toEqual(['show', 'hide', 'show']);
    expect(getKeyboardLayoutGuide(window).inset).toBe(360);
  });

  it('never touches the page’s VirtualKeyboard', () => {
    a.focus();
    report(312);
    a.blur();
    expect(virtualKeyboard.overlaysContent).toBe(false);
  });
});
