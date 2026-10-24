// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollEdgeEffect.test.tsx
 * @input vitest (jsdom), React Testing Library, a recording
 *   IntersectionObserver and a recording animator
 * @output Checks the scroll edge effect's decisions: it observes the sentinel
 *   against its own document (or the given scroll container), puts the first
 *   report in place without a fade, fades in on UIKit's appear spring and out
 *   on its disappear spring when the sentinel leaves and re-enters, ignores
 *   repeated reports, and stops observing (transparent again) when disabled
 * @position Testing; validates useScrollEdgeEffect.ts. The fade itself (the
 *   compositor curve, the 10 pt switch on a real page) is proven by
 *   AppShell/__tests__/AppShellScrollEdge.interaction.browser.spec.ts
 */

import {act, render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {bars} from '../motion/uikit/bars';
import {useScrollEdgeEffect} from './useScrollEdgeEffect';

const animator = {
  set: vi.fn(),
  animate: vi.fn(),
};

vi.mock('../motion/useAnimator', () => ({
  useAnimator: () => ({ref: () => {}, animator}),
}));

class RecordingObserver {
  static instances: RecordingObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;
  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit = {},
  ) {
    RecordingObserver.instances.push(this);
  }
  observe(target: Element) {
    this.observed.push(target);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  /** Reports the sentinel intersecting its root (true) or gone (false). */
  report(isIntersecting: boolean) {
    act(() => {
      this.callback(
        [{isIntersecting} as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    });
  }
}

beforeEach(() => {
  RecordingObserver.instances = [];
  animator.set.mockClear();
  animator.animate.mockClear();
  vi.stubGlobal('IntersectionObserver', RecordingObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function Bar({
  enabled,
  inContainer = false,
}: {
  enabled: boolean;
  inContainer?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {layerRef, sentinelRef} = useScrollEdgeEffect({
    enabled,
    root: inContainer ? containerRef : undefined,
  });
  return (
    <div ref={containerRef} data-testid="container">
      <div ref={layerRef} />
      <div ref={sentinelRef} data-testid="sentinel" />
    </div>
  );
}

const observer = () => {
  const instance = RecordingObserver.instances.at(-1);
  if (instance == null) {
    throw new Error('no observer');
  }
  return instance;
};

describe('useScrollEdgeEffect', () => {
  it('observes the sentinel against its own document, at threshold 0', () => {
    const {getByTestId} = render(<Bar enabled />);
    expect(observer().observed).toEqual([getByTestId('sentinel')]);
    expect(observer().options.root).toBe(document);
    expect(observer().options.threshold).toBe(0);
  });

  it('observes against the scroll container when given one', () => {
    const {getByTestId} = render(<Bar enabled inContainer />);
    expect(observer().options.root).toBe(getByTestId('container'));
  });

  it('puts the first report in place without a fade', () => {
    render(<Bar enabled />);
    observer().report(true);
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 0});
    expect(animator.animate).not.toHaveBeenCalled();
  });

  it('shows the effect at once when the page loads scrolled', () => {
    render(<Bar enabled />);
    observer().report(false);
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 1});
    expect(animator.animate).not.toHaveBeenCalled();
  });

  it('fades in on the appear spring and out on the disappear spring', () => {
    render(<Bar enabled />);
    observer().report(true);
    observer().report(false);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 1},
      {spring: bars.scrollEdgeEffect.appear},
    );
    observer().report(true);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 0},
      {spring: bars.scrollEdgeEffect.disappear},
    );
    expect(animator.animate).toHaveBeenCalledTimes(2);
  });

  it('ignores a report that changes nothing', () => {
    render(<Bar enabled />);
    observer().report(true);
    observer().report(false);
    observer().report(false);
    expect(animator.animate).toHaveBeenCalledTimes(1);
  });

  it('observes nothing while disabled', () => {
    render(<Bar enabled={false} />);
    expect(RecordingObserver.instances).toHaveLength(0);
  });

  it('stops observing and turns transparent when disabled', () => {
    const {rerender} = render(<Bar enabled />);
    const first = observer();
    first.report(false);
    rerender(<Bar enabled={false} />);
    expect(first.disconnected).toBe(true);
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 0});
  });

  it('does nothing where IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(() => render(<Bar enabled />)).not.toThrow();
    expect(animator.set).not.toHaveBeenCalled();
  });
});
