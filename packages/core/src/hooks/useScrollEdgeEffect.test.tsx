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
import {coarsePrimaryPointer} from '../gestures/__tests__/harness';
import {bars, registerBarsTable} from '../motion/uikit/bars';
import {useScrollEdgeEffect} from './useScrollEdgeEffect';

const animator = {
  set: vi.fn(),
  animate: vi.fn(),
  /** The layer, where a test attaches it (the mocked ref attaches nothing). */
  element: null as HTMLElement | null,
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

/** A touch event on `target` from finger 1 (down for touchstart). */
function touch(type: 'touchstart' | 'touchend', target: Element) {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const finger = {identifier: 1, clientX: 10, clientY: 10, target};
  Object.defineProperty(event, 'changedTouches', {value: [finger]});
  Object.defineProperty(event, 'touches', {
    value: type === 'touchstart' ? [finger] : [],
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

beforeEach(() => {
  animator.element = null;
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
      <div ref={layerRef} data-testid="layer" />
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
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
    expect(animator.animate).not.toHaveBeenCalled();
  });

  it('shows the effect at once when the page loads scrolled', () => {
    render(<Bar enabled />);
    observer().report(false);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 1},
      {promote: false},
    );
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
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 1},
      {promote: false},
    );
    observer().report(true);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
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
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
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

  // The WebKit workaround (the file header): the layer is composited only
  // while a finger works the scroller, and the program's switch writes no
  // compositing layer.
  it('a scroll the program drives switches the layer without promotion', () => {
    host.isFinger = false;
    render(<Bar enabled />);
    observer().report(true);
    observer().report(false);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 1},
      {promote: false},
    );
    expect(animator.animate).not.toHaveBeenCalled();
  });

  // The shared gesture host listens only where the primary pointer is
  // coarse (spec:AST-094 FR19, FR24); jsdom has no matchMedia.
  describe('under a coarse primary pointer', () => {
    let restorePointer: () => void = () => {};
    beforeEach(() => {
      restorePointer = coarsePrimaryPointer();
    });
    afterEach(() => {
      restorePointer();
    });

    it('in a scroll container, a finger’s landing composites the layer until it lifts', () => {
      host.isFinger = false;
      const {getByTestId} = render(<Bar enabled inContainer />);
      const layer = getByTestId('layer');
      animator.element = layer;
      const promotion = () =>
        layer.style.getPropertyValue('--_scroll-edge-will-change');
      expect(promotion()).toBe('');
      touch('touchstart', getByTestId('sentinel'));
      expect(promotion()).toBe('opacity');
      touch('touchend', getByTestId('sentinel'));
      expect(promotion()).toBe('');
    });

    it('keeps the layer composited through the finger’s momentum, until its scroll ends', async () => {
      const {getByTestId} = render(<Bar enabled inContainer />);
      const layer = getByTestId('layer');
      animator.element = layer;
      const promotion = () =>
        layer.style.getPropertyValue('--_scroll-edge-will-change');
      touch('touchstart', getByTestId('sentinel'));
      // Lifted while its scroll still moves (useFingerScroll still reads it).
      touch('touchend', getByTestId('sentinel'));
      expect(promotion()).toBe('opacity');
      host.isFinger = false;
      document.dispatchEvent(new Event('scrollend'));
      await Promise.resolve();
      expect(promotion()).toBe('');
    });
  });

  it('with a mouse a finger never composites the layer', () => {
    pointer.isTouch = false;
    const restorePointer = coarsePrimaryPointer();
    try {
      const {getByTestId} = render(<Bar enabled inContainer />);
      const layer = getByTestId('layer');
      animator.element = layer;
      touch('touchstart', getByTestId('sentinel'));
      expect(layer.style.getPropertyValue('--_scroll-edge-will-change')).toBe(
        '',
      );
      touch('touchend', getByTestId('sentinel'));
    } finally {
      restorePointer();
    }
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
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
  });

  it('does nothing where IntersectionObserver is missing', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(() => render(<Bar enabled />)).not.toThrow();
    expect(animator.set).not.toHaveBeenCalled();
  });
});

describe('the internal motion entry', () => {
  // Lab reaches the effect and its table only through
  // `@astryxdesign/core/internal/motion` (architecture:react-component-runtime
  // INV13), by name, as the same values Core imports by path.
  it('re-exports the effect and the bars table by name', async () => {
    const entry: Record<string, unknown> = await import('../internal/motion');
    expect(entry.useScrollEdgeEffect).toBe(useScrollEdgeEffect);
    expect(entry.bars).toBe(bars);
    expect(entry.registerBarsTable).toBe(registerBarsTable);
  });
});
