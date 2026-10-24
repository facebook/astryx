// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file usePopoverKeyboardAvoidance.test.tsx
 * @input vitest (jsdom), Testing Library, usePopoverKeyboardAvoidance and a
 *   stand-in keyboard layout guide
 * @output Checks the height a popover takes to stay above the software
 *   keyboard (UIKit's 10 pt), when it takes it (once the rising keyboard has
 *   arrived, at once for a falling or instant one), that its content scrolls
 *   and keeps the focused field in view, that a popover clear of the keyboard
 *   is left alone, and that closing restores it
 * @position Testing; Mobile Safari is proven on the iOS simulator and the
 *   browser behavior in __tests__/PopoverKeyboard.interaction.browser.spec.ts
 */

import {render} from '@testing-library/react';
import React, {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {popover, timing} from '../motion/uikit';
import type {KeyboardTransition} from '../keyboard';
import {
  keyboardAvoidingHeight,
  usePopoverKeyboardAvoidance,
} from './usePopoverKeyboardAvoidance';

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
        ...transition,
      });
    }
  },
};

vi.mock('../keyboard', () => ({
  getKeyboardLayoutGuide: () => guide,
}));

// The layout viewport of an iPhone 17 Pro in Safari, and the cover the
// keyboard, its accessory bar and the toolbar report over it.
const VIEWPORT = 714;
const COVER = 337;
// A tall popover below its trigger: its box at rest.
const BOX = {top: 68, bottom: 509};

function Harness({
  isOpen = true,
  box = BOX,
  focusRow = false,
}: {
  isOpen?: boolean;
  box?: {top: number; bottom: number};
  focusRow?: boolean;
}) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  usePopoverKeyboardAvoidance(isOpen, surfaceRef);
  return (
    <div
      data-testid="surface"
      ref={el => {
        surfaceRef.current = el;
        if (el != null) {
          el.getBoundingClientRect = () => {
            const max = parseFloat(el.style.maxBlockSize);
            const bottom = Number.isNaN(max)
              ? box.bottom
              : Math.min(box.bottom, box.top + max);
            return {
              top: box.top,
              bottom,
              left: 0,
              right: 320,
              width: 320,
              height: bottom - box.top,
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
  );
}

describe('keyboardAvoidingHeight', () => {
  it('keeps the far edge 10 pt above the keyboard, and leaves a popover clear of it', () => {
    expect(popover.keyboardClearancePx).toBe(10);
    expect(keyboardAvoidingHeight(BOX, VIEWPORT, COVER)).toBe(
      VIEWPORT - COVER - 10 - BOX.top,
    );
    expect(
      keyboardAvoidingHeight({top: 68, bottom: 300}, VIEWPORT, COVER),
    ).toBeNull();
    expect(keyboardAvoidingHeight(BOX, VIEWPORT, 0)).toBeNull();
    expect(
      keyboardAvoidingHeight({top: 400, bottom: 600}, VIEWPORT, COVER),
    ).toBe(0);
  });
});

describe('usePopoverKeyboardAvoidance', () => {
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
  });

  const surfaceOf = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('[data-testid="surface"]')!;

  it('shrinks to stay above a rising keyboard once the keyboard has arrived', () => {
    const {container} = render(<Harness />);
    const surface = surfaceOf(container);
    guide.emit({kind: 'show', from: 0, to: COVER});
    // On its way up the keyboard covers the difference.
    expect(surface.style.maxBlockSize).toBe('');
    vi.advanceTimersByTime(timing.keyboardNotificationMs + 1);
    expect(surface.style.maxBlockSize).toBe(
      `${VIEWPORT - COVER - 10 - BOX.top}px`,
    );
    expect(surface.style.overflowY).toBe('auto');
  });

  it('grows back as soon as the keyboard starts down', () => {
    const {container} = render(<Harness />);
    const surface = surfaceOf(container);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(timing.keyboardNotificationMs + 1);
    guide.emit({kind: 'hide', from: COVER, to: 0});
    expect(surface.style.maxBlockSize).toBe('');
    expect(surface.style.overflowY).toBe('');
  });

  it('follows a keyboard that changes at once, at once', () => {
    const {container} = render(<Harness />);
    guide.emit({kind: 'change', from: 0, to: 300, animated: false});
    expect(surfaceOf(container).style.maxBlockSize).toBe(
      `${VIEWPORT - 300 - 10 - BOX.top}px`,
    );
  });

  it('leaves a popover clear of the keyboard as it is', () => {
    const {container} = render(<Harness box={{top: 68, bottom: 300}} />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(timing.keyboardNotificationMs + 1);
    expect(surfaceOf(container).style.maxBlockSize).toBe('');
  });

  it('keeps the field being typed into in view inside the shorter box', () => {
    const {container} = render(<Harness focusRow />);
    const surface = surfaceOf(container);
    guide.emit({kind: 'show', from: 0, to: COVER});
    vi.advanceTimersByTime(timing.keyboardNotificationMs + 1);
    // The box ends at 714 - 337 - 10 = 367; the field's bottom is at 444.
    expect(surface.scrollTop).toBe(444 - 367);
  });

  it('avoids a keyboard that is already up when it opens, and restores itself when it closes', () => {
    guide.inset = COVER;
    const {container, rerender} = render(<Harness />);
    const surface = surfaceOf(container);
    expect(surface.style.maxBlockSize).toBe(
      `${VIEWPORT - COVER - 10 - BOX.top}px`,
    );
    rerender(<Harness isOpen={false} />);
    expect(surface.style.maxBlockSize).toBe('');
    expect(guide.listeners.size).toBe(0);
  });

  it('a rising keyboard after the popover closed changes nothing', () => {
    const {container, rerender} = render(<Harness />);
    guide.emit({kind: 'show', from: 0, to: COVER});
    rerender(<Harness isOpen={false} />);
    vi.advanceTimersByTime(timing.keyboardNotificationMs + 1);
    expect(surfaceOf(container).style.maxBlockSize).toBe('');
  });
});
