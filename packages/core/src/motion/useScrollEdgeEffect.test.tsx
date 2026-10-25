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
 *   on its disappear spring when a finger drives the scroll, switches at once
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
