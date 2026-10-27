// Copyright (c) Meta Platforms, Inc. and affiliates.

import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {AppShell} from '../AppShell';
import {SideNav} from './SideNav';
import {SideNavItem} from './SideNavItem';

/**
 * The rail's collapse motion (`component:SideNav` FR6, `component:AppShell`
 * FR17): layout snaps, the rail reveals or covers by a clip, and the content's
 * old and new wrap slide and fade on one clock. jsdom has no layout or Web
 * Animations, so the rail's width comes from whether its labels render and
 * every animation is recorded.
 */

const SHELL_WIDTH = 1024;
const EXPANDED = 260;
const COLLAPSED = 48;

interface Recorded {
  element: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  animation: {finish: () => void; cancel: () => void; startTime: number | null};
}

let recorded: Recorded[] = [];
let media: Record<string, boolean> = {};

/** The real rail (not a copy): collapsed rows carry their label as a name. */
function realNav(): Element | undefined {
  return Array.from(document.querySelectorAll('nav')).find(
    nav => nav.closest('[inert]') == null,
  );
}

function railWidth(): number {
  return realNav()?.querySelector('button[aria-label="Projects"]') != null
    ? COLLAPSED
    : EXPANDED;
}

function rect(left: number, width: number): DOMRect {
  return DOMRect.fromRect({x: left, y: 0, width, height: 600});
}

beforeEach(() => {
  recorded = [];
  media = {};
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: media[query] ?? false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }));
  Object.defineProperty(document, 'timeline', {
    configurable: true,
    value: {currentTime: 1000},
  });
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: HTMLElement) {
      const width = railWidth();
      if (this.closest('[inert]') != null) {
        return rect(0, 0);
      }
      const nav = realNav();
      if (nav != null && (this === nav || this.contains(nav))) {
        return rect(0, width);
      }
      if (this.getAttribute('role') === 'main') {
        return rect(width, SHELL_WIDTH - width);
      }
      return rect(0, 0);
    },
  );
  (HTMLElement.prototype as unknown as {animate: unknown}).animate = function (
    this: Element,
    keyframes: Keyframe[],
    options: KeyframeAnimationOptions,
  ) {
    const listeners: (() => void)[] = [];
    const animation = {
      startTime: null as number | null,
      finished: {then: () => undefined},
      onfinish: null as null | (() => void),
      addEventListener: (_type: string, listener: () => void) => {
        listeners.push(listener);
      },
      finish() {
        listeners.forEach(listener => listener());
        animation.onfinish?.();
      },
      cancel() {},
    };
    recorded.push({element: this, keyframes, options, animation});
    return animation;
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as unknown as {animate?: unknown}).animate;
});

function Shell({inShell = true}: {inShell?: boolean}) {
  const nav = (
    <SideNav collapsible>
      <SideNavItem label="Home" icon={<svg aria-hidden="true" />} />
      <SideNavItem label="Projects" icon={<svg aria-hidden="true" />} />
    </SideNav>
  );
  return inShell ? (
    <AppShell height="fill" mobileNav={{breakpoint: 'none'}} sideNav={nav}>
      <h1>Projects page</h1>
      <p>The page beside the rail.</p>
    </AppShell>
  ) : (
    nav
  );
}

function toggle() {
  const button = screen.getByRole('button', {name: /collapse|expand/i});
  act(() => {
    fireEvent.click(button);
  });
}

function animated(property: string): Recorded[] {
  return recorded.filter(entry =>
    entry.keyframes.some(frame => property in frame),
  );
}

function copies(): Element[] {
  return Array.from(document.querySelectorAll('[aria-hidden="true"][inert]'));
}

describe('SideNav rail motion (component:SideNav FR6, component:AppShell FR17)', () => {
  it('collapses by covering the old rail with a clip while the content slides, never animating a width', () => {
    render(<Shell />);
    toggle();

    expect(railWidth()).toBe(COLLAPSED);
    expect(animated('width')).toEqual([]);
    // The old rail's copy is covered by a clip from its full width to the
    // collapsed one.
    const [clip] = animated('clipPath');
    expect(clip.keyframes[0].clipPath).toMatch(
      /inset\(0(px)? 0(px)? 0(px)? 0(px)?\)/,
    );
    expect(clip.keyframes.at(-1)?.clipPath).toContain(
      `${EXPANDED - COLLAPSED}px`,
    );
    // The content column starts where it was and slides to its new place.
    const main = screen.getByRole('main');
    const [slide] = animated('translate').filter(
      entry => entry.element === main,
    );
    expect(slide.keyframes[0].translate).toBe(`${EXPANDED - COLLAPSED}px 0px`);
    expect(slide.keyframes.at(-1)?.translate).toBe('0px 0px');
    // Every part plays on one clock.
    const starts = new Set(recorded.map(entry => entry.animation.startTime));
    expect(starts).toEqual(new Set([1000]));
    const durations = new Set(recorded.map(entry => entry.options.duration));
    expect(durations.size).toBe(1);
  });

  it('cross-fades the content: the old wrap fades out over the new one, which fades in', () => {
    render(<Shell />);
    toggle();
    const main = screen.getByRole('main');
    const copy = Array.from(main.children).find(child =>
      child.hasAttribute('inert'),
    );
    expect(copy?.textContent).toContain('The page beside the rail.');
    const fadeOut = recorded.find(entry => entry.element === copy);
    expect(fadeOut?.keyframes[0].opacity).toBe(1);
    expect(fadeOut?.keyframes.at(-1)?.opacity).toBe(0);
    const heading = screen.getByRole('heading', {name: 'Projects page'});
    const fadeIn = recorded.find(entry => entry.element === heading);
    expect(fadeIn?.keyframes[0].opacity).toBe(0);
    expect(fadeIn?.keyframes.at(-1)?.opacity).toBe(1);
  });

  it('expands by revealing the real rail with a clip, applied before the first frame paints', () => {
    render(<Shell />);
    toggle();
    recorded.forEach(entry => entry.animation.finish());
    recorded = [];
    toggle();

    expect(railWidth()).toBe(EXPANDED);
    const reveal = animated('clipPath').find(
      entry => !entry.element.hasAttribute('inert'),
    );
    expect(reveal?.keyframes[0].clipPath).toContain(
      `${EXPANDED - COLLAPSED}px`,
    );
    expect(reveal?.keyframes.at(-1)?.clipPath).toMatch(
      /inset\(0(px)? 0(px)? 0(px)? 0(px)?\)/,
    );
    const main = screen.getByRole('main');
    const [slide] = animated('translate').filter(
      entry => entry.element === main,
    );
    expect(slide.keyframes[0].translate).toBe(`${COLLAPSED - EXPANDED}px 0px`);
  });

  it('leaves the real collapsed rail and no copies once the motion ends', () => {
    render(<Shell />);
    toggle();
    expect(copies().length).toBeGreaterThan(0);
    act(() => {
      recorded.forEach(entry => entry.animation.finish());
    });
    expect(copies()).toEqual([]);
    expect(railWidth()).toBe(COLLAPSED);
  });

  it('changes at once under Reduce Motion with a fine pointer (design:reduced-motion DR3)', () => {
    media['(prefers-reduced-motion: reduce)'] = true;
    render(<Shell />);
    toggle();
    expect(recorded).toEqual([]);
    expect(copies()).toEqual([]);
  });

  it('only cross-fades under Reduce Motion with a coarse pointer (design:reduced-motion DR2)', () => {
    media['(prefers-reduced-motion: reduce)'] = true;
    media['(pointer: coarse)'] = true;
    render(<Shell />);
    toggle();
    expect(recorded.length).toBeGreaterThan(0);
    for (const entry of recorded) {
      for (const frame of entry.keyframes) {
        expect(Object.keys(frame).filter(key => key !== 'offset')).toEqual([
          'opacity',
        ]);
      }
    }
  });

  it('outside AppShell, moves only the rail', () => {
    render(<Shell inShell={false} />);
    toggle();
    expect(animated('clipPath').length).toBeGreaterThan(0);
    expect(animated('translate')).toEqual([]);
  });

  it('changes at once without Web Animations', () => {
    delete (HTMLElement.prototype as unknown as {animate?: unknown}).animate;
    render(<Shell />);
    toggle();
    expect(railWidth()).toBe(COLLAPSED);
    expect(copies()).toEqual([]);
  });
});
