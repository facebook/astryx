// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useKeyboardLayoutGuide.test.tsx
 * @input vitest, Testing Library, useKeyboardLayoutGuide, a stand-in visual
 *   viewport
 * @output Tests the hook: it returns the window's guide, calls the latest
 *   listener with each transition, and stops listening on unmount
 * @position Unit tests for keyboard/useKeyboardLayoutGuide.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, render} from '@testing-library/react';
import {useKeyboardLayoutGuide} from './useKeyboardLayoutGuide';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';
import type {KeyboardTransition} from './keyboardModel';

type FakeViewport = EventTarget & {
  height: number;
  offsetTop: number;
  scale: number;
};
let viewport: FakeViewport;

function report(height: number) {
  viewport.height = height;
  act(() => {
    viewport.dispatchEvent(new Event('resize'));
  });
}

function Probe({
  onTransition,
}: {
  onTransition: (t: KeyboardTransition) => void;
}) {
  const guide = useKeyboardLayoutGuide(onTransition);
  return <span data-testid="probe">{guide == null ? 'none' : 'guide'}</span>;
}

describe('useKeyboardLayoutGuide', () => {
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
  });

  it('returns the window guide and calls the latest listener with each transition', () => {
    const first = vi.fn();
    const second = vi.fn();
    const {rerender, getByTestId} = render(<Probe onTransition={first} />);
    expect(getByTestId('probe').textContent).toBe('guide');
    rerender(<Probe onTransition={second} />);
    report(window.innerHeight - 300);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(
      expect.objectContaining({kind: 'show', to: 300}),
    );
    expect(getKeyboardLayoutGuide(window).inset).toBe(300);
  });

  it('stops listening on unmount', () => {
    const listener = vi.fn();
    const {unmount} = render(<Probe onTransition={listener} />);
    unmount();
    report(window.innerHeight - 300);
    expect(listener).not.toHaveBeenCalled();
  });
});
