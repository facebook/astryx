// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file actionGroupTracker.test.ts
 * @input vitest (jsdom), createActionGroupTracker over actions laid out with
 *   stubbed rects
 * @output The tracker's contract, driven directly as a recognizer elsewhere
 *   would drive it: begin highlights the action under the point and reads
 *   layout only then; move follows the finger and cuts (not fades) the action
 *   it leaves; end fades and runs only the action under the finger, once;
 *   cancel and an inert press run nothing; disabled actions are skipped;
 *   several roots are one group; offsetBy shifts the cached rects; the
 *   highlight callback and the opt-out of the paint
 * @position jsdom tests of packages/core/src/hooks/actionGroupTracker.ts; the
 *   hook binding is covered by useActionGroupTracking.test.tsx
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {PRESSED_ATTRIBUTE} from '../utils/pressFeedback';
import {PRESS_FADE_MS} from '../utils/pressGesture';
import {
  createActionGroupTracker,
  type ActionGroupTrackerOptions,
} from './actionGroupTracker';

function place(
  element: Element,
  box: {left: number; top: number; width: number; height: number},
) {
  const rect = DOMRect.fromRect({
    x: box.left,
    y: box.top,
    width: box.width,
    height: box.height,
  });
  const spy = vi.fn(() => rect);
  element.getBoundingClientRect = spy;
  return spy;
}

function action(label: string, box: Parameters<typeof place>[1]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.setAttribute('data-action', '');
  const rectSpy = place(button, box);
  const onClick = vi.fn();
  button.addEventListener('click', onClick);
  return {button, onClick, rectSpy};
}

let root: HTMLDivElement;
let first: ReturnType<typeof action>;
let second: ReturnType<typeof action>;

beforeEach(() => {
  vi.useFakeTimers();
  root = document.createElement('div');
  first = action('First', {left: 0, top: 0, width: 200, height: 40});
  second = action('Second', {left: 0, top: 50, width: 200, height: 40});
  root.append(first.button, second.button);
  document.body.append(root);
});

afterEach(() => {
  root.remove();
  vi.useRealTimers();
});

function tracker(options: Partial<ActionGroupTrackerOptions> = {}) {
  return createActionGroupTracker(() => ({
    roots: () => [root],
    itemSelector: '[data-action]',
    highlightExpansion: 0,
    ...options,
  }));
}

describe('createActionGroupTracker', () => {
  it('begin highlights the action under the point and reads layout only then', () => {
    const group = tracker();
    group.begin(100, 20);
    expect(group.highlighted).toBe(first.button);
    expect(first.button.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    group.move(100, 25);
    group.move(100, 70);
    group.move(100, 72);
    expect(first.rectSpy).toHaveBeenCalledTimes(1);
    expect(second.rectSpy).toHaveBeenCalledTimes(1);
  });

  it('move follows the finger: the action it leaves is cut, not faded', () => {
    const group = tracker();
    group.begin(100, 20);
    group.move(100, 70);
    expect(first.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    expect(second.button.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    // Between the actions nothing is highlighted.
    group.move(100, 45);
    expect(group.highlighted).toBeNull();
    expect(second.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('end fades the action under the finger and runs it once, from inside the call', () => {
    const group = tracker();
    group.begin(100, 20);
    group.move(100, 70);
    expect(group.end()).toBe(second.button);
    expect(second.onClick).toHaveBeenCalledTimes(1);
    expect(first.onClick).not.toHaveBeenCalled();
    expect(second.button.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    vi.advanceTimersByTime(PRESS_FADE_MS);
    expect(second.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    // A second end has nothing to run.
    expect(group.end()).toBeNull();
    expect(second.onClick).toHaveBeenCalledTimes(1);
  });

  it('a lift with no action under the finger runs nothing', () => {
    const group = tracker();
    group.begin(100, 20);
    group.move(100, 200);
    expect(group.end()).toBeNull();
    expect(first.onClick).not.toHaveBeenCalled();
  });

  it('cancel cuts the highlight, reports it gone and runs nothing', () => {
    const onHighlightChange = vi.fn<(item: HTMLElement | null) => void>();
    const group = tracker({onHighlightChange});
    group.begin(100, 20);
    group.cancel();
    expect(onHighlightChange).toHaveBeenLastCalledWith(null);
    expect(first.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    expect(group.isTracking).toBe(false);
    expect(group.end()).toBeNull();
    expect(first.onClick).not.toHaveBeenCalled();
  });

  it('an inert press is taken but paints and runs nothing', () => {
    const group = tracker();
    group.begin(100, 20, {inert: true});
    expect(group.isTracking).toBe(true);
    expect(group.highlighted).toBeNull();
    expect(first.rectSpy).not.toHaveBeenCalled();
    group.move(100, 70);
    expect(group.end()).toBeNull();
    expect(first.onClick).not.toHaveBeenCalled();
    expect(second.onClick).not.toHaveBeenCalled();
  });

  it('skips disabled actions', () => {
    second.button.disabled = true;
    const group = tracker();
    group.begin(100, 70);
    expect(group.highlighted).toBeNull();
    expect(group.end()).toBeNull();
  });

  it('tracks the actions of several roots as one group', () => {
    const flyout = document.createElement('div');
    const third = action('Third', {left: 220, top: 0, width: 200, height: 40});
    flyout.append(third.button);
    document.body.append(flyout);
    const group = tracker({roots: () => [root, flyout]});
    group.begin(100, 20);
    group.move(300, 20);
    expect(group.highlighted).toBe(third.button);
    group.end();
    expect(third.onClick).toHaveBeenCalledTimes(1);
    flyout.remove();
  });

  it('offsetBy shifts the cached rects when the content moves under a still finger', () => {
    const group = tracker();
    group.begin(100, 20);
    // The list scrolled up by 50: the second action is now under the finger.
    group.offsetBy(0, -50);
    group.move(100, 20);
    expect(group.highlighted).toBe(second.button);
    expect(second.rectSpy).toHaveBeenCalledTimes(1);
  });

  it('reports highlight changes, and can leave the paint to its owner', () => {
    const onHighlightChange = vi.fn<(item: HTMLElement | null) => void>();
    const onActivate = vi.fn();
    const group = tracker({
      paintsHighlight: false,
      onHighlightChange,
      onActivate,
    });
    group.begin(100, 20);
    group.move(100, 70);
    group.end();
    // The lift leaves the highlight to the activation: no change reported.
    expect(onHighlightChange.mock.calls.map(([item]) => item)).toEqual([
      first.button,
      second.button,
    ]);
    expect(first.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    expect(second.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    // onActivate replaces the action's own click.
    expect(onActivate).toHaveBeenCalledWith(second.button);
    expect(second.onClick).not.toHaveBeenCalled();
  });

  it('a press that begins while another is tracked takes the paint off the first one', () => {
    const onHighlightChange = vi.fn<(item: HTMLElement | null) => void>();
    const group = tracker({onHighlightChange});
    group.begin(100, 20);
    expect(first.button.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    // A second recognizer takes over the finger without an end or a cancel.
    group.begin(100, 70);
    expect(first.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    expect(second.button.getAttribute(PRESSED_ATTRIBUTE)).toBe('on');
    // Taken over onto nothing: the highlight is gone, and the owner is told.
    group.begin(100, 200);
    expect(second.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    expect(onHighlightChange.mock.calls.map(([item]) => item)).toEqual([
      first.button,
      second.button,
      null,
    ]);
  });

  it('dispose finishes a pending release fade', () => {
    const group = tracker();
    group.begin(100, 20);
    group.end();
    expect(first.button.getAttribute(PRESSED_ATTRIBUTE)).toBe('fading');
    group.dispose();
    expect(first.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
    vi.advanceTimersByTime(PRESS_FADE_MS);
    expect(first.button.hasAttribute(PRESSED_ATTRIBUTE)).toBe(false);
  });

  it('expands each action\u2019s hit area by the given margin', () => {
    const group = tracker({highlightExpansion: 6});
    group.begin(100, 44);
    expect(group.highlighted).toBe(first.button);
  });
});
