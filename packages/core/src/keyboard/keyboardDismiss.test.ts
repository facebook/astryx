// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardDismiss.test.ts
 * @input vitest, jsdom, observeKeyboardDismiss, a stand-in visual viewport,
 *   touch streams with explicit timestamps
 * @output Tests the interactive mode's one decision at the release
 *   (spec:AST-094 FR36, FR37): a slow drag that lifts past the line where the
 *   keyboard (less the padding) begins dismisses, a lift short of it keeps
 *   it, a flick that lifts above it keeps it however fast, a fast drag that
 *   lifts past it dismisses (UIKit's interactive dismissal), a release moving back up
 *   cancels, a cancelled touch decides nothing, and no move decides; touches
 *   in the bar or the text, two fingers and a hardware keyboard never
 *   dismiss; `none` never does
 * @position Unit tests for keyboard/keyboardDismiss.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  observeKeyboardDismiss,
  type KeyboardDismissMode,
} from './keyboardDismiss';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';

type FakeViewport = EventTarget & {
  height: number;
  offsetTop: number;
  scale: number;
  width?: number;
};

const COVER = 300;
const PADDING = 60;
// jsdom's layout viewport is 768 px tall: the keyboard's top edge is at 468
// and an interactive dismissal commits 60 px above it.
const TRIGGER = 768 - COVER - PADDING;
// Longer than the velocity tracker's stillness (40 ms): a lift after it
// releases at 0, so the finger's own position decides.
const REST_MS = 100;

let viewport: FakeViewport;
let scroller: HTMLElement;
let field: HTMLTextAreaElement;
let row: HTMLElement;
let stop: () => void = () => {};
let unsubscribe: () => void = () => {};

function touch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  target: Element,
  clientY: number,
  time: number,
  {id = 1, fingers = 1}: {id?: number; fingers?: number} = {},
) {
  const point = {identifier: id, clientY, clientX: 100};
  const event = new Event(type, {bubbles: true});
  Object.assign(event, {
    touches:
      type === 'touchend' || type === 'touchcancel'
        ? []
        : Array.from({length: fingers}, (_, i) => ({...point, identifier: i})),
    changedTouches: [point],
  });
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
}

// A drag at one sample per 60 Hz frame from `from` to `to`, starting at
// `start`: returns the time of the last sample.
function drag(
  target: Element,
  from: number,
  to: number,
  {start = 0, pxPerFrame = 8}: {start?: number; pxPerFrame?: number} = {},
): number {
  touch('touchstart', target, from, start);
  const steps = Math.max(1, Math.ceil(Math.abs(to - from) / pxPerFrame));
  let time = start;
  for (let i = 1; i <= steps; i++) {
    time = start + i * 16;
    touch('touchmove', target, from + ((to - from) * i) / steps, time);
  }
  return time;
}

function observe(mode: KeyboardDismissMode) {
  stop = observeKeyboardDismiss(scroller, {
    mode,
    dismissPadding: () => PADDING,
  });
}

function showKeyboard() {
  viewport.height = window.innerHeight - COVER;
  viewport.dispatchEvent(new Event('resize'));
}

describe('observeKeyboardDismiss', () => {
  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    document.body.innerHTML =
      '<div id="scroller"><div id="row">message</div><textarea id="field"></textarea></div>';
    scroller = document.getElementById('scroller')!;
    row = document.getElementById('row')!;
    field = document.getElementById('field') as HTMLTextAreaElement;
    // Mobile Safari's reports (keyboard/keyboardModel.ts): iOS is the browser
    // that supports -webkit-touch-callout.
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: {
        supports: (property: string) => property === '-webkit-touch-callout',
      },
    });
    // The guide listens while something subscribes.
    unsubscribe = getKeyboardLayoutGuide(window).subscribe(() => {});
    field.focus();
    showKeyboard();
  });

  afterEach(() => {
    stop();
    unsubscribe();
    viewport.height = window.innerHeight;
    viewport.dispatchEvent(new Event('resize'));
    Reflect.deleteProperty(window, 'visualViewport');
    Reflect.deleteProperty(window, 'CSS');
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  describe('interactive: one decision, at the release (spec:AST-094 FR36, FR37)', () => {
    it('dismisses when a slow drag lifts past the line, and not on the move that crosses it', () => {
      observe('interactive');
      const last = drag(row, 200, TRIGGER + 20);
      // The move crossed the line: nothing is decided until the lift.
      expect(document.activeElement).toBe(field);
      touch('touchend', row, TRIGGER + 20, last + 8);
      expect(document.activeElement).not.toBe(field);
    });

    it('keeps the keyboard when the finger lifts at rest short of the line', () => {
      observe('interactive');
      const last = drag(row, 200, TRIGGER - 1);
      touch('touchend', row, TRIGGER - 1, last + REST_MS);
      expect(document.activeElement).toBe(field);
    });

    it('dismisses when the finger lifts at rest on the line', () => {
      observe('interactive');
      const last = drag(row, 200, TRIGGER);
      touch('touchend', row, TRIGGER, last + REST_MS);
      expect(document.activeElement).not.toBe(field);
    });

    it('keeps the keyboard for a flick that lifts above the line, however fast', () => {
      // In UIKit the keyboard never moves until the finger reaches it, so a
      // fast flick that lifts above it never dismisses it.
      observe('interactive');
      // 1.5 px/ms down at the lift, 10 px above the line.
      const last = drag(row, 100, TRIGGER - 10, {pxPerFrame: 24});
      touch('touchend', row, TRIGGER - 10, last + 4);
      expect(document.activeElement).toBe(field);
    });

    it('dismisses a fast drag that lifts just past the line', () => {
      observe('interactive');
      const last = drag(row, 100, TRIGGER + 20, {pxPerFrame: 24});
      touch('touchend', row, TRIGGER + 20, last + 4);
      expect(document.activeElement).not.toBe(field);
    });

    it('cancels a release moving back up, however far the finger went (FR37)', () => {
      observe('interactive');
      let last = drag(row, 200, TRIGGER + 80);
      for (let y = TRIGGER + 72; y >= TRIGGER + 40; y -= 8) {
        last += 16;
        touch('touchmove', row, y, last);
      }
      touch('touchend', row, TRIGGER + 40, last + 8);
      expect(document.activeElement).toBe(field);
    });

    it('decides nothing for a touch the browser cancels', () => {
      observe('interactive');
      const last = drag(row, 200, TRIGGER + 20);
      touch('touchcancel', row, TRIGGER + 20, last + 8);
      expect(document.activeElement).toBe(field);
    });

    it('commits at the line on a page WebKit pinch-zooms', () => {
      // WebKit reports innerWidth and innerHeight in the zoomed visual
      // viewport's px (spec:AST-099 FR2); clientY stays in layout px. At 2x
      // innerHeight alone would put the line 384 px too high.
      vi.stubGlobal('innerHeight', 384);
      vi.stubGlobal('innerWidth', 512);
      Object.assign(viewport, {
        scale: 2,
        width: 512,
        height: (768 - COVER) / 2,
      });
      viewport.dispatchEvent(new Event('resize'));
      observe('interactive');
      let last = drag(row, 200, TRIGGER - 1);
      touch('touchend', row, TRIGGER - 1, last + REST_MS);
      expect(document.activeElement).toBe(field);
      last = drag(row, 200, TRIGGER, {start: last + 1000});
      touch('touchend', row, TRIGGER, last + REST_MS);
      expect(document.activeElement).not.toBe(field);
    });

    it('ignores a touch that starts in the bar on the keyboard', () => {
      observe('interactive');
      const last = drag(row, TRIGGER + 10, TRIGGER + 120);
      touch('touchend', row, TRIGGER + 120, last + 8);
      expect(document.activeElement).toBe(field);
    });

    it('ignores a touch in the focused text (moving the caret, selecting)', () => {
      observe('interactive');
      const last = drag(field, 200, TRIGGER + 20);
      touch('touchend', field, TRIGGER + 20, last + 8);
      expect(document.activeElement).toBe(field);
    });

    it('ignores two fingers', () => {
      observe('interactive');
      touch('touchstart', row, 200, 0, {fingers: 2});
      touch('touchmove', row, TRIGGER + 20, 16);
      touch('touchend', row, TRIGGER + 20, 24);
      expect(document.activeElement).toBe(field);
    });

    it('does nothing while no keyboard covers the page (a hardware keyboard)', () => {
      viewport.height = window.innerHeight;
      viewport.dispatchEvent(new Event('resize'));
      observe('interactive');
      const last = drag(row, 200, 760);
      touch('touchend', row, 760, last + 8);
      expect(document.activeElement).toBe(field);
    });
  });

  it('none leaves the keyboard up', () => {
    observe('none');
    const last = drag(row, 200, TRIGGER + 20);
    touch('touchend', row, TRIGGER + 20, last + 8);
    expect(document.activeElement).toBe(field);
  });

  it('stops on cleanup', () => {
    observe('interactive');
    stop();
    const last = drag(row, 200, TRIGGER + 20);
    touch('touchend', row, TRIGGER + 20, last + 8);
    expect(document.activeElement).toBe(field);
  });
});
