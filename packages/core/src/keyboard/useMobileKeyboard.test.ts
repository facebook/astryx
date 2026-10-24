// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useMobileKeyboard.test.ts
 * @input useMobileKeyboard.ts, the keyboard layout guide, a stand-in visual
 *   viewport
 * @output Tests for the on-screen keyboard module (spec:AST-099): the height
 *   (FR2), where it measures (FR6, FR7), its one set of listeners (FR1,
 *   architecture:react-component-runtime INV11) and the focus refusal (FR4)
 * @position Keyboard module tests
 */

import fs from 'node:fs';
import path from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, renderHook} from '@testing-library/react';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';
import {
  claimTapFocus,
  getMobileKeyboardHeight,
  isKeyboardMeasurable,
  measureKeyboardHeight,
  refuseFocusReveal,
  subscribeMobileKeyboard,
  useKeyboardHeight,
} from './useMobileKeyboard';

type FakeViewport = EventTarget & {
  height: number;
  offsetTop: number;
  scale: number;
};

let viewport: FakeViewport;

function report(changes: Partial<FakeViewport>) {
  Object.assign(viewport, changes);
  act(() => {
    viewport.dispatchEvent(new Event('resize'));
  });
}

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
});

afterEach(() => {
  Reflect.deleteProperty(window, 'visualViewport');
  Reflect.deleteProperty(window.navigator, 'virtualKeyboard');
  vi.restoreAllMocks();
});

describe('the keyboard height (spec:AST-099 FR2)', () => {
  it('is the layout viewport minus the visual viewport', () => {
    viewport.height = window.innerHeight - 300;
    expect(measureKeyboardHeight(window)).toBe(300);
  });

  it('is not made smaller by a page pan', () => {
    viewport.height = window.innerHeight - 300;
    viewport.offsetTop = 120;
    expect(measureKeyboardHeight(window)).toBe(300);
  });

  it('is 0 while pinch-zoomed with no keyboard, and the keyboard with one', () => {
    viewport.scale = 2;
    viewport.height = window.innerHeight / 2;
    expect(measureKeyboardHeight(window)).toBe(0);
    viewport.height = (window.innerHeight - 300) / 2;
    expect(measureKeyboardHeight(window)).toBe(300);
  });

  it('is 0 with no keyboard shown', () => {
    expect(measureKeyboardHeight(window)).toBe(0);
  });
});

describe('where the keyboard is measured (FR6, FR7)', () => {
  it('measures with a visual viewport and no keyboard geometry API', () => {
    expect(isKeyboardMeasurable(window)).toBe(true);
  });

  it('measures nothing where the platform has its own keyboard geometry API', () => {
    Object.defineProperty(window.navigator, 'virtualKeyboard', {
      configurable: true,
      value: {overlaysContent: false},
    });
    viewport.height = window.innerHeight - 300;
    expect(isKeyboardMeasurable(window)).toBe(false);
    expect(measureKeyboardHeight(window)).toBe(0);
  });

  it('measures nothing without a visual viewport', () => {
    Reflect.deleteProperty(window, 'visualViewport');
    expect(measureKeyboardHeight(window)).toBe(0);
  });

  it('measures nothing inside an iframe', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    const inner = frame.contentWindow as Window;
    Object.defineProperty(inner, 'visualViewport', {
      configurable: true,
      value: Object.assign(new EventTarget(), {
        height: inner.innerHeight - 300,
        offsetTop: 0,
        scale: 1,
      }),
    });
    expect(isKeyboardMeasurable(inner)).toBe(false);
    expect(measureKeyboardHeight(inner)).toBe(0);
    frame.remove();
  });
});

describe('one set of listeners per window (FR1, INV11)', () => {
  it('shares the listeners among subscribers and removes them with the last', () => {
    const add = vi.spyOn(viewport, 'addEventListener');
    const remove = vi.spyOn(viewport, 'removeEventListener');
    const first = vi.fn();
    const second = vi.fn();
    const stopFirst = subscribeMobileKeyboard(window, first);
    const stopSecond = subscribeMobileKeyboard(window, second);
    expect(add.mock.calls.map(([type]) => type)).toEqual(['resize', 'scroll']);

    report({height: window.innerHeight - 300});
    expect(first).toHaveBeenLastCalledWith(
      expect.objectContaining({type: 'viewport', height: 300}),
    );
    expect(second).toHaveBeenLastCalledWith(
      expect.objectContaining({type: 'viewport', height: 300}),
    );

    stopFirst();
    expect(remove).not.toHaveBeenCalled();
    stopSecond();
    expect(remove.mock.calls.map(([type]) => type)).toEqual([
      'resize',
      'scroll',
    ]);
  });

  it('feeds the keyboard layout guide, which adds no listener of its own', () => {
    const add = vi.spyOn(viewport, 'addEventListener');
    const windowAdd = vi.spyOn(window, 'addEventListener');
    const stopHook = subscribeMobileKeyboard(window, () => {});
    const guide = getKeyboardLayoutGuide(window);
    const transitions: number[] = [];
    const stopGuide = guide.subscribe(transition => {
      transitions.push(transition.to);
    });
    expect(add).toHaveBeenCalledTimes(2);
    expect(
      windowAdd.mock.calls.filter(([type]) => type === 'resize'),
    ).toHaveLength(1);

    report({height: window.innerHeight - 300});
    expect(transitions.at(-1)).toBe(300);
    expect(guide.inset).toBe(300);
    stopGuide();
    stopHook();
  });

  it('re-renders a component when the height changes, and only then', () => {
    let renders = 0;
    const {result, unmount} = renderHook(() => {
      renders += 1;
      return useKeyboardHeight();
    });
    expect(result.current).toBe(0);
    const before = renders;
    report({offsetTop: 10});
    expect(renders).toBe(before);
    report({height: window.innerHeight - 300});
    expect(result.current).toBe(300);
    expect(getMobileKeyboardHeight(window)).toBe(300);
    unmount();
  });

  it('leaves no listener once every component has unmounted, StrictMode replay included', () => {
    const remove = vi.spyOn(viewport, 'removeEventListener');
    const {unmount} = renderHook(() => useKeyboardHeight(), {
      reactStrictMode: true,
    });
    unmount();
    const removed = remove.mock.calls.map(([type]) => type);
    expect(removed.filter(type => type === 'resize').length).toBeGreaterThan(0);
    // Every add was matched by a remove.
    const add = vi.spyOn(viewport, 'addEventListener');
    const stop = subscribeMobileKeyboard(window, () => {});
    expect(add).toHaveBeenCalledTimes(2);
    stop();
  });

  it('is the only visual viewport listener for the keyboard in core', () => {
    // Visible-viewport readers that place layers and scroll areas, not the
    // keyboard; the layer cap's keyboard is architecture:layer-runtime's.
    const visibleViewportReaders = new Set([
      'DropdownMenu/useMenuOverflow.ts',
      'Popover/Popover.tsx',
      'hooks/useScrollableArea.ts',
    ]);
    const root = path.resolve(__dirname, '..');
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(file);
          continue;
        }
        if (
          !/\.tsx?$/.test(entry.name) ||
          /\.(test|spec|stories)\./.test(entry.name)
        ) {
          continue;
        }
        const relative = path.relative(root, file).split(path.sep).join('/');
        const source = fs.readFileSync(file, 'utf8');
        if (
          /visualViewport\??\.addEventListener|viewport\??\.addEventListener\(\s*'(resize|scroll)'/.test(
            source,
          ) &&
          relative !== 'keyboard/useMobileKeyboard.ts' &&
          !visibleViewportReaders.has(relative)
        ) {
          offenders.push(relative);
        }
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });
});

describe('the focus refusal (FR4)', () => {
  it('delivers a claimed focus move with preventScroll and parks focus that leaves for nothing', () => {
    const first = document.createElement('input');
    const second = document.createElement('input');
    const park = vi.fn();
    document.body.append(first, second);
    const stop = refuseFocusReveal(document, {
      claim: target => (target === second ? second : null),
      park,
    });
    const focus = vi.spyOn(second, 'focus');
    first.focus();
    second.focus();
    expect(focus).toHaveBeenCalledWith({preventScroll: true});
    second.blur();
    expect(park).toHaveBeenCalledWith(second);
    stop();
    first.remove();
    second.remove();
  });
});

describe('the tap route (FR4)', () => {
  // A touch event as the browser raises it: its fingers, and cancelable.
  const touchEvent = (
    type: string,
    points: {x: number; y: number}[],
    changed = points,
  ) => {
    const event = new Event(type, {bubbles: true, cancelable: true});
    const list = (ps: {x: number; y: number}[]) =>
      ps.map((p, identifier) => ({identifier, clientX: p.x, clientY: p.y}));
    Object.assign(event, {
      touches: list(points),
      changedTouches: list(changed),
    });
    return event;
  };

  function setup() {
    const region = document.createElement('div');
    const field = document.createElement('div');
    region.append(field);
    document.body.append(region);
    const deliver = vi.fn();
    const stop = claimTapFocus(region, {
      claim: target => (target === field ? field : null),
      deliver,
    });
    return {region, field, deliver, stop};
  }

  it('delivers a tap on a claimed field itself, and cancels the browser\u2019s', () => {
    const {region, field, deliver, stop} = setup();
    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    const end = touchEvent('touchend', [], [{x: 12, y: 11}]);
    field.dispatchEvent(end);
    expect(end.defaultPrevented).toBe(true);
    expect(deliver).toHaveBeenCalledWith(field, 12, 11);
    stop();
    region.remove();
  });

  it('leaves a touch that moves past the scroll slop, or a second finger, to the browser', () => {
    const {region, field, deliver, stop} = setup();
    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchmove', [{x: 10, y: 30}]));
    const moved = touchEvent('touchend', [], [{x: 10, y: 30}]);
    field.dispatchEvent(moved);
    expect(moved.defaultPrevented).toBe(false);

    field.dispatchEvent(
      touchEvent('touchstart', [
        {x: 10, y: 10},
        {x: 40, y: 10},
      ]),
    );
    const pinch = touchEvent('touchend', [], [{x: 10, y: 10}]);
    field.dispatchEvent(pinch);
    expect(pinch.defaultPrevented).toBe(false);
    expect(deliver).not.toHaveBeenCalled();
    stop();
    region.remove();
  });

  it('listens on the region only, and follows a touch only while it is down', () => {
    const {region, field, stop} = setup();
    const add = vi.spyOn(region, 'addEventListener');
    const remove = vi.spyOn(region, 'removeEventListener');
    const documentAdd = vi.spyOn(document, 'addEventListener');
    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    expect(add.mock.calls.map(([type]) => type)).toEqual([
      'touchmove',
      'touchend',
      'touchcancel',
    ]);
    field.dispatchEvent(touchEvent('touchend', [], [{x: 10, y: 10}]));
    expect(remove.mock.calls.map(([type]) => type)).toEqual([
      'touchmove',
      'touchend',
      'touchcancel',
    ]);
    expect(documentAdd).not.toHaveBeenCalled();
    stop();
    region.remove();
  });

  it('leaves a touch outside what the caller claims to the browser', () => {
    const {region, deliver, stop} = setup();
    region.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    const end = touchEvent('touchend', [], [{x: 10, y: 10}]);
    region.dispatchEvent(end);
    expect(end.defaultPrevented).toBe(false);
    expect(deliver).not.toHaveBeenCalled();
    stop();
    region.remove();
  });
});
