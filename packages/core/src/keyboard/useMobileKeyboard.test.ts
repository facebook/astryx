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
import {layoutViewportHeight} from '../utils/layoutViewport';
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
  width?: number;
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
  Reflect.deleteProperty(document.documentElement, 'clientWidth');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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

describe('the layout viewport WebKit reports under a pinch zoom (FR2)', () => {
  // Measured in Safari on iOS 26.2 (iPhone 17 Pro, a 402 × 714 layout
  // viewport, a 337 px keyboard): WebKit reports innerWidth and innerHeight in
  // the zoomed visual viewport's px, while the visual viewport's height times
  // its scale stays in layout px.
  function safari({
    innerHeight,
    innerWidth,
    height,
    scale,
    offsetTop = 0,
  }: {
    innerHeight: number;
    innerWidth: number;
    height: number;
    scale: number;
    offsetTop?: number;
  }) {
    vi.stubGlobal('innerHeight', innerHeight);
    vi.stubGlobal('innerWidth', innerWidth);
    // The visual viewport is the 402 px layout width over the zoom.
    Object.assign(viewport, {height, scale, offsetTop, width: 402 / scale});
  }

  it('reads the keyboard at scale 1', () => {
    safari({innerHeight: 714, innerWidth: 402, height: 377, scale: 1});
    expect(measureKeyboardHeight(window)).toBe(337);
    expect(layoutViewportHeight(window)).toBe(714);
  });

  it('reads the same keyboard pinch-zoomed to 1.33', () => {
    safari({innerHeight: 536, innerWidth: 302, height: 282.75, scale: 4 / 3});
    expect(Math.abs(measureKeyboardHeight(window) - 337)).toBeLessThan(1);
  });

  it('follows the layout viewport WebKit clamps to the document after a scroll', () => {
    safari({
      innerHeight: 666,
      innerWidth: 402,
      height: 377,
      scale: 1,
      offsetTop: 120,
    });
    expect(measureKeyboardHeight(window)).toBe(289);
  });

  it('reads the same keyboard scrolled and pinch-zoomed', () => {
    safari({
      innerHeight: 536,
      innerWidth: 302,
      height: 282.75,
      scale: 4 / 3,
      offsetTop: 154.5,
    });
    expect(Math.abs(measureKeyboardHeight(window) - 337)).toBeLessThan(1);
  });

  it('keeps the keyboard past a 2x zoom, where innerHeight alone reads none', () => {
    safari({innerHeight: 357, innerWidth: 201, height: 188.5, scale: 2});
    expect(measureKeyboardHeight(window)).toBe(337);
  });

  it('reads no keyboard pinch-zoomed with none, in WebKit and where innerHeight ignores the zoom', () => {
    safari({innerHeight: 536, innerWidth: 302, height: 536, scale: 4 / 3});
    expect(measureKeyboardHeight(window)).toBe(0);
    safari({innerHeight: 714, innerWidth: 402, height: 535.5, scale: 4 / 3});
    expect(measureKeyboardHeight(window)).toBe(0);
  });

  it('reads no keyboard beside a classic scrollbar', () => {
    // A desktop page with a 17 px vertical scrollbar, which innerWidth and
    // not the document's client width or the visual viewport counts.
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('innerWidth', 1280);
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1263,
    });
    Object.assign(viewport, {height: 800, scale: 1, width: 1263});
    expect(layoutViewportHeight(window)).toBe(800);
    expect(measureKeyboardHeight(window)).toBe(0);
  });
});

describe('where the keyboard is measured (FR6, FR7)', () => {
  it('measures with a visual viewport and no keyboard geometry API', () => {
    expect(isKeyboardMeasurable(window)).toBe(true);
  });

  it('measures nothing under a mouse where the browser has its own keyboard geometry API', () => {
    Object.defineProperty(window.navigator, 'virtualKeyboard', {
      configurable: true,
      value: {overlaysContent: false},
    });
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({matches: false, media: query}) as unknown as MediaQueryList,
    );
    viewport.height = window.innerHeight - 300;
    expect(isKeyboardMeasurable(window)).toBe(false);
    expect(measureKeyboardHeight(window)).toBe(0);
  });

  it('measures Chrome on Android from its visual viewport, under a finger (FR8, DEC-4)', () => {
    Object.defineProperty(window.navigator, 'virtualKeyboard', {
      configurable: true,
      value: {overlaysContent: false},
    });
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query === '(pointer: coarse)',
          media: query,
        }) as unknown as MediaQueryList,
    );
    viewport.height = window.innerHeight - 312;
    expect(isKeyboardMeasurable(window)).toBe(true);
    expect(measureKeyboardHeight(window)).toBe(312);
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

  it('reads a keyboard that is already up when the first component mounts', () => {
    // Nothing listens yet: the keyboard came up before any keyboard-aware
    // component mounted (a sheet opened from a focused field).
    viewport.height = window.innerHeight - 300;
    const {result, unmount} = renderHook(() => useKeyboardHeight());
    expect(result.current).toBe(300);
    const guide = getKeyboardLayoutGuide(window);
    const stopGuide = guide.subscribe(() => {});
    expect(guide.inset).toBe(300);
    report({height: window.innerHeight});
    expect(result.current).toBe(0);
    stopGuide();
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
    // The only document listeners: after the tap, until its click or a new
    // press, the swallower of the mouse events Safari may still send.
    expect(documentAdd.mock.calls.map(([type]) => type)).toEqual([
      'mousedown',
      'mouseup',
      'click',
      'touchstart',
      'pointerdown',
      'keydown',
    ]);
    stop();
    region.remove();
  });

  it('swallows the mouse events Safari still sends for a delivered tap, wherever they land, until its click', () => {
    const {region, field, deliver, stop} = setup();
    const elsewhere = document.createElement('button');
    document.body.append(elsewhere);
    const pressed = vi.fn();
    elsewhere.addEventListener('mousedown', pressed);
    elsewhere.addEventListener('click', pressed);
    // Safari's events for a tap carry its click count.
    const mouse = (type: string) => {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        detail: 1,
      });
      elsewhere.dispatchEvent(event);
      return event;
    };
    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchend', [], [{x: 12, y: 11}]));
    expect(deliver).toHaveBeenCalledTimes(1);
    // Aimed at what is under the finger now.
    expect(mouse('mousedown').defaultPrevented).toBe(true);
    expect(mouse('click').defaultPrevented).toBe(true);
    expect(pressed).not.toHaveBeenCalled();
    // The tap's click ends it.
    expect(mouse('click').defaultPrevented).toBe(false);
    expect(pressed).toHaveBeenCalledTimes(1);
    stop();
    elsewhere.remove();
    region.remove();
  });

  it('lets go when no click comes and a new touch or pointer press starts', () => {
    const {region, field, stop} = setup();
    const mousedown = () => {
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        detail: 1,
      });
      document.body.dispatchEvent(event);
      return event.defaultPrevented;
    };
    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchend', [], [{x: 10, y: 10}]));
    // A new touch anywhere.
    document.body.dispatchEvent(touchEvent('touchstart', [{x: 300, y: 300}]));
    expect(mousedown()).toBe(false);

    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchend', [], [{x: 10, y: 10}]));
    // A mouse's own press.
    document.body.dispatchEvent(new Event('pointerdown', {bubbles: true}));
    expect(mousedown()).toBe(false);

    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchend', [], [{x: 10, y: 10}]));
    // A key, whose own click (detail 0) goes through.
    document.body.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true}));
    expect(mousedown()).toBe(false);
    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchend', [], [{x: 10, y: 10}]));
    const keyClick = new MouseEvent('click', {bubbles: true, cancelable: true});
    document.body.dispatchEvent(keyClick);
    expect(keyClick.defaultPrevented).toBe(false);

    field.dispatchEvent(touchEvent('touchstart', [{x: 10, y: 10}]));
    field.dispatchEvent(touchEvent('touchend', [], [{x: 10, y: 10}]));
    // And when the route goes.
    stop();
    expect(mousedown()).toBe(false);
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
