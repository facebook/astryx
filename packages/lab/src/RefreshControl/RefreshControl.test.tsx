// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RefreshControl.test.tsx
 * @input vitest (jsdom), RefreshControl, touch events dispatched on its
 *   content, stand-ins for a touch screen (matchMedia) and for iOS WebKit
 *   (CSS.supports)
 * @output Covers what the component adds to useRefreshControl: the hidden
 *   indicator and its title, the busy state across a pull that triggers, and
 *   the props it passes to the pulled content (the behavior itself is
 *   useRefreshControl.test.tsx)
 * @position Testing; colocated with RefreshControl.tsx. Motion itself is
 *   checked in a real browser (RefreshControl.browser test and storyboards)
 */

import {act, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {uikit} from '@astryxdesign/core/motion/experimental';
import {RefreshControl} from './RefreshControl';

const COARSE = /\(\s*pointer\s*:\s*coarse\s*\)/;
let originalMatchMedia: typeof window.matchMedia;
let originalInnerHeight: number;
const originalCss = Object.getOwnPropertyDescriptor(window, 'CSS');

/** iOS WebKit, as the touch idiom reads it: `CSS.supports` answers its query. */
function useIos(isIos: boolean): void {
  Object.defineProperty(window, 'CSS', {
    configurable: true,
    writable: true,
    value: {
      escape: (value: string) => value,
      supports: (query: string) =>
        isIos && query === '(-webkit-touch-callout: none)',
    },
  });
}

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
    useIos(true);
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
    if (originalCss) {
      Object.defineProperty(window, 'CSS', originalCss);
    } else {
      Reflect.deleteProperty(window, 'CSS');
    }
    Object.defineProperty(window, 'innerHeight', {
      value: originalInnerHeight,
      configurable: true,
    });
    document.documentElement.style.overscrollBehaviorY = '';
  });

  it('renders its content with a hidden indicator and no busy state at rest', () => {
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
    const indicator = content().firstElementChild as HTMLElement;
    expect(indicator).toHaveAttribute('aria-hidden', 'true');
    expect(indicator).toHaveTextContent('Updated now');
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
    // jsdom has no compositor: the settle lands on its target at once.
    expect(translateY(content())).toBeCloseTo(60, 5);
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

describe('RefreshControl indicator: UIRefreshControl\u2019s replicator', () => {
  const table = uikit.refreshControl;
  const glyphOf = () =>
    document.querySelector('.astryx-refresh-control')?.firstElementChild
      ?.firstElementChild as HTMLElement;
  const allCss = () =>
    Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules).map(rule => rule.cssText);
        } catch {
          return [];
        }
      })
      .join('\n');
  /** The whole `@keyframes <name> { … }` rule, braces matched. */
  const keyframesRule = (name: string): string => {
    const css = allCss();
    const start = css.search(new RegExp(`@keyframes ${name}\\b`, 'i'));
    expect(start).toBeGreaterThanOrEqual(0);
    let depth = 0;
    for (let i = css.indexOf('{', start); i < css.length; i += 1) {
      if (css[i] === '{') {
        depth += 1;
      }
      if (css[i] === '}' && --depth === 0) {
        return css.slice(start, i + 1);
      }
    }
    return css.slice(start);
  };
  /**
   * The named keyframes' opacity frames as [offset 0..1, opacity], sorted
   * (a keyframe may list several offsets).
   */
  const opacityFrames = (name: string): [number, number][] =>
    Array.from(
      keyframesRule(name).matchAll(/([\d.%,\s]+)\{\s*opacity:\s*([\d.]+)/g),
    )
      .flatMap(m =>
        m[1]
          .split(',')
          .map(key => key.trim())
          .filter(key => key.endsWith('%'))
          .map(
            key => [parseFloat(key) / 100, Number(m[2])] as [number, number],
          ),
      )
      .sort((a, b) => a[0] - b[0]);
  const animationNameOf = (el: Element) => {
    const css = allCss();
    for (const cls of Array.from(el.classList)) {
      const match = new RegExp(
        `\\.${cls}[^{]*\\{[^}]*animation-name:\\s*([\\w-]+)`,
      ).exec(css);
      if (match != null && match[1] !== 'none') {
        return match[1];
      }
    }
    return '';
  };

  it('draws eight capsule spokes at their measured size, each at its own angle', () => {
    render(
      <RefreshControl onRefresh={() => {}}>
        <div>Row</div>
      </RefreshControl>,
    );
    const glyph = glyphOf();
    const [revealed, spinning] = Array.from(glyph.children);
    for (const set of [revealed, spinning]) {
      const rects = Array.from(set.querySelectorAll('rect'));
      expect(rects).toHaveLength(table.indicatorSpokes);
      const center = table.spokeOuterRadiusPt;
      rects.forEach((rect, index) => {
        expect(Number(rect.getAttribute('width'))).toBe(table.spokeWidthPt);
        expect(Number(rect.getAttribute('height'))).toBeCloseTo(
          table.spokeOuterRadiusPt - table.spokeInnerRadiusPt,
          6,
        );
        expect(Number(rect.getAttribute('rx'))).toBe(table.spokeCornerRadiusPt);
        expect(Number(rect.getAttribute('y'))).toBeCloseTo(
          center - table.spokeOuterRadiusPt,
          6,
        );
        expect(rect.getAttribute('transform')).toBe(
          `rotate(${(index * 360) / table.indicatorSpokes} ${center} ${center})`,
        );
      });
    }
    // The pull reveals the spokes one after another: UIKit's alpha offset
    // runs from −1 to 0 with the reveal, times the reveal itself.
    const reveal = 'var(--astryx-refresh-reveal, 0)';
    expect(
      (revealed.children[3] as HTMLElement).getAttribute('style'),
    ).toContain(`calc(${reveal} * clamp(0, 1 + 3 * (${reveal} - 1), 1))`);
  });

  it('steps each spoke through the instances that pass it, all on one clock', () => {
    render(
      <RefreshControl onRefresh={() => {}}>
        <div>Row</div>
      </RefreshControl>,
    );
    const spokes = Array.from(glyphOf().children[1].children) as HTMLElement[];
    const count = table.indicatorSpokes;
    const steps = count * 8;
    expect(spokes).toHaveLength(count);
    spokes.forEach((spoke, p) => {
      // No delay: every spoke's phase is in its keyframes, so they share one
      // iteration boundary.
      expect(spoke.style.animationDelay).toBe('');
      const frames = opacityFrames(animationNameOf(spoke));
      expect(frames[0][0]).toBe(0);
      expect(frames.at(-1)?.[0]).toBe(1);
      const holdAt = (x: number) => {
        for (let i = 1; i < frames.length; i += 1) {
          if (x <= frames[i][0]) {
            return frames[i - 1][1] === frames[i][1] ? frames[i][1] : NaN;
          }
        }
        return NaN;
      };
      for (let step = 0; step < steps; step += 1) {
        // Spoke p holds instance (p − s) mod 8 at step s, so the brightest
        // instance moves one spoke clockwise per step.
        const instance = (((p - step) % count) + count) % count;
        expect(
          holdAt((step + 0.5) / steps),
          `spoke ${p} step ${step}`,
        ).toBeCloseTo(
          table.spinFirstInstanceAlpha +
            instance * table.spinInstanceAlphaOffset,
          6,
        );
      }
    });
    const css = allCss();
    expect(css).not.toMatch(/steps\(/);
    const durations = Array.from(
      css.matchAll(/animation-duration:\s*([\d.]+)(m?s)/g),
    );
    expect(
      durations.some(
        ([, value, unit]) =>
          Number(value) * (unit === 's' ? 1000 : 1) === 8 * table.spinMs,
      ),
    ).toBe(true);
  });

  it('springs the gradient in on the measured, critically damped spring', () => {
    render(
      <RefreshControl onRefresh={() => {}}>
        <div>Row</div>
      </RefreshControl>,
    );
    const [revealed, spinning] = Array.from(glyphOf().children);
    const spring = table.triggerGradientSpring;
    const omega = Math.sqrt(spring.stiffness / spring.mass);
    // Critical damping: the clamp Core Animation applies.
    expect(spring.damping).toBeCloseTo(2 * Math.sqrt(spring.stiffness), 2);
    const g = (t: number) => 1 - (1 + omega * t) * Math.exp(-omega * t);
    const fadeIn = opacityFrames(animationNameOf(spinning));
    const fadeOut = opacityFrames(animationNameOf(revealed));
    for (const [x, value] of fadeIn.slice(0, -1)) {
      expect(value, `in at ${x}`).toBeCloseTo(g(4 * x), 3);
    }
    for (const [x, value] of fadeOut.slice(0, -1)) {
      expect(value, `out at ${x}`).toBeCloseTo(1 - g(4 * x), 3);
    }
  });
});
