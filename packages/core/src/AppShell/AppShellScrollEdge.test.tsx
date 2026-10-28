// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellScrollEdge.test.tsx
 * @input vitest (jsdom), React Testing Library, AppShell, a query-aware
 *   matchMedia stub, a recording IntersectionObserver and the StyleX rules
 *   vitest injects
 * @output Checks the iOS 26 bar under a finger (any touch device) whose page
 *   scrolls: the pinned header paints no background and no hairline there,
 *   carries the scroll edge layer, and the page carries the sentinel the
 *   effect observes; a mouse, or a shell whose main region scrolls, keeps
 *   today's opaque bar and draws no effect; the veil takes the bar's colour
 *   and its edge is the header's bottom; leaving the sentinel fades the
 *   layer for a finger's scroll and switches it at once for the program's.
 *   The veil's shape against the constants table is
 *   motion/useScrollEdgeEffect.test.tsx's
 * @position Testing; validates AppShell.tsx's touch bar. The switch on a real
 *   page, the curve and the busy-main-thread behaviour are proven by
 *   __tests__/AppShellScrollEdge.interaction.browser.spec.ts
 */

import {act, render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AppShell, type AppShellVariant} from './AppShell';

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

/** A finger lands on `target`. */
function fingerDown(target: Element) {
  const event = new Event('touchstart', {bubbles: true, cancelable: true});
  const touch = {identifier: 1, clientX: 10, clientY: 300, target};
  Object.defineProperty(event, 'changedTouches', {value: [touch]});
  Object.defineProperty(event, 'touches', {value: [touch]});
  target.dispatchEvent(event);
}

/** The finger that landed on `target` lifts. */
function fingerUp(target: Element) {
  const event = new Event('touchend', {bubbles: true, cancelable: true});
  const touch = {identifier: 1, clientX: 10, clientY: 300, target};
  Object.defineProperty(event, 'changedTouches', {value: [touch]});
  Object.defineProperty(event, 'touches', {value: []});
  target.dispatchEvent(event);
}

/** A finger lands on `target` and the page scrolls under it. */
function fingerScroll(target: Element) {
  fingerDown(target);
  document.dispatchEvent(new Event('scroll'));
}

/** Whether useScrollEdgeEffect asks for the layer to be composited. */
function isPromoted(layer: Element | null): boolean {
  return (
    (layer as HTMLElement | null)?.style.getPropertyValue(
      '--_scroll-edge-will-change',
    ) === 'opacity'
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

type Where = 'default' | 'touch';

interface RuleDeclarations {
  where: Where | null;
  declarations: Map<string, string>;
}

/**
 * The declarations of every injected rule owned by one of `el`'s classes, and
 * where it applies: outside any at-rule, or under the coarse pointer alone.
 */
function rulesFor(el: Element): RuleDeclarations[] {
  const classes = new Set(el.className.split(/\s+/));
  const found: RuleDeclarations[] = [];
  const whereOf = (conditions: string[]): Where | null => {
    if (conditions.length === 0) {
      return 'default';
    }
    return conditions.length === 1 && conditions[0] === TOUCH ? 'touch' : null;
  };
  const visit = (rules: CSSRuleList, conditions: string[]) => {
    for (const rule of Array.from(rules)) {
      const group = rule as unknown as {
        cssRules?: CSSRuleList;
        conditionText?: string;
      };
      if (group.cssRules != null && group.conditionText != null) {
        visit(group.cssRules, [...conditions, group.conditionText]);
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
      found.push({where: whereOf(conditions), declarations});
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    visit(sheet.cssRules, []);
  }
  return found;
}

function declared(
  el: Element,
  property: string,
  where: Where = 'default',
): string | undefined {
  let value: string | undefined;
  for (const rule of rulesFor(el)) {
    if (rule.where === where && rule.declarations.has(property)) {
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
  it('a finger whose page scrolls gets the effect layer and the sentinel', () => {
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
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
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

  it('the pinned bar paints no background under a finger, its colour otherwise', () => {
    stubPointer(true);
    renderShell({height: 'auto', variant: 'surface'});
    const banner = screen.getByRole('banner');
    expect(declared(banner, 'background-color')).toBe(
      'var(--color-background-surface)',
    );
    expect(declared(banner, 'background-color', 'touch')).toBe('transparent');
    expect(declared(layerOf(banner)!, 'display')).toBe('none');
    expect(declared(layerOf(banner)!, 'display', 'touch')).toBe('block');
  });

  it('the veil takes the bar colour of the variant', () => {
    // The colour is the veil's runtime value (a custom property on the
    // layer, see useScrollEdgeEffect.test.tsx).
    stubPointer(true);
    const {unmount} = renderShell({height: 'auto', variant: 'wash'});
    expect(
      layerOf(screen.getByRole('banner'))!.getAttribute('style'),
    ).toContain('var(--color-background-body)');
    unmount();
    renderShell({height: 'auto', variant: 'section'});
    expect(
      layerOf(screen.getByRole('banner'))!.getAttribute('style'),
    ).toContain('var(--color-background-surface)');
  });

  it('the veil’s edge is the header’s bottom', () => {
    // Denser than UIKit's, with its edge at the header's bottom: the title
    // keeps 4.5:1 over the brightest scrolled content (WCAG 1.4.3).
    stubPointer(true);
    renderShell({height: 'auto', variant: 'wash'});
    expect(
      layerOf(screen.getByRole('banner'))!.getAttribute('style'),
    ).toContain('calc(100% + 54.8px)');
  });

  it('the touch bar hides the section divider with a coarse-pointer rule; a mouse keeps it', () => {
    // LayoutHeader reflects its divider as `data-divider` (jsdom drops the
    // logical border properties themselves). The divider stays in the
    // markup, so a server render is right for either pointer; the rule under
    // `(pointer: coarse)` takes its width away on the touch bar.
    const header = () =>
      screen.getByRole('banner').querySelector('.astryx-layout-header');
    stubPointer(true);
    const touch = renderShell({height: 'auto', variant: 'section'});
    expect(header()?.hasAttribute('data-divider')).toBe(true);
    expect(rulesFor(header()!).some(rule => rule.where === 'touch')).toBe(
      true,
    );
    touch.unmount();
    stubPointer(false);
    expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
    renderShell({height: 'auto', variant: 'section'});
    expect(header()?.hasAttribute('data-divider')).toBe(true);
  });

  it('a server render draws the same header whatever the pointer guess', () => {
    const header = (defaultIsMobile: boolean) =>
      /<[^>]*astryx-layout-header[^>]*>/.exec(
        renderToString(
          <AppShell
            topNav={<div>Nav</div>}
            height="auto"
            variant="section"
            mobileNav={{defaultIsMobile}}>
            <div>Content</div>
          </AppShell>,
        ),
      )?.[0];
    expect(header(true)).toContain('data-divider');
    expect(header(true)).toBe(header(false));
  });

  it('with a mouse each variant keeps its own header fill; under a finger the bar paints none', () => {
    stubPointer(false);
    const fills: Record<string, string> = {};
    for (const variant of ['wash', 'elevated', 'surface', 'section', 'brand']) {
      const {unmount} = renderShell({
        height: 'auto',
        variant: variant as AppShellVariant,
      });
      const banner = screen.getByRole('banner');
      fills[variant] =
        `${declared(banner, 'background-color')} / ` +
        `${declared(banner, 'background-color', 'touch')}`;
      unmount();
    }
    expect(fills).toEqual({
      wash: 'var(--color-background-body) / transparent',
      elevated: 'var(--color-background-body) / transparent',
      surface: 'var(--color-background-surface) / transparent',
      section: 'var(--color-background-surface) / transparent',
      // A variant added by module augmentation: no fill of its own with a
      // mouse, as before.
      brand: 'undefined / transparent',
    });
  });

  it('the header holding the veil owns its stacking (isolation: isolate)', () => {
    stubPointer(true);
    renderShell({height: 'auto'});
    expect(declared(screen.getByRole('banner'), 'isolation', 'default')).toBe(
      'isolate',
    );
  });

  it('leaving the sentinel during a finger’s scroll fades the layer in', () => {
    stubPointer(true);
    renderShell({height: 'auto'});
    const layer = layerOf(screen.getByRole('banner'));
    const observer = RecordingObserver.instances.at(-1)!;
    observer.report(true);
    animations.length = 0;
    // A finger down on the content scrolls the page.
    fingerScroll(screen.getByText('Content'));
    observer.report(false);
    const fade = animations.find(({element}) => element === layer);
    expect(fade).toBeDefined();
    expect(fade?.keyframes[0]?.opacity).toBe('0');
    expect(fade?.keyframes.at(-1)?.opacity).toBe('1');
  });

  // The WebKit workaround: iOS 26.2 drops the sticky bar's items when the
  // program jumps the page under a composited layer, so the layer is
  // composited only while a finger works the page.
  it('the layer is composited from a finger’s landing until its scroll ends', async () => {
    stubPointer(true);
    renderShell({height: 'auto'});
    const layer = layerOf(screen.getByRole('banner'));
    const content = screen.getByText('Content');
    expect(isPromoted(layer)).toBe(false);
    fingerDown(content);
    expect(isPromoted(layer)).toBe(true);
    document.dispatchEvent(new Event('scroll'));
    // Lifted with the page still moving: the momentum is the finger's.
    fingerUp(content);
    expect(isPromoted(layer)).toBe(true);
    document.dispatchEvent(new Event('scrollend'));
    await Promise.resolve();
    expect(isPromoted(layer)).toBe(false);
  });

  it('a tap that lifts without scrolling drops the layer at once', () => {
    stubPointer(true);
    renderShell({height: 'auto'});
    const layer = layerOf(screen.getByRole('banner'));
    const content = screen.getByText('Content');
    fingerDown(content);
    expect(isPromoted(layer)).toBe(true);
    fingerUp(content);
    expect(isPromoted(layer)).toBe(false);
  });

  it('a mouse never composites the layer', () => {
    stubPointer(false);
    renderShell({height: 'auto'});
    const content = screen.getByText('Content');
    fingerDown(content);
    expect(isPromoted(layerOf(screen.getByRole('banner')))).toBe(false);
  });

  it('leaving the sentinel during a scroll the program drives switches the layer at once', () => {
    stubPointer(true);
    renderShell({height: 'auto'});
    const layer = layerOf(screen.getByRole('banner'));
    const observer = RecordingObserver.instances.at(-1)!;
    observer.report(true);
    animations.length = 0;
    document.dispatchEvent(new Event('scroll'));
    observer.report(false);
    expect(animations.some(({element}) => element === layer)).toBe(false);
    expect((layer as HTMLElement | null)?.style.opacity).toBe('1');
    // ...with no compositing layer: the switch is written without promotion.
    expect((layer as HTMLElement | null)?.style.willChange).toBe('');
    expect(isPromoted(layer)).toBe(false);
  });
});
