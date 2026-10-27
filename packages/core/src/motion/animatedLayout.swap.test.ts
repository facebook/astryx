// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file animatedLayout.swap.test.ts
 * @input vitest (jsdom), the animated-layout module, a recording stand-in for
 *   Element.animate
 * @output Checks the in-place swap (`spec:AST-105` FR8): one inert transient
 *   copy of old content that takes no part in the page, played on FR4's one
 *   motion with the incoming elements, opacity-only under Reduce Motion with
 *   a coarse pointer, nothing under an immediate change, and removed when the
 *   swap ends
 * @position Testing; the real geometry is proven by the adopters'
 *   real-browser frames
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  createAnimatedLayout,
  holdLayoutSwap,
  playLayoutSwap,
} from './animatedLayout';

interface Played {
  element: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  startTime: number | null;
  finish?: () => void;
}

let played: Played[] = [];
let media: Record<string, boolean> = {};
const originalAnimate = Element.prototype.animate;
const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  played = [];
  media = {};
  Object.defineProperty(document, 'timeline', {
    configurable: true,
    value: {currentTime: 500},
  });
  Element.prototype.animate = function (
    this: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ) {
    const entry: Played = {
      element: this,
      keyframes: keyframes as Keyframe[],
      options: options as KeyframeAnimationOptions,
      startTime: null,
    };
    played.push(entry);
    return {
      cancel: vi.fn(),
      addEventListener(type: string, listener: () => void) {
        if (type === 'finish') {
          entry.finish = listener;
        }
      },
      set startTime(value: number) {
        entry.startTime = value;
      },
    } as unknown as Animation;
  };
  window.matchMedia = (query: string) =>
    ({
      matches: media[query] === true,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as MediaQueryList;
});

afterEach(() => {
  Element.prototype.animate = originalAnimate;
  window.matchMedia = originalMatchMedia;
  document.body.innerHTML = '';
});

function setup() {
  document.body.innerHTML = `
    <div id="area">
      <div id="host">
        <main id="content" data-testid="main">
          <h2 id="title">Projects</h2>
          <label><input type="radio" name="plan" value="pro" checked /> Pro</label>
          <iframe src="about:blank"></iframe>
        </main>
      </div>
    </div>`;
  const area = document.getElementById('area') as HTMLElement;
  const handle = createAnimatedLayout(() => area);
  const content = document.getElementById('content') as HTMLElement;
  const host = document.getElementById('host') as HTMLElement;
  return {handle, content, host};
}

const travel = (p: number): Keyframe => ({
  opacity: 1 - p,
  translate: `${-200 * p}px 0px`,
});

describe('the in-place swap (spec:AST-105 FR8)', () => {
  it('holds old content as one inert copy that takes no part in the page', () => {
    const {handle, content} = setup();
    const swap = holdLayoutSwap(handle, content);
    expect(swap).not.toBeNull();
    const copy = swap?.copy as HTMLElement;
    expect(copy.getAttribute('aria-hidden')).toBe('true');
    expect(copy.hasAttribute('inert')).toBe(true);
    expect(copy.querySelector('[id]')).toBeNull();
    expect(copy.querySelector('[data-testid]')).toBeNull();
    // A copied checked radio joins no group; a copied frame loads nothing.
    expect(copy.querySelector('input')?.hasAttribute('name')).toBe(false);
    expect(copy.querySelector('iframe')?.hasAttribute('src')).toBe(false);
    expect(copy.isConnected).toBe(false);
  });

  it('plays the copy out and the incoming elements in on one motion, then removes the copy', () => {
    const {handle, content, host} = setup();
    const swap = holdLayoutSwap(handle, content);
    const title = document.getElementById('title') as HTMLElement;
    const end = playLayoutSwap(swap!, {
      host,
      copy: travel,
      incoming: [{element: title, frames: p => ({opacity: p})}],
    });
    const copy = swap!.copy;
    expect(copy.parentElement).toBe(host);
    const out = played.find(entry => entry.element === copy);
    expect(out?.keyframes[0]).toMatchObject({opacity: 1, translate: '0px 0px'});
    expect(out?.keyframes.at(-1)).toMatchObject({
      opacity: 0,
      translate: '-200px 0px',
    });
    const enter = played.find(entry => entry.element === title);
    expect(enter?.keyframes[0].opacity).toBe(0);
    expect(enter?.keyframes.at(-1)?.opacity).toBe(1);
    // One clock: the same duration, started on the same timeline time.
    expect(new Set(played.map(entry => entry.options.duration)).size).toBe(1);
    expect(new Set(played.map(entry => entry.startTime))).toEqual(
      new Set([500]),
    );
    played[0].finish?.();
    expect(copy.isConnected).toBe(false);
    expect(typeof end).toBe('function');
  });

  it("fades the copy's text on its own curve when asked", () => {
    const {handle, content, host} = setup();
    const swap = holdLayoutSwap(handle, content);
    playLayoutSwap(swap!, {
      host,
      copy: travel,
      copyText: p => 1 - Math.min(1, p / 0.4),
      incoming: [],
    });
    const text = played.find(
      entry =>
        entry.element !== swap!.copy &&
        entry.element.textContent?.trim() === 'Projects',
    );
    expect(text?.keyframes.at(-1)?.opacity).toBe(0);
  });

  it('copies only the visible part of a scroll container, scrolled as it was', () => {
    const {handle, content} = setup();
    Object.defineProperty(content, 'scrollTop', {value: 40});
    Object.defineProperty(content, 'clientWidth', {value: 600});
    Object.defineProperty(content, 'clientHeight', {value: 300});
    const swap = holdLayoutSwap(handle, content, {isVisiblePart: true});
    expect(swap?.rect.width).toBe(600);
    expect(swap?.rect.height).toBe(300);
    const inner = swap?.copy.firstElementChild as HTMLElement;
    expect(inner.style.top).toBe('-40px');
    expect(inner.style.width).toBe('600px');
    expect(inner.hasAttribute('role')).toBe(false);
  });

  it('only cross-fades under Reduce Motion with a coarse pointer (design:reduced-motion DR2)', () => {
    media['(prefers-reduced-motion: reduce)'] = true;
    media['(pointer: coarse)'] = true;
    const {handle, content, host} = setup();
    const swap = holdLayoutSwap(handle, content);
    const title = document.getElementById('title') as HTMLElement;
    playLayoutSwap(swap!, {
      host,
      copy: travel,
      copyText: () => 0,
      incoming: [{element: title, frames: p => ({opacity: p, scale: '2'})}],
    });
    expect(played.length).toBe(2);
    for (const entry of played) {
      for (const frame of entry.keyframes) {
        expect(Object.keys(frame)).toEqual(['opacity']);
      }
    }
  });

  it('holds nothing under Reduce Motion with a fine pointer, without a handle, or outside the area', () => {
    const {handle, content} = setup();
    expect(holdLayoutSwap(null, content)).toBeNull();
    const outside = document.createElement('div');
    document.body.append(outside);
    expect(holdLayoutSwap(handle, outside)).toBeNull();
    media['(prefers-reduced-motion: reduce)'] = true;
    expect(holdLayoutSwap(handle, content)).toBeNull();
    expect(played).toEqual([]);
  });
});
