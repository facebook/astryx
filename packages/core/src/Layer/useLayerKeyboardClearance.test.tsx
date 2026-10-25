// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useLayerKeyboardClearance.test.tsx
 * @input vitest (jsdom), a stand-in keyboard layout guide, and an anchored
 *   layer whose box the test computes from the cap the runtime writes
 * @output Checks the software keyboard's part of the viewport caps: the cap
 *   10 px above the keyboard, written once a rising keyboard has arrived and
 *   taken off as a falling one starts down, a keyboard already up at the open
 *   capped before paint, the field kept in view, a layer clear of the
 *   keyboard, a bottom-held layer and a layer in another positioning left as
 *   they are, the cap held through a press until its click, and the window
 *   listeners held only while a press is down
 * @position Testing; real keyboards are proven by the Popover keyboard
 *   browser spec and on the iOS simulator
 */

import {fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {keyboard} from '../motion/uikit/keyboard';
import type {KeyboardTransition} from '../keyboard';
import {
  keyboardClearanceCap,
  LAYER_KEYBOARD_CAP_PROPERTY,
  LAYER_KEYBOARD_CLEARANCE_PX,
  useLayerKeyboardClearance,
} from './useLayerKeyboardClearance';

const guide = {
  inset: 0,
  listeners: new Set<(transition: KeyboardTransition) => void>(),
  subscribe(listener: (transition: KeyboardTransition) => void) {
    guide.listeners.add(listener);
    return () => {
      guide.listeners.delete(listener);
    };
  },
  emit(transition: Partial<KeyboardTransition>) {
    for (const listener of guide.listeners) {
      listener({
        kind: 'show',
        from: 0,
        to: 0,
        start: performance.now(),
        velocity: 0,
        animated: true,
        predicted: false,
        spring: keyboard.spring,
        ...transition,
      });
    }
  },
};

vi.mock('../keyboard', () => ({
  getKeyboardLayoutGuide: () => guide,
  // The keyboard module's one height.
  getMobileKeyboardHeight: () => guide.inset,
}));

// The layout viewport of an iPhone 17 Pro in Safari, and the cover the
// keyboard, its accessory bar and the toolbar report over it.
const VIEWPORT = 714;
const COVER = 337;
// A tall layer below its trigger: its box at rest.
const BOX = {top: 68, bottom: 509};
const CAPPED = `${VIEWPORT - COVER - 10 - BOX.top}px`;

function Harness({
  isOpen = true,
  isAnchored = true,
  box = BOX,
  focusRow = false,
  heldBottom = false,
  layerKey = 'a',
}: {
  isOpen?: boolean;
  isAnchored?: boolean;
  box?: {top: number; bottom: number};
  focusRow?: boolean;
  heldBottom?: boolean;
  /** A new key replaces the layer element while it stays open. */
  layerKey?: string;
}) {
  const layerRef = useRef<HTMLDivElement>(null);
  const isAnchoredRef = useRef(isAnchored);
  isAnchoredRef.current = isAnchored;
  useLayerKeyboardClearance(isOpen, layerRef, isAnchoredRef);
  // The layer's box: its content height, no taller than the cap the runtime
  // wrote (the runtime's block-size cap folds it in). Below its trigger the
  // top stays; above it the bottom does.
  const height = (el: HTMLElement) => {
    const cap = parseFloat(
      el.style.getPropertyValue(LAYER_KEYBOARD_CAP_PROPERTY),
    );
    const natural = box.bottom - box.top;
    return Number.isNaN(cap) ? natural : Math.min(natural, cap);
  };
  return (
    <div
      key={layerKey}
      data-testid="layer"
      ref={el => {
        layerRef.current = el;
        if (el != null) {
          Object.defineProperty(el, 'offsetHeight', {
            configurable: true,
            get: () => height(el),
          });
          el.getBoundingClientRect = () => {
            const h = height(el);
            const top = heldBottom ? box.bottom - h : box.top;
            return {
              top,
              bottom: top + h,
              left: 0,
              right: 320,
              width: 320,
              height: h,
              x: 0,
              y: top,
              toJSON: () => ({}),
            };
          };
        }
      }}>
      <div
        data-testid="scroller"
        style={{overflowY: 'auto'}}
        ref={el => {
          if (el != null) {
            Object.defineProperty(el, 'scrollHeight', {
              configurable: true,
              get: () => 441,
            });
            Object.defineProperty(el, 'clientHeight', {
              configurable: true,
              get: () => height(layerRef.current ?? el),
            });
            el.getBoundingClientRect = () => {
              const h = height(layerRef.current ?? el);
              return {
                top: box.top,
                bottom: box.top + h,
                left: 0,
                right: 320,
                width: 320,
                height: h,
                x: 0,
                y: box.top,
                toJSON: () => ({}),
              };
            };
          }
        }}>
        <input
          aria-label="Title"
          ref={el => {
            if (el != null && focusRow) {
              el.getBoundingClientRect = () => ({
                top: 420,
                bottom: 444,
                left: 0,
                right: 300,
                width: 300,
                height: 24,
                x: 0,
                y: 420,
                toJSON: () => ({}),
              });
              el.focus();
            }
          }}
        />
      </div>
    </div>
  );
}

const capOf = (container: HTMLElement) =>
  container
    .querySelector<HTMLElement>('[data-testid="layer"]')!
    .style.getPropertyValue(LAYER_KEYBOARD_CAP_PROPERTY);

describe('keyboardClearanceCap', () => {
  it('keeps the far edge 10 pt above the keyboard, and leaves a layer clear of it', () => {
    expect(LAYER_KEYBOARD_CLEARANCE_PX).toBe(10);
    expect(keyboardClearanceCap(BOX, VIEWPORT, COVER)).toBe(
      VIEWPORT - COVER - 10 - BOX.top,
    );
    expect(
      keyboardClearanceCap({top: 68, bottom: 300}, VIEWPORT, COVER),
    ).toBeNull();
    expect(keyboardClearanceCap(BOX, VIEWPORT, 0)).toBeNull();
    expect(keyboardClearanceCap({top: 400, bottom: 600}, VIEWPORT, COVER)).toBe(
      0,
    );
  });
});

describe('useLayerKeyboardClearance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    guide.inset = 0;
    guide.listeners.clear();
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: VIEWPORT,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('caps a layer once a rising keyboard has arrived', () => {
    const {container} = render(<Harness />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    // On its way up the keyboard covers the difference.
    expect(capOf(container)).toBe('');
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    expect(capOf(container)).toBe(CAPPED);
  });

  it('takes the cap off as soon as the keyboard starts down', () => {
    const {container} = render(<Harness />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    guide.emit({kind: 'hide', from: COVER, to: 0});
    expect(capOf(container)).toBe('');
  });

  it('follows a keyboard that changes at once, at once', () => {
    const {container} = render(<Harness />);
    guide.emit({kind: 'change', from: 0, to: 300, animated: false});
    expect(capOf(container)).toBe(`${VIEWPORT - 300 - 10 - BOX.top}px`);
  });

  it('leaves a layer clear of the keyboard as it is', () => {
    const {container} = render(<Harness box={{top: 68, bottom: 300}} />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    expect(capOf(container)).toBe('');
  });

  it('leaves a layer in another positioning as it is', () => {
    const {container} = render(<Harness isAnchored={false} />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    expect(capOf(container)).toBe('');
  });

  it('keeps the field being typed into in view in the layer\u2019s scroll container', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 0;
    });
    const {container} = render(<Harness focusRow />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    const scroller = container.querySelector<HTMLElement>(
      '[data-testid="scroller"]',
    )!;
    // The box ends at 714 - 337 - 10 = 367; the field's bottom is at 444.
    expect(scroller.scrollTop).toBe(444 - 367);
  });

  it('caps a layer opened while a keyboard is up in the frame before it paints, and takes the cap off when it closes', () => {
    guide.inset = COVER;
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      frames.push(callback);
      return frames.length;
    });
    const {container, rerender} = render(<Harness />);
    // The commit sees the layer unplaced; the next frame places it.
    expect(capOf(container)).toBe('');
    for (const frame of frames.splice(0)) {
      frame(0);
    }
    expect(capOf(container)).toBe(CAPPED);
    rerender(<Harness isOpen={false} />);
    expect(capOf(container)).toBe('');
    expect(guide.listeners.size).toBe(0);
  });

  it('keeps the cap when the runtime replaces the layer element while it is open', () => {
    const {container, rerender} = render(<Harness />);
    guide.emit({kind: 'change', from: 0, to: COVER, animated: false});
    const before = container.querySelector<HTMLElement>(
      '[data-testid="layer"]',
    )!;
    expect(capOf(container)).toBe(CAPPED);
    guide.inset = COVER;
    rerender(<Harness layerKey="b" />);
    const after = container.querySelector<HTMLElement>(
      '[data-testid="layer"]',
    )!;
    expect(after).not.toBe(before);
    expect(capOf(container)).toBe(CAPPED);
    // The keyboard going down takes the cap off the new element.
    guide.emit({kind: 'hide', from: COVER, to: 0, animated: false});
    expect(capOf(container)).toBe('');
  });

  it('follows a press in a replaced layer element to its click', () => {
    const {container, rerender} = render(<Harness />);
    guide.inset = COVER;
    guide.emit({kind: 'change', from: 0, to: COVER, animated: false});
    rerender(<Harness layerKey="b" />);
    const layer = container.querySelector<HTMLElement>(
      '[data-testid="layer"]',
    )!;
    fireEvent.pointerDown(layer, {pointerId: 1});
    guide.emit({kind: 'hide', from: COVER, to: 0});
    // Held for the press's click.
    expect(capOf(container)).toBe(CAPPED);
    fireEvent.pointerUp(layer, {pointerId: 1});
    fireEvent.click(layer);
    expect(capOf(container)).toBe('');
  });

  it('writes nothing but its own cap on the layer', () => {
    const {container} = render(<Harness />);
    const layer = container.querySelector<HTMLElement>(
      '[data-testid="layer"]',
    )!;
    guide.emit({kind: 'change', from: 0, to: COVER, animated: false});
    expect(layer.style.length).toBe(1);
    expect(layer.style.item(0)).toBe(LAYER_KEYBOARD_CAP_PROPERTY);
  });

  it('leaves a layer whose bottom the fallback order holds (above its trigger) as it is', () => {
    const {container} = render(
      <Harness box={{top: 16, bottom: 505}} heldBottom />,
    );
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    // A shorter box would move its top down and still end under the keyboard.
    expect(capOf(container)).toBe('');
  });

  it('keeps the cap through a press inside the layer until its click', () => {
    const {container, getByTestId} = render(<Harness />);
    const layer = getByTestId('layer');
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    expect(capOf(container)).toBe(CAPPED);
    // A tap on a button in the layer blurs the field: the keyboard starts
    // down while the finger is still on the button.
    fireEvent.pointerDown(layer, {pointerId: 3});
    guide.emit({kind: 'hide', from: COVER, to: 0});
    expect(capOf(container)).toBe(CAPPED);
    fireEvent.pointerUp(window, {pointerId: 3});
    expect(capOf(container)).toBe(CAPPED);
    fireEvent.click(layer);
    expect(capOf(container)).toBe('');
  });

  it('a press that makes no click lets the change go a moment after it lifts', () => {
    const {container, getByTestId} = render(<Harness />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    fireEvent.pointerDown(getByTestId('layer'), {pointerId: 4});
    guide.emit({kind: 'hide', from: COVER, to: 0});
    fireEvent.pointerUp(window, {pointerId: 4});
    vi.advanceTimersByTime(400);
    expect(capOf(container)).toBe('');
  });

  it('a rising keyboard after the layer closed changes nothing', () => {
    const {container, rerender} = render(<Harness />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    rerender(<Harness isOpen={false} />);
    vi.advanceTimersByTime(keyboard.notificationMs + 1);
    expect(capOf(container)).toBe('');
  });

  it('follows a press to its click only while a press in the layer is live', () => {
    const added: string[] = [];
    const removed: string[] = [];
    const add = window.addEventListener.bind(window);
    const remove = window.removeEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        added.push(type);
        add(type, listener, options);
      },
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type, listener, options) => {
        removed.push(type);
        remove(type, listener, options);
      },
    );
    const {getByTestId} = render(<Harness />);
    const press = (types: string[]) =>
      types.filter(type =>
        ['pointerup', 'pointercancel', 'click'].includes(type),
      );
    // Open: nothing on the window yet.
    expect(press(added)).toEqual([]);
    const layer = getByTestId('layer');
    fireEvent.pointerDown(layer, {pointerId: 1});
    expect(press(added)).toEqual(['pointerup', 'pointercancel', 'click']);
    fireEvent.pointerUp(layer, {pointerId: 1});
    fireEvent.click(layer);
    expect(press(removed)).toEqual(['pointerup', 'pointercancel', 'click']);
  });
});
