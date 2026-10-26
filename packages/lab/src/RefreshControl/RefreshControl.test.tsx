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
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from 'vitest';
import {refreshControl} from '@astryxdesign/core/motion/uikit/refresh';
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

describe('RefreshControl indicator: UIRefreshControl\u2019s replicator', () => {
  const table = refreshControl;
  const glyphOf = () =>
    document.querySelector('.astryx-refresh-control')?.lastElementChild
      ?.firstElementChild?.firstElementChild as HTMLElement;
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
  /**
   * Records the Web Animations elements start from now on (jsdom implements
   * none), for the test that calls it.
   */
  const recordAnimations = () => {
    const played: {
      element: Element;
      keyframes: Keyframe[];
      options: KeyframeAnimationOptions;
    }[] = [];
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value(
        this: Element,
        keyframes: Keyframe[],
        options: KeyframeAnimationOptions,
      ) {
        played.push({element: this, keyframes, options});
        return {onfinish: null, cancel: vi.fn()} as unknown as Animation;
      },
    });
    onTestFinished(() => {
      Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    });
    return played;
  };
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

  /** A rule's value for `property` on one of the element's classes. */
  const declarationOf = (el: Element, property: string): string => {
    const css = allCss();
    for (const cls of Array.from(el.classList)) {
      const match = new RegExp(
        `\\.${cls}[^{]*\\{[^}]*?${property}:\\s*([^;}]+)`,
      ).exec(css);
      if (match != null) {
        return match[1].trim();
      }
    }
    return '';
  };
  /** The eight capsules side by side, rebuilt from the table. */
  const capsuleSprite = (): string => {
    const fmt = (n: number) => String(Math.round(n * 10000) / 10000);
    const box = 2 * table.spokeOuterRadiusPt;
    const center = box / 2;
    const rects = Array.from({length: table.indicatorSpokes}, (_, k) => {
      const ox = k * box;
      return `<rect x='${fmt(ox + center - table.spokeWidthPt / 2)}' y='${fmt(center - table.spokeOuterRadiusPt)}' width='${fmt(table.spokeWidthPt)}' height='${fmt(table.spokeOuterRadiusPt - table.spokeInnerRadiusPt)}' rx='${fmt(table.spokeCornerRadiusPt)}' transform='rotate(${fmt((k * 360) / table.indicatorSpokes)} ${fmt(ox + center)} ${fmt(center)})'/>`;
    }).join('');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${fmt(box * table.indicatorSpokes)} ${fmt(box)}'>${rects}</svg>`;
    return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
  };

  it('draws its eight capsules once, each a masked layer at its own angle', () => {
    render(
      <RefreshControl onRefresh={() => {}}>
        <div>Row</div>
      </RefreshControl>,
    );
    const glyph = glyphOf();
    const spokes = Array.from(glyph.children) as HTMLElement[];
    // Minimal DOM: one element per spoke, and no second set or wrapper
    // (two sets of svg capsules before: 50 elements under the glyph).
    expect(spokes).toHaveLength(table.indicatorSpokes);
    expect(glyph.querySelectorAll('*')).toHaveLength(table.indicatorSpokes);
    // The table's capsules, at their angles in an eight-frame sprite.
    expect(declarationOf(spokes[0], 'mask-image')).toBe(capsuleSprite());
    expect(declarationOf(spokes[0], 'mask-size')).toBe('800% 100%');
    spokes.forEach((spoke, index) => {
      expect(spoke.tagName).toBe('SPAN');
      expect(spoke.childNodes).toHaveLength(0);
      const x = Math.round((index / (table.indicatorSpokes - 1)) * 1e6) / 1e4;
      expect(declarationOf(spoke, 'mask-position')).toBe(`${x}% 0%`);
    });
    // The pull reveals the spokes one after another: UIKit's alpha offset
    // runs from −1 to 0 with the reveal, times the reveal itself.
    const reveal = 'var(--astryx-refresh-reveal, 0)';
    expect(spokes[3].getAttribute('style')).toContain(
      `calc(${reveal} * clamp(0, 1 + 3 * (${reveal} - 1), 1))`,
    );
  });

  it('steps each spoke through the instances that pass it, all on one clock', () => {
    // Under a finger, where the hook spins the drawing.
    const matchMedia = window.matchMedia;
    useTouchScreen(true);
    onTestFinished(() => {
      window.matchMedia = matchMedia;
    });
    const played = recordAnimations();
    // A refresh begun without a pull: the spin at once, with no cross-fade.
    render(
      <RefreshControl onRefresh={() => {}} isRefreshing>
        <div>Row</div>
      </RefreshControl>,
    );
    const glyph = glyphOf();
    const spokes = Array.from(glyph.children) as HTMLElement[];
    const count = table.indicatorSpokes;
    expect(spokes).toHaveLength(count);
    expect(glyph.parentElement).toHaveAttribute('data-refresh-spinning');
    // One Web Animation per spoke, all started in one task (one clock), and
    // nothing in the stylesheet.
    expect(played.map(run => run.element)).toEqual(spokes);
    spokes.forEach((spoke, p) => {
      expect(animationNameOf(spoke)).toBe('');
      const [{keyframes, options}] = played.filter(
        run => run.element === spoke,
      );
      // One turn per iteration, forever, linear: the table's
      // `refreshControl.spinMs`.
      expect(options).toEqual({duration: table.spinMs, iterations: Infinity});
      expect(keyframes.every(frame => frame.easing === undefined)).toBe(true);
      const frames = keyframes.map(
        frame => [Number(frame.offset), Number(frame.opacity)] as const,
      );
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
      for (let step = 0; step < count; step += 1) {
        // Spoke p holds instance (p − s) mod 8 at step s, so the brightest
        // instance moves one spoke clockwise per step.
        const instance = (((p - step) % count) + count) % count;
        expect(
          holdAt((step + 0.5) / count),
          `spoke ${p} step ${step}`,
        ).toBeCloseTo(
          table.spinFirstInstanceAlpha +
            instance * table.spinInstanceAlphaOffset,
          6,
        );
        // Each hold ends 0.1 ms before the next begins: a ramp, not steps().
        if (step > 0) {
          const next = frames.findIndex(([offset]) => offset === step / count);
          expect(
            (frames[next][0] - frames[next - 1][0]) * table.spinMs,
          ).toBeCloseTo(0.1, 6);
        }
      }
    });
  });

  it('cross-fades each spoke on the hook\u2019s gradient spring at the trigger', () => {
    // Under a finger, where the hook starts the drawing.
    const matchMedia = window.matchMedia;
    useTouchScreen(true);
    onTestFinished(() => {
      window.matchMedia = matchMedia;
    });
    const played = recordAnimations();
    const {rerender} = render(
      <RefreshControl onRefresh={() => {}} isRefreshing={false}>
        <div>Row</div>
      </RefreshControl>,
    );
    const glyph = glyphOf();
    // The measured spring is critically damped: the clamp Core Animation
    // applies.
    const spring = table.triggerGradientSpring;
    expect(spring.damping).toBeCloseTo(2 * Math.sqrt(spring.stiffness), 2);
    // At rest the spokes run no animation: at the trigger the hook fades a
    // transient copy of them out on the table's gradient spring.
    const spokes = Array.from(glyph.children) as HTMLElement[];
    expect(played).toEqual([]);
    // A refresh begun without a pull hands the gradient over at once: every
    // spoke steps, with no cross-fade.
    rerender(
      <RefreshControl onRefresh={() => {}} isRefreshing>
        <div>Row</div>
      </RefreshControl>,
    );
    expect(glyph.parentElement).toHaveAttribute('data-refresh-spinning');
    expect(played.map(run => run.element)).toEqual(spokes);
    expect(glyph.children).toHaveLength(spokes.length);
  });
});
