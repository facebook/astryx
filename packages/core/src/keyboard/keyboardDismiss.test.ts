// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardDismiss.test.ts
 * @input vitest, jsdom, observeKeyboardDismiss, a stand-in visual viewport
 * @output Tests the three dismiss modes: interactive dismisses where the
 *   finger reaches the keyboard (less the padding), onDrag when the browser
 *   takes the touch to scroll, none never; touches in the bar or the text
 *   never dismiss
 * @position Unit tests for keyboard/keyboardDismiss.ts
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  observeKeyboardDismiss,
  type KeyboardDismissMode,
} from './keyboardDismiss';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';

type FakeViewport = EventTarget & {
  height: number;
  offsetTop: number;
  scale: number;
};

const COVER = 300;
const PADDING = 60;
// jsdom's layout viewport is 768 px tall: the keyboard's top edge is at 468
// and an interactive dismissal begins 60 px above it.
const TRIGGER = 768 - COVER - PADDING;

let viewport: FakeViewport;
let scroller: HTMLElement;
let field: HTMLTextAreaElement;
let row: HTMLElement;
let stop: () => void = () => {};
let unsubscribe: () => void = () => {};

function touch(
  type: 'touchstart' | 'touchmove' | 'touchend',
  target: Element,
  clientY: number,
  {id = 1, fingers = 1}: {id?: number; fingers?: number} = {},
) {
  const point = {identifier: id, clientY, clientX: 100};
  const event = new Event(type, {bubbles: true});
  Object.assign(event, {
    touches:
      type === 'touchend'
        ? []
        : Array.from({length: fingers}, (_, i) => ({...point, identifier: i})),
    changedTouches: [point],
  });
  target.dispatchEvent(event);
}

function pointer(
  type: 'pointerdown' | 'pointercancel',
  target: Element,
  pointerId: number,
) {
  const event = new Event(type, {bubbles: true});
  Object.assign(event, {pointerId, pointerType: 'touch', isPrimary: true});
  target.dispatchEvent(event);
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
    document.body.innerHTML = '';
  });

  describe('interactive', () => {
    it('dismisses when the finger reaches the keyboard less the padding', () => {
      observe('interactive');
      touch('touchstart', row, 200);
      touch('touchmove', row, TRIGGER - 1);
      expect(document.activeElement).toBe(field);
      touch('touchmove', row, TRIGGER);
      expect(document.activeElement).not.toBe(field);
    });

    it('ignores a touch that starts in the bar on the keyboard', () => {
      observe('interactive');
      touch('touchstart', row, TRIGGER + 10);
      touch('touchmove', row, TRIGGER + 120);
      expect(document.activeElement).toBe(field);
    });

    it('ignores a touch in the focused text (moving the caret, selecting)', () => {
      observe('interactive');
      touch('touchstart', field, 200);
      touch('touchmove', field, TRIGGER + 20);
      expect(document.activeElement).toBe(field);
    });

    it('ignores two fingers', () => {
      observe('interactive');
      touch('touchstart', row, 200, {fingers: 2});
      touch('touchmove', row, TRIGGER + 20);
      expect(document.activeElement).toBe(field);
    });

    it('does nothing while no keyboard covers the page', () => {
      viewport.height = window.innerHeight;
      viewport.dispatchEvent(new Event('resize'));
      observe('interactive');
      touch('touchstart', row, 200);
      touch('touchmove', row, 760);
      expect(document.activeElement).toBe(field);
    });

    it('follows only until the lift', () => {
      observe('interactive');
      touch('touchstart', row, 200);
      touch('touchend', row, 300);
      touch('touchmove', row, TRIGGER + 20);
      expect(document.activeElement).toBe(field);
    });
  });

  describe('onDrag', () => {
    it('dismisses when the browser takes the touch to scroll', () => {
      observe('onDrag');
      pointer('pointerdown', row, 7);
      touch('touchstart', row, 200);
      expect(document.activeElement).toBe(field);
      pointer('pointercancel', row, 7);
      expect(document.activeElement).not.toBe(field);
    });

    it('keeps the keyboard for another pointer and for a move without a scroll', () => {
      observe('onDrag');
      pointer('pointerdown', row, 7);
      touch('touchstart', row, 200);
      touch('touchmove', row, TRIGGER + 20);
      pointer('pointercancel', row, 8);
      expect(document.activeElement).toBe(field);
    });

    it('ignores a drag that starts in the bar on the keyboard', () => {
      observe('onDrag');
      pointer('pointerdown', row, 7);
      touch('touchstart', row, TRIGGER + 10);
      pointer('pointercancel', row, 7);
      expect(document.activeElement).toBe(field);
    });
  });

  it('none leaves the keyboard up', () => {
    observe('none');
    pointer('pointerdown', row, 7);
    touch('touchstart', row, 200);
    touch('touchmove', row, TRIGGER + 20);
    pointer('pointercancel', row, 7);
    expect(document.activeElement).toBe(field);
  });

  it('stops on cleanup', () => {
    observe('interactive');
    stop();
    touch('touchstart', row, 200);
    touch('touchmove', row, TRIGGER + 20);
    expect(document.activeElement).toBe(field);
  });
});
