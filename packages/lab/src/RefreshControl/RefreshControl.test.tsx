// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RefreshControl.test.tsx
 * @input vitest (jsdom), RefreshControl, touch events dispatched on its
 *   content, a stand-in for a touch screen (matchMedia)
 * @output Covers what the component adds to useRefreshControl: the hidden
 *   indicator and its title, the busy state across a pull that triggers, and
 *   the props it passes to the pulled content (the behavior itself is
 *   useRefreshControl.test.tsx)
 * @position Testing; colocated with RefreshControl.tsx. Motion itself is
 *   checked in a real browser (RefreshControl.browser test and storyboards)
 */

import {
  act,
  isInaccessible,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {RefreshControl} from './RefreshControl';

const COARSE = /\(\s*pointer\s*:\s*coarse\s*\)/;
let originalMatchMedia: typeof window.matchMedia;
let originalInnerHeight: number;

function useTouchScreen(isTouch: boolean): void {
  window.matchMedia = (query: string) =>
    ({
      matches: isTouch && COARSE.test(query),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

let clock = 0;
function touch(
  type: string,
  target: EventTarget,
  y: number,
  isLift = false,
): void {
  clock += 16;
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: 1, clientX: 100, clientY: y, target};
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {value: isLift ? [] : [entry]});
  Object.defineProperty(event, 'timeStamp', {value: clock});
  act(() => {
    target.dispatchEvent(event);
  });
}

/** A one-finger drag from y 100 down by each step in turn. */
function pull(target: EventTarget, steps: number[], lift = true): void {
  let y = 100;
  touch('touchstart', target, y);
  for (const step of steps) {
    y += step;
    touch('touchmove', target, y);
  }
  if (lift) {
    touch('touchend', target, y, true);
  }
}

function translateY(element: HTMLElement): number {
  const value = element.style.getPropertyValue('translate');
  if (value === '' || value === 'none') {
    return 0;
  }
  const parts = value.trim().split(/\s+/);
  return parseFloat(parts[1] ?? '0');
}

function content(): HTMLElement {
  return screen.getByTestId('refresh');
}

describe('RefreshControl', () => {
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    originalInnerHeight = window.innerHeight;
    useTouchScreen(true);
    // The page as tall as the scroll view UIKit's frames were measured on:
    // the trigger distance is then UIKit's floor, 73 px of overscroll.
    Object.defineProperty(window, 'innerHeight', {
      value: 334,
      configurable: true,
    });
    clock = 0;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      configurable: true,
    });
    document.documentElement.style.overscrollBehaviorY = '';
  });

  it('renders its content, a decorative indicator and the title as a status line, with no busy state at rest', () => {
    render(
      <RefreshControl
        data-testid="refresh"
        onRefresh={() => {}}
        title="Updated now">
        <p>Inbox</p>
      </RefreshControl>,
    );
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(content()).not.toHaveAttribute('aria-busy');
    // The title reaches assistive technology as a status line, so a new one
    // (after a refresh) is announced.
    const status = within(content()).getByRole('status');
    expect(status).toHaveTextContent('Updated now');
    // The spinner beside it is decoration, hidden from assistive technology.
    const spinner = status.previousElementSibling as HTMLElement;
    expect(spinner.childElementCount).toBeGreaterThan(0);
    expect(isInaccessible(spinner)).toBe(true);
    expect(isInaccessible(status)).toBe(false);
  });

  it('has no status line without a title, and its indicator stays hidden', () => {
    render(
      <RefreshControl data-testid="refresh" onRefresh={() => {}}>
        <p>Inbox</p>
      </RefreshControl>,
    );
    expect(within(content()).queryByRole('status')).toBeNull();
    const indicator = content().lastElementChild as HTMLElement;
    for (const node of indicator.querySelectorAll('span')) {
      expect(isInaccessible(node)).toBe(true);
    }
  });

  it('triggers with the finger still down, then settles onto the refreshing inset', async () => {
    const onRefresh = vi.fn(() => new Promise<void>(() => {}));
    render(
      <RefreshControl data-testid="refresh" onRefresh={onRefresh}>
        <p>Inbox</p>
      </RefreshControl>,
    );
    pull(content(), [20, 20, 20, 20], false);
    expect(onRefresh).not.toHaveBeenCalled();
    // 105 px of travel: past the trigger (73 px of overscroll).
    touch('touchmove', content(), 205);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(content()).toHaveAttribute('aria-busy', 'true');
    expect(translateY(content())).toBeGreaterThan(74);
    expect(translateY(content())).toBeLessThan(95);
    // The next frame snaps to one to one with the finger, as UIKit does.
    touch('touchmove', content(), 210);
    expect(translateY(content())).toBeCloseTo(100, 5);
    touch('touchend', content(), 210, true);
    // The settle starts in the next frame; jsdom has no compositor, so it
    // lands on its target at once.
    await waitFor(() => expect(translateY(content())).toBeCloseTo(60, 5));
    await waitFor(() => expect(document.body).toHaveTextContent('Refreshing'));
  });

  it('passes its ref, className and other props to the pulled content', () => {
    const ref = {current: null as HTMLDivElement | null};
    render(
      <RefreshControl
        ref={ref}
        className="feed"
        data-testid="refresh"
        onRefresh={() => {}}>
        <p>Inbox</p>
      </RefreshControl>,
    );
    expect(ref.current).toBe(content());
    expect(content()).toHaveClass('feed');
    expect(content()).toHaveClass('astryx-refresh-control');
  });
});
