// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollEdgeEffect.test.tsx
 * @input vitest (jsdom), React Testing Library, a recording
 *   IntersectionObserver and a recording animator
 * @output Checks the scroll edge effect's decisions: it observes the sentinel
 *   against its own document (or the given scroll container), puts the first
 *   report in place without a fade, fades in on UIKit's appear spring and out
 *   on its disappear spring when a finger drives the scroll, switches at once
 *   for a scroll the program drives (the WebKit workaround), watches finger
 *   scrolls (useFingerScroll) only while it runs, ignores repeated reports, and stops observing
 *   (transparent again) when disabled or under a mouse
 * @position Testing; validates useScrollEdgeEffect.ts. The fade itself (the
 *   compositor curve, the 10 pt switch on a real page) is proven by
 *   AppShell/__tests__/AppShellScrollEdge.interaction.browser.spec.ts
 */

import {act, render, screen} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {bars, registerBarsTable} from '../motion/uikit/bars';
import {useScrollEdgeEffect} from './useScrollEdgeEffect';

const animator = {
  set: vi.fn(),
  animate: vi.fn(),
};

vi.mock('../motion/useAnimator', () => ({
  useAnimator: () => ({ref: () => {}, animator}),
}));

/** The touch presentation the hook sees: a finger unless a test says otherwise. */
const pointer = {isTouch: true};
vi.mock('../utils/touchPresentation', () => ({
  useTouchPresentation: () => ({
    isTouch: pointer.isTouch,
    isCompact: true,
    isCompactTouch: pointer.isTouch,
  }),
}));

/**
 * The shared finger-scroll reader (useFingerScroll, over the gesture host):
 * what the hook asks it to watch, and whether the scroll now moving is a
 * finger's.
 */
const host = {
  isFinger: true,
  watched: [] as unknown[],
};
/** useFingerScroll's reader is stable across renders, as the real one. */
const readFingerScroll = () => host.isFinger;
vi.mock('../gestures/useFingerScroll', () => ({
  useFingerScroll: (scroller: unknown) => {
    host.watched.push(scroller);
    return readFingerScroll;
  },
}));

/** The node the hook last asked useFingerScroll to watch, if any. */
function watchedNode(): Document | Element | null {
  const last = host.watched.at(-1) as
    Document | {current: Element | null} | undefined;
  return last instanceof Document ? last : (last?.current ?? null);
}

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
  readonly unobserved: Element[] = [];
  unobserve(target: Element) {
    this.unobserved.push(target);
  }
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
  pointer.isTouch = true;
  host.isFinger = true;
  host.watched = [];
  RecordingObserver.instances = [];
  animator.set.mockClear();
  animator.animate.mockClear();
  vi.stubGlobal('IntersectionObserver', RecordingObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

let renders = 0;

function Bar({
  enabled,
  inContainer = false,
  sentinelKey = 'a',
}: {
  enabled: boolean;
  inContainer?: boolean;
  sentinelKey?: string;
}) {
  renders += 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const {layerRef, sentinelRef} = useScrollEdgeEffect({
    enabled,
    root: inContainer ? containerRef : undefined,
    springs: bars.scrollEdgeEffect,
    registerSprings: registerBarsTable,
  });
  return (
    <div ref={containerRef} data-testid="container">
      <div ref={layerRef} />
      <div key={sentinelKey} ref={sentinelRef} data-testid="sentinel" />
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

  it('fades in on the appear spring and out on the disappear spring under a finger', () => {
    render(<Bar enabled />);
    observer().report(true);
    observer().report(false);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 1},
      {spring: bars.scrollEdgeEffect.appear},
    );
    // Back before the fade ended: the animator turns it around.
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

  // The WebKit workaround: a fade starting as a programmatic scroll crosses
  // the switch blanks the sticky bar's items on iOS 26.2.
  it('switches at once, without a fade, for a scroll the program drives', () => {
    host.isFinger = false;
    render(<Bar enabled />);
    observer().report(true);
    observer().report(false);
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 1});
    observer().report(true);
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 0});
    expect(animator.animate).not.toHaveBeenCalled();
  });

  it('fades for a finger and switches for the program within one page', () => {
    render(<Bar enabled />);
    observer().report(true);
    // A finger scrolls the content under the bar…
    observer().report(false);
    expect(animator.animate).toHaveBeenCalledTimes(1);
    // …and a status-bar tap brings it back.
    host.isFinger = false;
    observer().report(true);
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 0});
    expect(animator.animate).toHaveBeenCalledTimes(1);
  });

  it('watches the page’s finger scrolls, or the scroll container’s', () => {
    const {unmount} = render(<Bar enabled />);
    expect(watchedNode()).toBe(document);
    unmount();
    render(<Bar enabled inContainer />);
    expect(watchedNode()).toBe(screen.getByTestId('container'));
  });

  // architecture:react-component-runtime INV1 / INV6: the sentinel lives in
  // a ref, not React state.
  it('attaches the sentinel without re-rendering the host', () => {
    renders = 0;
    render(<Bar enabled />);
    expect(renders).toBe(1);
    expect(observer().observed).toEqual([screen.getByTestId('sentinel')]);
  });

  it('moves the observer to a replacement sentinel node', () => {
    const {rerender} = render(<Bar enabled />);
    const first = screen.getByTestId('sentinel');
    const instance = observer();
    rerender(<Bar enabled sentinelKey="b" />);
    const second = screen.getByTestId('sentinel');
    expect(second).not.toBe(first);
    expect(instance.unobserved).toContain(first);
    expect(instance.observed.at(-1)).toBe(second);
    expect(RecordingObserver.instances.at(-1)).toBe(instance);
  });

  it('observes nothing with a mouse', () => {
    pointer.isTouch = false;
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    render(<Bar enabled />);
    expect(RecordingObserver.instances).toHaveLength(0);
    // Nothing is watched: a mouse costs no touch work.
    expect(watchedNode()).toBeNull();
    expect(animator.animate).not.toHaveBeenCalled();
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
    expect(watchedNode()).toBeNull();
    expect(animator.set).toHaveBeenLastCalledWith({opacity: 0});
  });

  it('does nothing where IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(() => render(<Bar enabled />)).not.toThrow();
    expect(animator.set).not.toHaveBeenCalled();
  });
});
