// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useScrollEdgeEffect.test.tsx
 * @input vitest (jsdom), React Testing Library, a recording
 *   IntersectionObserver and a recording animator
 * @output Checks the scroll edge effect's decisions: it registers the springs
 *   it was handed before observing, observes the sentinel
 *   against its own document (or the given scroll container, less the
 *   inset of a bar that overlays it), hands out decorative layer and
 *   sentinel props (the veil sized by `edge`, in the given colour or the
 *   body's), puts the first
 *   report in place without a fade, fades in on UIKit's appear spring and out
 *   on its disappear spring when a finger drives the scroll, and the same
 *   when a wheel or trackpad does (a scroll within 100 ms of a wheel over
 *   the scroller, until its scrollend or a quiet spell; never a ctrl-wheel,
 *   a wheel outside the container, or a wheel that scrolls nothing; the
 *   layer composited only through it; a passive listener only while the
 *   effect runs), switches at once
 *   for a scroll the program drives (the WebKit workaround), measures a
 *   scroll container's root once and observes from its padding edge in every
 *   engine, watches finger
 *   scrolls (useFingerScroll) only while it runs, ignores repeated reports, and stops observing
 *   (transparent again) when disabled or under a mouse; and the veil's
 *   literals follow the constants table
 * @position Testing; validates useScrollEdgeEffect.ts. The fade itself (the
 *   compositor curve, the 10 pt switch on a real page) is proven by
 *   AppShell/__tests__/AppShellScrollEdge.interaction.browser.spec.ts
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {act, cleanup, render, screen} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {coarsePrimaryPointer} from '../gestures/__tests__/harness';
import {getGestureHost} from '../gestures/GestureHost';
import {bars, registerBarsTable} from './uikit/bars';
import {useScrollEdgeEffect} from './useScrollEdgeEffect';

const testStyles = stylex.create({
  staticSentinel: {
    insetBlockStart: 'auto',
    insetInlineStart: 'auto',
  },
});

const animator = {
  set: vi.fn(),
  animate: vi.fn(),
  /** The layer, where a test attaches it (the mocked ref attaches nothing). */
  element: null as HTMLElement | null,
};

vi.mock('./useAnimator', () => ({
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
  /**
   * Reports the sentinel intersecting its root (true) or gone (false), with
   * the root rectangle's top when given (the engine's, margin applied).
   */
  report(isIntersecting: boolean, rootTop?: number) {
    act(() => {
      this.callback(
        [
          {
            isIntersecting,
            rootBounds:
              rootTop == null ? null : ({top: rootTop} as DOMRectReadOnly),
          } as IntersectionObserverEntry,
        ],
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

/**
 * Takes `onscrollend` off the window, as in a browser that sends no
 * `scrollend`; returns the restore.
 */
function withoutScrollEnd(): () => void {
  const own = Object.getOwnPropertyDescriptor(window, 'onscrollend');
  const proto = Object.getPrototypeOf(window) as object;
  const inherited = Object.getOwnPropertyDescriptor(proto, 'onscrollend');
  Reflect.deleteProperty(window, 'onscrollend');
  Reflect.deleteProperty(proto, 'onscrollend');
  expect('onscrollend' in window).toBe(false);
  return () => {
    if (inherited != null) {
      Object.defineProperty(proto, 'onscrollend', inherited);
    }
    if (own != null) {
      Object.defineProperty(window, 'onscrollend', own);
    }
  };
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
  rootInset,
  color,
  sentinelXstyle,
  registerSprings = registerBarsTable,
}: {
  enabled: boolean;
  inContainer?: boolean;
  sentinelKey?: string;
  rootInset?: number;
  color?: string;
  sentinelXstyle?: StyleXStyles;
  registerSprings?: () => void;
}) {
  renders += 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const {layerProps, sentinelProps} = useScrollEdgeEffect({
    enabled,
    root: inContainer ? containerRef : undefined,
    rootInset,
    edge: '44px',
    color,
    sentinelXstyle,
    springs: bars.scrollEdgeEffect,
    registerSprings,
  });
  return (
    <div ref={containerRef} data-testid="container">
      <div {...layerProps} data-testid="layer" />
      <div key={sentinelKey} {...sentinelProps} data-testid="sentinel" />
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
  it('registers the springs it was handed before it observes', () => {
    const order: string[] = [];
    const register = vi.fn(() => {
      order.push(`register (${RecordingObserver.instances.length} observers)`);
    });
    render(<Bar enabled registerSprings={register} />);
    expect(register).toHaveBeenCalled();
    expect(order[0]).toBe('register (0 observers)');
  });

  it('registers nothing with a mouse', () => {
    pointer.isTouch = false;
    const register = vi.fn();
    render(<Bar enabled registerSprings={register} />);
    expect(register).not.toHaveBeenCalled();
  });

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

  it('takes the inset of a bar that overlays its scroller off the root', () => {
    render(<Bar enabled inContainer rootInset={44} />);
    expect(observer().options.rootMargin).toBe('-44px 0px 0px 0px');
  });

  it('observes the page with no margin', () => {
    render(<Bar enabled />);
    expect(observer().options.rootMargin).toBe('0px 0px 0px 0px');
  });

  it('measures the root on the first report and, where the engine starts it at the content box, observes again from the padding edge', () => {
    // WebKit (iOS 26.2 Safari) starts a scroll container's root rectangle at
    // its content box: below a 44px top padding here, so the first report's
    // root top is the padding edge + 44 (padding) + 44 (the inset).
    const {getByTestId} = render(<Bar enabled inContainer rootInset={44} />);
    const container = getByTestId('container');
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      top: 16,
    } as DOMRect);
    const first = observer();
    first.report(true, 16 + 44 + 44);
    // Not acted on: measured from the content box.
    expect(animator.set).not.toHaveBeenCalled();
    expect(first.disconnected).toBe(true);
    const second = observer();
    expect(second).not.toBe(first);
    expect(second.options.rootMargin).toBe('0px 0px 0px 0px');
    expect(second.observed).toEqual([getByTestId('sentinel')]);
    // Its first report puts the effect in place at once.
    second.report(true, 16 + 44);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
    expect(RecordingObserver.instances).toHaveLength(2);
  });

  it('keeps the first observer where the engine starts the root at the padding edge', () => {
    // Chromium: the root rectangle is the padding box.
    const {getByTestId} = render(<Bar enabled inContainer rootInset={44} />);
    vi.spyOn(getByTestId('container'), 'getBoundingClientRect').mockReturnValue(
      {top: 16} as DOMRect,
    );
    observer().report(false, 16 + 44);
    expect(RecordingObserver.instances).toHaveLength(1);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 1},
      {promote: false},
    );
  });

  it('hands out decorative layer and sentinel props, sized by edge', () => {
    const {getByTestId} = render(<Bar enabled color="rgb(1, 2, 3)" />);
    const layer = getByTestId('layer');
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(getByTestId('sentinel').getAttribute('aria-hidden')).toBe('true');
    // The veil's colour and height are runtime values (StyleX custom
    // properties on the element): the soft extent past the bar's bottom,
    // and the bar's bottom itself under Reduce Transparency.
    const style = layer.getAttribute('style') ?? '';
    expect(style).toContain('rgb(1, 2, 3)');
    expect(style).toContain('calc(44px + 54.8px)');
    expect(style).toContain('44px');
  });

  it("adds the caller's sentinel styles, e.g. its static position", () => {
    const plain = render(<Bar enabled />)
      .getByTestId('sentinel')
      .getAttribute('class');
    cleanup();
    const placed = render(
      <Bar enabled sentinelXstyle={testStyles.staticSentinel} />,
    )
      .getByTestId('sentinel')
      .getAttribute('class');
    expect(placed).not.toBe(plain);
    for (const name of (
      stylex.props(testStyles.staticSentinel).className ?? ''
    ).split(' ')) {
      expect(placed?.split(' ')).toContain(name);
    }
  });

  it('defaults the veil to the body colour', () => {
    const {getByTestId} = render(<Bar enabled />);
    expect(getByTestId('layer').getAttribute('style')).toContain(
      'var(--color-background-body)',
    );
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

    // Where the browser sends no `scrollend`, the finger-scroll watch ends a
    // finger's scroll 150 ms after its last scroll event; the hook checks the
    // promotion again past that spell, so a fling never leaves the layer
    // composited (the WebKit workaround in the hook's header).
    it('drops the layer a quiet spell after the finger’s last scroll where the browser sends no scrollend', () => {
      vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
      const restoreScrollEnd = withoutScrollEnd();
      try {
        const {getByTestId} = render(<Bar enabled inContainer />);
        const container = getByTestId('container');
        const layer = getByTestId('layer');
        animator.element = layer;
        const promotion = () =>
          layer.style.getPropertyValue('--_scroll-edge-will-change');
        touch('touchstart', getByTestId('sentinel'));
        container.dispatchEvent(new Event('scroll'));
        // Lifted mid-fling: its momentum still scrolls.
        touch('touchend', getByTestId('sentinel'));
        act(() => {
          vi.advanceTimersByTime(100);
        });
        container.dispatchEvent(new Event('scroll'));
        act(() => {
          vi.advanceTimersByTime(150);
        });
        expect(promotion()).toBe('opacity');
        // The watch's spell has passed since the last scroll: it has ended.
        host.isFinger = false;
        act(() => {
          vi.advanceTimersByTime(50);
        });
        expect(promotion()).toBe('');
      } finally {
        restoreScrollEnd();
        vi.useRealTimers();
      }
    });

    it('listens through the shared input stream: no document listener, one native listener per type for every effect', () => {
      // The gesture host's own listeners start with its first retain; take
      // it first so that only the hook's are counted.
      const releaseHost = getGestureHost(document).retain();
      const onDocument = vi.spyOn(document, 'addEventListener');
      const onWindow = vi.spyOn(window, 'addEventListener');
      const scrollTypes = (spy: typeof onWindow | typeof onDocument) =>
        spy.mock.calls
          .map(([type]) => type)
          .filter(type => ['scroll', 'scrollend', 'wheel'].includes(type))
          .sort();
      try {
        render(
          <>
            <Bar enabled inContainer />
            <Bar enabled />
          </>,
        );
        expect(scrollTypes(onDocument)).toEqual([]);
        // At most one each, whatever the number of effects (the host may
        // hold the scroll channel already).
        for (const type of ['scroll', 'scrollend', 'wheel']) {
          expect(
            scrollTypes(onWindow).filter(each => each === type).length,
          ).toBeLessThanOrEqual(1);
        }
        expect(scrollTypes(onWindow)).toContain('scrollend');
        cleanup();
        onWindow.mockClear();
        // Where the browser sends no `scrollend`, none is listened for.
        const restoreScrollEnd = withoutScrollEnd();
        try {
          render(<Bar enabled inContainer />);
          expect(scrollTypes(onWindow)).not.toContain('scrollend');
        } finally {
          restoreScrollEnd();
        }
      } finally {
        onDocument.mockRestore();
        onWindow.mockRestore();
        releaseHost();
      }
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

describe('the veil follows the constants table', () => {
  const source = readFileSync(
    join(__dirname, 'useScrollEdgeEffect.ts'),
    'utf8',
  );

  /** The literal block of `styles.<name>` in useScrollEdgeEffect.ts. */
  function styleBlock(name: string): string {
    const start = source.indexOf(`\n  ${name}: {`);
    expect(start, `styles.${name} not found`).toBeGreaterThan(-1);
    const end = source.indexOf('\n  },', start);
    return source.slice(start, end);
  }

  // The veil's edge is the bar's bottom, and the soft extent reaches
  // `softExtentPt` past it: the edge is that far above the layer's bottom.
  const edgeAboveBottom = bars.scrollEdgeEffect.softExtentPt;
  // UIKit's edge sits `veil.edgeAboveContentBottomPt` higher; the stops are
  // sampled around it.
  const {edgeAboveContentBottomPt} = bars.scrollEdgeEffect.veil;

  it('the layer reaches softExtentPt past the bar; Reduce Transparency ends it at the bar', () => {
    expect(source).toContain(
      'dynamicStyles.geometry(`calc(${edge} + ' +
        edgeAboveBottom +
        'px)`, edge, color)',
    );
  });

  it('the layer’s will-change follows the hook’s promotion property', () => {
    expect(styleBlock('layer')).toContain(
      "willChange: 'var(--_scroll-edge-will-change, auto)',",
    );
  });

  it('the sentinel is switchPt tall', () => {
    expect(styleBlock('sentinel')).toContain(
      `height: ${bars.scrollEdgeEffect.switchPt},`,
    );
  });

  // Denser than UIKit's (`veil.maxAlpha` 0.85, its edge 10px above the
  // bar's bottom): 0.95 with the edge at the bar's bottom, so a bar's title
  // keeps 4.5:1 over the brightest scrolled content (WCAG 1.4.3).
  it('the veil is 0.95 × (1 − Φ((y − edge) / softness)), sampled every 6px over ±3σ', () => {
    const maxAlpha = 0.95;
    const {softnessPt} = bars.scrollEdgeEffect.veil;
    expect(maxAlpha).toBeGreaterThan(bars.scrollEdgeEffect.veil.maxAlpha);
    const uikitEdge = edgeAboveBottom + edgeAboveContentBottomPt;
    const stops: string[] = [];
    for (let d = -3 * softnessPt; d <= 3 * softnessPt; d += 6) {
      const alpha =
        maxAlpha * (1 - normalCdf((d - edgeAboveContentBottomPt) / softnessPt));
      const offset = Math.round((uikitEdge - d) * 10) / 10;
      stops.push(`rgb(0 0 0 / ${alpha.toFixed(3)}) calc(100% - ${offset}px)`);
    }
    expect(styleBlock('layer')).toContain(
      `'linear-gradient(to bottom, ${stops.join(', ')})'`,
    );
  });
});

/** Standard normal CDF, by Simpson integration of the density (oracle). */
function normalCdf(z: number): number {
  const n = 2000;
  const h = Math.abs(z) / n;
  let sum = 0;
  for (let i = 0; i <= n; i++) {
    const t = i * h;
    const weight = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    sum += weight * Math.exp((-t * t) / 2);
  }
  const half = (sum * h) / 3 / Math.sqrt(2 * Math.PI);
  return z >= 0 ? 0.5 + half : 0.5 - half;
}

/** A wheel step over `target`: a trackpad's pixels unless told otherwise. */
function wheel(target: EventTarget, {ctrlKey = false} = {}) {
  act(() => {
    target.dispatchEvent(
      new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: 24,
        ctrlKey,
      }),
    );
  });
}

/** A scroll event of `scroller` (the document for the page), or its end. */
function scrollOf(
  scroller: EventTarget,
  type: 'scroll' | 'scrollend' = 'scroll',
) {
  act(() => {
    scroller.dispatchEvent(new Event(type));
  });
}

// spec:AST-094 FR43: on the web a pan also takes wheel and trackpad
// scrolling, so a scroll the wheel or the trackpad drives is the user's, as a
// finger's is, and fades. No finger is down in any of these.
describe('useScrollEdgeEffect under wheel and trackpad scrolling', () => {
  let now = 1000;
  let restoreClock = () => {};
  beforeEach(() => {
    host.isFinger = false;
    now = 1000;
    const clock = vi.spyOn(performance, 'now').mockImplementation(() => now);
    restoreClock = () => clock.mockRestore();
  });
  afterEach(() => {
    restoreClock();
  });

  it('a wheel’s scroll of the page fades the effect in, and back out', () => {
    render(<Bar enabled />);
    observer().report(true);
    wheel(document.body);
    scrollOf(document);
    observer().report(false);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 1},
      {spring: bars.scrollEdgeEffect.appear},
    );
    scrollOf(document, 'scrollend');
    now += 1000;
    wheel(document.body);
    scrollOf(document);
    observer().report(true);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 0},
      {spring: bars.scrollEdgeEffect.disappear},
    );
    // Only the first report was put in place at once.
    expect(animator.set).toHaveBeenCalledTimes(1);
  });

  // Chromium scrolls a wheel step at once and sends its `scrollend` in the
  // same task, before the observer reports the crossing.
  it('a wheel step whose scroll ends before the observer reports still fades', () => {
    render(<Bar enabled />);
    observer().report(true);
    wheel(document.body);
    scrollOf(document);
    scrollOf(document, 'scrollend');
    observer().report(false);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 1},
      {spring: bars.scrollEdgeEffect.appear},
    );
    // The program's scroll afterwards switches at once.
    now += 1000;
    scrollOf(document);
    observer().report(true);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
  });

  it('a trackpad’s scroll of a scroll container fades the effect', () => {
    const {getByTestId} = render(<Bar enabled inContainer />);
    observer().report(true);
    wheel(getByTestId('sentinel'));
    scrollOf(getByTestId('container'));
    observer().report(false);
    expect(animator.animate).toHaveBeenLastCalledWith(
      {opacity: 1},
      {spring: bars.scrollEdgeEffect.appear},
    );
  });

  it('keeps the scroll the wheel’s until the scroller’s scrollend: a mouse wheel’s smooth scroll, a trackpad’s momentum', () => {
    render(<Bar enabled />);
    observer().report(true);
    wheel(document.body);
    scrollOf(document);
    // Still moving 300 ms on, with no wheel since.
    now += 300;
    scrollOf(document);
    observer().report(false);
    expect(animator.animate).toHaveBeenCalledTimes(1);
    scrollOf(document, 'scrollend');
    // The program scrolls back afterwards (a status-bar tap): at once.
    now += 300;
    scrollOf(document);
    observer().report(true);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 0},
      {promote: false},
    );
    expect(animator.animate).toHaveBeenCalledTimes(1);
  });

  it('a wheel that scrolls nothing leaves the program’s later scroll switching', () => {
    render(<Bar enabled />);
    observer().report(true);
    // At the top already: the wheel scrolls nothing.
    wheel(document.body);
    now += 200;
    scrollOf(document);
    observer().report(false);
    expect(animator.set).toHaveBeenLastCalledWith(
      {opacity: 1},
      {promote: false},
    );
    expect(animator.animate).not.toHaveBeenCalled();
  });

  it('a ctrl-wheel is a pinch, not a scroll', () => {
    render(<Bar enabled />);
    observer().report(true);
    wheel(document.body, {ctrlKey: true});
    scrollOf(document);
    observer().report(false);
    expect(animator.animate).not.toHaveBeenCalled();
  });

  it('a wheel outside a scroll container leaves the container’s scroll the program’s', () => {
    const {getByTestId} = render(<Bar enabled inContainer />);
    observer().report(true);
    wheel(document.body);
    scrollOf(getByTestId('container'));
    observer().report(false);
    expect(animator.animate).not.toHaveBeenCalled();
  });

  // The WebKit workaround (the hook's file header): composited only while
  // the user's scroll runs, so the program's later scroll finds no layer.
  it('composites the layer from the wheel’s first scroll until its scrollend, and never for a wheel that scrolls nothing', async () => {
    const {getByTestId} = render(<Bar enabled />);
    const layer = getByTestId('layer');
    animator.element = layer;
    const promotion = () =>
      layer.style.getPropertyValue('--_scroll-edge-will-change');
    wheel(document.body);
    expect(promotion()).toBe('');
    scrollOf(document);
    expect(promotion()).toBe('opacity');
    scrollOf(document, 'scrollend');
    await Promise.resolve();
    expect(promotion()).toBe('');
    now += 1000;
    wheel(document.body);
    now += 200;
    scrollOf(document);
    expect(promotion()).toBe('');
  });

  it('ends the wheel’s scroll after a quiet spell where the browser sends no scrollend', () => {
    vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']});
    const own = Object.getOwnPropertyDescriptor(window, 'onscrollend');
    const proto = Object.getPrototypeOf(window) as object;
    const inherited = Object.getOwnPropertyDescriptor(proto, 'onscrollend');
    Reflect.deleteProperty(window, 'onscrollend');
    Reflect.deleteProperty(proto, 'onscrollend');
    const wait = (ms: number) => {
      now += ms;
      act(() => {
        vi.advanceTimersByTime(ms);
      });
    };
    try {
      expect('onscrollend' in window).toBe(false);
      const {getByTestId} = render(<Bar enabled />);
      const layer = getByTestId('layer');
      animator.element = layer;
      const promotion = () =>
        layer.style.getPropertyValue('--_scroll-edge-will-change');
      observer().report(true);
      wheel(document.body);
      scrollOf(document);
      // Its smooth scroll keeps moving: still the wheel's.
      wait(100);
      scrollOf(document);
      wait(150);
      expect(promotion()).toBe('opacity');
      // Quiet for the 200 ms spell: the scroll has ended.
      wait(60);
      expect(promotion()).toBe('');
      // The program's scroll afterwards switches at once.
      wait(300);
      scrollOf(document);
      observer().report(false);
      expect(animator.set).toHaveBeenLastCalledWith(
        {opacity: 1},
        {promote: false},
      );
      expect(animator.animate).not.toHaveBeenCalled();
    } finally {
      if (inherited != null) {
        Object.defineProperty(proto, 'onscrollend', inherited);
      }
      if (own != null) {
        Object.defineProperty(window, 'onscrollend', own);
      }
      vi.useRealTimers();
    }
  });

  // spec:AST-094 FR24: no listener while the touch presentation is off.
  it('listens for wheels only while the effect runs, passively: none with a mouse or while disabled', () => {
    cleanup();
    const added = vi.spyOn(window, 'addEventListener');
    const removed = vi.spyOn(window, 'removeEventListener');
    try {
      const wheelListeners = () =>
        added.mock.calls.filter(([type]) => type === 'wheel');
      pointer.isTouch = false;
      render(<Bar enabled />);
      pointer.isTouch = true;
      render(<Bar enabled={false} />);
      expect(wheelListeners()).toEqual([]);
      cleanup();
      render(<Bar enabled />);
      expect(wheelListeners()).toHaveLength(1);
      expect(wheelListeners()[0]?.[2]).toEqual({capture: true, passive: true});
      cleanup();
      expect(removed.mock.calls.some(([type]) => type === 'wheel')).toBe(true);
    } finally {
      added.mockRestore();
      removed.mockRestore();
    }
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
