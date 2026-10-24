// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellScrollEdge.test.tsx
 * @input vitest (jsdom), React Testing Library, AppShell, a query-aware
 *   matchMedia stub, a recording IntersectionObserver, the StyleX rules
 *   vitest injects, and AppShell.tsx's own source
 * @output Checks the iOS 26 bar on a touch screen whose page scrolls: the
 *   pinned header paints no background and no hairline there, carries the
 *   scroll edge layer, and the page carries the sentinel the effect observes;
 *   a mouse, or a shell whose main region scrolls, keeps today's opaque bar
 *   and draws no effect; the layer, the sentinel and the veil's mask follow
 *   the constants table; leaving the sentinel starts the fade
 * @position Testing; validates AppShell.tsx's touch bar. The switch on a real
 *   page, the curve and the busy-main-thread behaviour are proven by
 *   __tests__/AppShellScrollEdge.interaction.browser.spec.ts
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {act, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {bars} from '../motion/uikit/bars';
import {AppShell} from './AppShell';

const TOUCH = '(pointer: coarse)';

/** Answers `(pointer: coarse)` with `isTouch` and every other query false. */
function stubPointer(isTouch: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === TOUCH ? isTouch : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

class RecordingObserver {
  static instances: RecordingObserver[] = [];
  readonly observed: Element[] = [];
  constructor(readonly callback: IntersectionObserverCallback) {
    RecordingObserver.instances.push(this);
  }
  observe(target: Element) {
    this.observed.push(target);
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  report(isIntersecting: boolean) {
    act(() => {
      this.callback(
        [{isIntersecting} as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    });
  }
}

const animations: {keyframes: Keyframe[]; element: Element}[] = [];

beforeEach(() => {
  RecordingObserver.instances = [];
  animations.length = 0;
  vi.stubGlobal('IntersectionObserver', RecordingObserver);
  HTMLElement.prototype.animate = function (this: HTMLElement, keyframes) {
    animations.push({keyframes: keyframes as Keyframe[], element: this});
    return {startTime: null, cancel: vi.fn()} as unknown as Animation;
  };
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

interface RuleDeclarations {
  media: string | null;
  declarations: Map<string, string>;
}

/** The declarations of every injected rule owned by one of `el`'s classes. */
function rulesFor(el: Element): RuleDeclarations[] {
  const classes = new Set(el.className.split(/\s+/));
  const found: RuleDeclarations[] = [];
  const visit = (rules: CSSRuleList, media: string | null) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        visit(rule.cssRules, rule.conditionText);
        continue;
      }
      if (!(rule instanceof CSSStyleRule)) {
        continue;
      }
      const owner = /^\.([\w-]+)/.exec(rule.selectorText)?.[1];
      if (owner == null || !classes.has(owner)) {
        continue;
      }
      const declarations = new Map<string, string>();
      for (let i = 0; i < rule.style.length; i++) {
        const property = rule.style.item(i);
        declarations.set(property, rule.style.getPropertyValue(property));
      }
      found.push({media, declarations});
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    visit(sheet.cssRules, null);
  }
  return found;
}

function declared(
  el: Element,
  property: string,
  media: string | null = null,
): string | undefined {
  let value: string | undefined;
  for (const rule of rulesFor(el)) {
    if (rule.media === media && rule.declarations.has(property)) {
      value = rule.declarations.get(property);
    }
  }
  return value;
}

function renderShell(
  props: Partial<React.ComponentProps<typeof AppShell>> = {},
) {
  return render(
    <AppShell topNav={<div>Nav</div>} data-testid="shell" {...props}>
      <div>Content</div>
    </AppShell>,
  );
}

const layerOf = (banner: HTMLElement) =>
  banner.querySelector(':scope > [aria-hidden="true"]');

describe('AppShell scroll edge effect', () => {
  it('a touch screen whose page scrolls gets the effect layer and the sentinel', () => {
    stubPointer(true);
    renderShell({height: 'adaptive'});
    const banner = screen.getByRole('banner');
    const layer = layerOf(banner);
    expect(layer).not.toBeNull();
    expect(declared(layer!, 'position')).toBe('absolute');
    expect(declared(layer!, 'pointer-events')).toBe('none');
    const sentinel = RecordingObserver.instances.at(-1)?.observed[0];
    expect(sentinel).toBeDefined();
    expect(sentinel?.parentElement).toBe(screen.getByTestId('shell'));
    expect(sentinel?.getAttribute('aria-hidden')).toBe('true');
  });

  it('a mouse keeps the main region scrolling and draws no effect', () => {
    stubPointer(false);
    renderShell({height: 'adaptive'});
    expect(layerOf(screen.getByRole('banner'))).toBeNull();
    expect(RecordingObserver.instances).toHaveLength(0);
  });

  it('a shell whose main region scrolls draws no effect, even under a finger', () => {
    stubPointer(true);
    renderShell({height: 'fill'});
    expect(layerOf(screen.getByRole('banner'))).toBeNull();
    expect(RecordingObserver.instances).toHaveLength(0);
  });

  it('the pinned bar paints no background under a coarse pointer, its colour otherwise', () => {
    stubPointer(true);
    renderShell({height: 'auto', variant: 'surface'});
    const banner = screen.getByRole('banner');
    expect(declared(banner, 'background-color')).toBe(
      'var(--color-background-surface)',
    );
    expect(declared(banner, 'background-color', TOUCH)).toBe('transparent');
  });

  it('the veil takes the bar colour of the variant', () => {
    stubPointer(true);
    const {unmount} = renderShell({height: 'auto', variant: 'wash'});
    expect(
      declared(layerOf(screen.getByRole('banner'))!, 'background-color'),
    ).toBe('var(--color-background-body)');
    unmount();
    renderShell({height: 'auto', variant: 'section'});
    expect(
      declared(layerOf(screen.getByRole('banner'))!, 'background-color'),
    ).toBe('var(--color-background-surface)');
  });

  it('the touch bar draws no hairline; a mouse keeps the section divider', () => {
    // LayoutHeader reflects its divider as `data-divider` (jsdom drops the
    // logical border properties themselves).
    const hasDivider = () =>
      screen
        .getByRole('banner')
        .querySelector('.astryx-layout-header')
        ?.hasAttribute('data-divider');
    stubPointer(true);
    const {unmount} = renderShell({height: 'auto', variant: 'section'});
    expect(hasDivider()).toBe(false);
    unmount();
    stubPointer(false);
    renderShell({height: 'auto', variant: 'section'});
    expect(hasDivider()).toBe(true);
  });

  it('leaving the sentinel starts the fade on the layer', () => {
    stubPointer(true);
    renderShell({height: 'auto'});
    const layer = layerOf(screen.getByRole('banner'));
    const observer = RecordingObserver.instances.at(-1)!;
    observer.report(true);
    animations.length = 0;
    observer.report(false);
    const fade = animations.find(({element}) => element === layer);
    expect(fade).toBeDefined();
    expect(fade?.keyframes[0]?.opacity).toBe('0');
    expect(fade?.keyframes.at(-1)?.opacity).toBe('1');
  });
});

describe('AppShell scroll edge effect follows the constants table', () => {
  const source = readFileSync(join(__dirname, 'AppShell.tsx'), 'utf8');

  /** The literal block of `styles.<name>` in AppShell.tsx. */
  function styleBlock(name: string): string {
    const start = source.indexOf(`\n  ${name}: {`);
    expect(start, `styles.${name} not found`).toBeGreaterThan(-1);
    const end = source.indexOf('\n  },', start);
    return source.slice(start, end);
  }

  it('the layer reaches softExtentPt below the bar', () => {
    expect(styleBlock('scrollEdge')).toContain(
      `default: 'calc(100% + ${bars.scrollEdgeEffect.softExtentPt}px)'`,
    );
  });

  it('the sentinel is switchPt tall', () => {
    expect(styleBlock('scrollEdgeSentinel')).toContain(
      `height: ${bars.scrollEdgeEffect.switchPt},`,
    );
  });

  it('the veil is maxAlpha × (1 − Φ((y − edge) / softness)), sampled every 6px over ±3σ', () => {
    const {maxAlpha, edgeAboveContentBottomPt, softnessPt} =
      bars.scrollEdgeEffect.veil;
    // The edge in px above the layer's bottom: the header's bottom edge (the
    // bottom of the bar's content) is softExtentPt above it.
    const edge = edgeAboveContentBottomPt + bars.scrollEdgeEffect.softExtentPt;
    const stops: string[] = [];
    for (let d = -3 * softnessPt; d <= 3 * softnessPt; d += 6) {
      const alpha = maxAlpha * (1 - normalCdf(d / softnessPt));
      const offset = Math.round((edge - d) * 10) / 10;
      stops.push(`rgb(0 0 0 / ${alpha.toFixed(3)}) calc(100% - ${offset}px)`);
    }
    expect(styleBlock('scrollEdge')).toContain(
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
