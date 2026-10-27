// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardLayoutGuide.test.ts
 * @input vitest, jsdom, getKeyboardLayoutGuide, a stand-in visual viewport in
 *   Mobile Safari's profile, a requestAnimationFrame that calls back at once
 * @output Tests the guide's frame watch (the frames it watches from a focus,
 *   to date a show Safari reports late) under a requestAnimationFrame that
 *   calls back synchronously, as test stubs do: one frame, no recursion
 * @position Unit tests for keyboard/keyboardLayoutGuide.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';

describe('the keyboard layout guide\u2019s frame watch', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: Object.assign(new EventTarget(), {
        height: window.innerHeight,
        offsetTop: 0,
        scale: 1,
      }),
    });
    input = document.createElement('input');
    document.body.append(input);
  });

  afterEach(() => {
    input.remove();
    Reflect.deleteProperty(window, 'visualViewport');
    vi.unstubAllGlobals();
  });

  it('watches one frame, and does not recurse, under a requestAnimationFrame that calls back at once', () => {
    // A stub that runs the callback inside the request, as BottomSheet's
    // tests and many apps' do; it stops itself at 50 calls so a loop shows
    // as a count instead of overflowing the stack.
    let calls = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      calls += 1;
      if (calls < 50) {
        callback(0);
      }
      return calls;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const unsubscribe = getKeyboardLayoutGuide(window).subscribe(() => {});
    try {
      // A field that brings up a keyboard takes focus with none up: in
      // Safari's profile the guide watches frames from here.
      input.focus();
      expect(calls).toBe(1);
      // Focus again: the watch starts again, still one frame.
      input.blur();
      input.focus();
      expect(calls).toBe(2);
    } finally {
      unsubscribe();
    }
  });
});
