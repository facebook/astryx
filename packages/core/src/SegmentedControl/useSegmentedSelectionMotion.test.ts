// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSegmentedSelectionMotion.test.ts
 * @input vitest, jsdom, SegmentedSelectionMotion with an animator on a
 *   scripted clock, stubbed segment geometry and a recording `animate`
 * @output The touch presentation's selection motion as a state machine: the
 *   lens (the radiogroup's ::before) is painted from the selected surface and
 *   springs from the old segment's box to the new one's on the UIKit spring,
 *   the segment's own surface hidden meanwhile and handed back on landing; a
 *   change mid-flight keeps the presented position and velocity; resize, a
 *   cleared selection and Reduced Motion (the ::after fading out where it is).
 * @position Unit tests for useSegmentedSelectionMotion.ts. The browser proofs
 *   (real touch, seeked curves, busy main thread, Layout / Paint, pixels) are
 *   __tests__/SegmentedControl.interaction.browser.spec.ts.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createAnimator, type Animator} from '../motion/animator';
import {
  SegmentedSelectionMotion,
  layerVariable,
  type Layer,
} from './useSegmentedSelectionMotion';

interface Geometry {
  left: number;
  width: number;
}

// The track sits at (10, 20) in the viewport; segments are 27 px tall, 2 px
// below its padding edge. Unequal widths, like a hug layout.
const TRACK = {left: 10, top: 20, width: 306, height: 31};
const SEGMENTS: Record<string, Geometry> = {
  grid: {left: 12, width: 96},
  list: {left: 108, width: 100},
  table: {left: 208, width: 106},
};

function rect(left: number, top: number, width: number, height: number) {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

let clock = 0;
let reduceMotion = false;

/**
 * The person's settings, through `matchMedia` as the animator reads them (no
 * option overrides them): Reduce Motion as `reduceMotion` says at each read,
 * and a coarse primary pointer or not.
 */
function stubMedia(coarse: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion')
      ? reduceMotion
      : query.includes('pointer: coarse')
        ? coarse
        : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

function setup(selected: string, {coarse = true}: {coarse?: boolean} = {}) {
  stubMedia(coarse);
  const track = document.createElement('div');
  track.getBoundingClientRect = () =>
    rect(TRACK.left, TRACK.top, TRACK.width, TRACK.height);
  Object.defineProperty(track, 'offsetWidth', {
    value: TRACK.width,
    configurable: true,
  });
  const segments: Record<string, HTMLElement> = {};
  for (const [value, geometry] of Object.entries(SEGMENTS)) {
    const segment = document.createElement('button');
    segment.setAttribute('role', 'radio');
    segment.dataset.value = value;
    segment.getBoundingClientRect = () =>
      rect(geometry.left, TRACK.top + 2, geometry.width, 27);
    segment.textContent = value;
    track.append(segment);
    segments[value] = segment;
  }
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.append(style);
  document.body.append(track);
  // A finger by default: Reduced Motion fades (design:reduced-motion DR2).
  const animator: Animator = createAnimator(null, {
    now: () => clock,
    pseudoElement: '::before',
  });
  const leavingAnimator: Animator = createAnimator(null, {
    now: () => clock,
    pseudoElement: '::after',
  });
  const motion = new SegmentedSelectionMotion(animator, {
    now: () => clock,
    leavingAnimator,
  });
  motion.attachTrack(track);
  paint(segments, selected);
  /** A custom property of one of the radiogroup's pseudo-element layers. */
  const layer = (name: Layer, property: string) =>
    track.style.getPropertyValue(layerVariable(name, property));
  return {track, segments, animator, leavingAnimator, motion, layer};
}

/**
 * The component's styles, as a stylesheet: the selected segment paints the
 * raised surface. (A stylesheet and not inline styles: the controller hides
 * and restores the surface inline, exactly as it does over the real
 * component's classes.)
 */
const STYLES = `
  [role="radio"] { border-top-left-radius: 6px; }
  [role="radio"][aria-checked="true"] {
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
  }
`;

/** What a selection does to the DOM: the checked state moves. */
function paint(segments: Record<string, HTMLElement>, selected: string) {
  for (const [value, segment] of Object.entries(segments)) {
    segment.setAttribute('aria-checked', String(value === selected));
  }
}

function select(ctx: ReturnType<typeof setup>, from: string, to: string): void {
  paint(ctx.segments, to);
  ctx.motion.select(ctx.track, from, to);
}

const xOf = (value: string) => SEGMENTS[value].left - TRACK.left;

/** The lens carries this segment's surface: hidden on the segment, inline. */
function expectHidden(segment: HTMLElement): void {
  expect(segment.style.getPropertyValue('background-color')).toBe(
    'transparent',
  );
}

/** The segment paints its own surface again: nothing inline, the stylesheet's paint. */
/** No inline surface override is left on the segment. */
function expectNoOverride(segment: HTMLElement): void {
  expect(segment.style.getPropertyValue('background-color')).toBe('');
  expect(segment.style.getPropertyValue('background-image')).toBe('');
  expect(segment.style.getPropertyValue('box-shadow')).toBe('');
}

function expectOwnSurface(segment: HTMLElement): void {
  expect(segment.style.getPropertyValue('background-color')).toBe('');
  expect(segment.style.getPropertyValue('box-shadow')).toBe('');
  expect(getComputedStyle(segment).backgroundColor).toBe('rgb(255, 255, 255)');
}

beforeEach(() => {
  clock = 1000;
  reduceMotion = false;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

async function advance(ms: number): Promise<void> {
  clock += ms;
  await vi.advanceTimersByTimeAsync(ms);
}

describe('the selection slide', () => {
  it('paints the lens (the radiogroup’s ::before) with the selected surface and hides it on the segment: no element is added', () => {
    const ctx = setup('grid');
    const elements = ctx.track.querySelectorAll('*').length;
    select(ctx, 'grid', 'table');
    const {layer, segments} = ctx;
    expect(ctx.track.querySelectorAll('*').length).toBe(elements);
    expect(layer('lens', 'visibility')).toBe('visible');
    expect(layer('lens', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(layer('lens', 'box-shadow')).toBe('rgba(0, 0, 0, 0.1) 0px 1px 2px');
    expect(layer('lens', 'border-top-left-radius')).toBe('6px');
    // Inline and with priority, so a theme's rule cannot paint a second one.
    expect(segments.table.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    expect(segments.table.style.getPropertyPriority('background-color')).toBe(
      'important',
    );
    expect(segments.table.style.getPropertyValue('box-shadow')).toBe('none');
    // The lens is laid out at the destination's size, at its offset.
    expect(layer('lens', 'width')).toBe('106px');
    expect(layer('lens', 'height')).toBe('27px');
    expect(layer('lens', 'top')).toBe('2px');
  });

  it('hands the surface back to the segment when it lands', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    expect(ctx.motion.isSliding).toBe(true);
    await advance(400);
    expect(ctx.motion.isSliding).toBe(true);
    await advance(2000);
    expect(ctx.motion.isSliding).toBe(false);
    // Hidden again, its custom properties gone.
    expect(ctx.layer('lens', 'visibility')).toBe('');
    expect(ctx.layer('lens', 'background-color')).toBe('');
    expectOwnSurface(ctx.segments.table);
  });

  it('the hand-back restores a segment’s own inline surface (its `style`)', async () => {
    const ctx = setup('grid');
    const {table, list} = ctx.segments;
    table.style.setProperty('background-color', 'gold', 'important');
    table.style.setProperty('border-top-color', 'red');
    select(ctx, 'grid', 'table');
    // Hidden while the lens carries the surface...
    expect(table.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    await advance(2400);
    expect(ctx.motion.isSliding).toBe(false);
    // ...then the segment's own declarations come back, priority included,
    // and nothing it did not have is left behind.
    expect(table.style.getPropertyValue('background-color')).toBe('gold');
    expect(table.style.getPropertyPriority('background-color')).toBe(
      'important',
    );
    expect(table.style.getPropertyValue('border-top-color')).toBe('red');
    expect(table.style.getPropertyPriority('border-top-color')).toBe('');
    expect(table.style.getPropertyValue('background-image')).toBe('');
    expect(table.style.getPropertyValue('box-shadow')).toBe('');
    // A segment the slide never hid keeps its inline surface too.
    list.style.setProperty('background-color', 'teal');
    select(ctx, 'table', 'grid');
    ctx.motion.settle();
    expect(list.style.getPropertyValue('background-color')).toBe('teal');
  });

  it('a change mid-flight starts from what is on screen and keeps its velocity', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    await advance(80);
    const xBefore = ctx.animator.get('x');
    const vBefore = ctx.animator.getVelocity('x');
    const widthBefore = ctx.animator.get('scaleX') * 106;
    expect(vBefore).toBeGreaterThan(500);
    select(ctx, 'table', 'list');
    // No jump and no lost velocity at the retarget.
    expect(ctx.animator.get('x')).toBeCloseTo(xBefore, 6);
    expect(ctx.animator.getVelocity('x')).toBeCloseTo(vBefore, 3);
    expect(ctx.animator.get('scaleX') * 100).toBeCloseTo(widthBefore, 6);
    // The lens now carries the new destination's surface and size. The
    // abandoned destination paints nothing of its own until the lens lands:
    // its tap may still be fading, and that paint would cover the lens.
    expect(ctx.layer('lens', 'width')).toBe('100px');
    expect(ctx.segments.table.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    expect(ctx.segments.table.style.getPropertyValue('background-image')).toBe(
      'none',
    );
    expect(ctx.segments.list.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(xOf('list'));
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.list);
    expectNoOverride(ctx.segments.table);
  });

  it('a change back to the abandoned segment takes it as the destination again', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    await advance(80);
    select(ctx, 'table', 'list');
    await advance(40);
    select(ctx, 'list', 'table');
    expect(ctx.segments.table.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    // Its paint is read with its surface shown, not the hidden one.
    expect(ctx.layer('lens', 'background-color')).toBe('rgb(255, 255, 255)');
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(xOf('table'));
    expectOwnSurface(ctx.segments.table);
    expectNoOverride(ctx.segments.list);
  });

  it('a resize the change itself made (a title’s new weight) keeps the slide; any other resize hands the surface back', () => {
    const ctx = setup('grid');
    let width = TRACK.width;
    Object.defineProperty(ctx.track, 'offsetWidth', {get: () => width});
    select(ctx, 'grid', 'table');
    // The observer reports the size the boxes were measured at.
    ctx.motion.resized(ctx.track);
    expect(ctx.motion.isSliding).toBe(true);
    // The control resizes under the slide.
    width += 40;
    ctx.motion.resized(ctx.track);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
  });

  it('settle() hands the surface back at once (resize, unmount, presentation change)', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'list');
    ctx.motion.settle();
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.layer('lens', 'visibility')).toBe('');
    expectOwnSurface(ctx.segments.list);
  });

  it('stop() ends a slide and leaves the controller usable (StrictMode remounts)', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    ctx.motion.stop();
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
    // The next change still slides, on the same lens.
    select(ctx, 'table', 'list');
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.layer('lens', 'visibility')).toBe('visible');
    expect(ctx.animator.get('x', clock)).toBe(xOf('table'));
  });

  it('does not slide when nothing was selected, and settles when the selection clears', () => {
    const ctx = setup('none');
    select(ctx, 'none', 'list');
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.layer('lens', 'visibility')).toBe('');
    select(ctx, 'list', 'grid');
    expect(ctx.motion.isSliding).toBe(true);
    select(ctx, 'grid', 'none');
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.segments.grid.style.getPropertyValue('background-color')).toBe(
      '',
    );
  });

  it('does not slide a control that is not laid out', () => {
    const ctx = setup('grid');
    ctx.segments.table.getBoundingClientRect = () => rect(0, 0, 0, 0);
    select(ctx, 'grid', 'table');
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
  });

  it('undoes an ancestor scale: boxes are measured in the track’s own pixels', () => {
    const ctx = setup('grid');
    // Rendered at 2x by a transformed ancestor: client rects double.
    ctx.track.getBoundingClientRect = () =>
      rect(TRACK.left, TRACK.top, TRACK.width * 2, TRACK.height * 2);
    for (const [value, geometry] of Object.entries(SEGMENTS)) {
      ctx.segments[value].getBoundingClientRect = () =>
        rect(
          TRACK.left + (geometry.left - TRACK.left) * 2,
          TRACK.top + 4,
          geometry.width * 2,
          54,
        );
    }
    select(ctx, 'grid', 'table');
    expect(ctx.layer('lens', 'width')).toBe('106px');
    expect(ctx.animator.get('x', 5000)).toBeCloseTo(xOf('table'), 6);
  });

  it('Reduced Motion off again: the next change slides at full size and opacity', async () => {
    reduceMotion = true;
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    await advance(50);
    // Turned off mid-fade: the next change travels, opaque and unscaled.
    reduceMotion = false;
    ctx.motion.settle();
    select(ctx, 'table', 'list');
    expect(ctx.animator.get('opacity')).toBe(1);
    expect(ctx.animator.get('scaleY')).toBe(1);
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(xOf('list'));
  });
});

/** One step of the style traffic `recordStyleTraffic` records. */
type StyleEvent =
  | {kind: 'take'; style: CSSStyleDeclaration}
  | {kind: 'read'; style: CSSStyleDeclaration}
  | {kind: 'write'};

describe('style reads at a change', () => {
  /**
   * Records, in order, each computed-style declaration taken, every value
   * read from one, and every write to the track's inline style. A read from
   * a declaration after a write to the track since it was taken makes the
   * browser recompute style for it (a forced restyle).
   */
  function recordStyleTraffic(track: HTMLElement) {
    const events: StyleEvent[] = [];
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.stubGlobal(
      'getComputedStyle',
      (
        element: Element,
        pseudoElement?: string | null,
      ): CSSStyleDeclaration => {
        const style = realGetComputedStyle(element, pseudoElement);
        events.push({kind: 'take', style});
        const readValue = (name: string): string => {
          events.push({kind: 'read', style});
          return style.getPropertyValue(name);
        };
        return new Proxy(style, {
          // `getPropertyValue` and a property (`style.opacity`) both read.
          get(target, key): string | ((name: string) => string) | undefined {
            if (key === 'getPropertyValue') {
              return readValue;
            }
            if (typeof key !== 'string') {
              return undefined;
            }
            events.push({kind: 'read', style: target});
            const value = Reflect.get(target, key, target) as unknown;
            return typeof value === 'string' ? value : undefined;
          },
        });
      },
    );
    const setProperty = track.style.setProperty.bind(track.style);
    track.style.setProperty = (
      name: string,
      value: string | null,
      priority?: string,
    ) => {
      events.push({kind: 'write'});
      setProperty(name, value, priority);
    };
    /** Reads that follow a track write made after their declaration was taken. */
    return () => {
      const takenAt = new Map<CSSStyleDeclaration, number>();
      let reads = 0;
      let forced = 0;
      events.forEach((event, index) => {
        if (event.kind === 'take') {
          takenAt.set(event.style, index);
        } else if (event.kind === 'read') {
          reads += 1;
          const from = takenAt.get(event.style) ?? 0;
          if (events.slice(from, index).some(e => e.kind === 'write')) {
            forced += 1;
          }
        }
      });
      return {reads, forced};
    };
  }

  it('reads a segment’s whole surface before writing any of it to the track: no read follows a write, so a change restyles once, not once per property', () => {
    reduceMotion = true;
    const ctx = setup('grid');
    const traffic = recordStyleTraffic(ctx.track);
    // Under Reduce Motion a change paints both layers: the lens and the
    // surface leaving.
    select(ctx, 'grid', 'table');
    const {reads, forced} = traffic();
    expect(reads).toBeGreaterThan(0);
    expect(forced).toBe(0);
    expect(ctx.layer('lens', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(ctx.layer('leaving', 'background-color')).toBe('rgb(255, 255, 255)');
  });
});

describe('Reduced Motion (design:reduced-motion)', () => {
  /** The ::after layer shows the surface that fades out where it is. */
  const isLeaving = (ctx: ReturnType<typeof setup>) =>
    ctx.layer('leaving', 'visibility') === 'visible';

  /** design:reduced-motion DR2: a cross-fade, opacity only, 200 ms or less. */
  const MAX_FADE_MS = 200;

  /** When `get` stops changing: the end of the fade, in ms after the change. */
  function endOf(get: (t: number) => number, start: number): number {
    const last = get(start + 5000);
    for (let t = 0; t <= 5000; t += 1) {
      if (Math.abs(get(start + t) - last) < 1e-6) {
        return t;
      }
    }
    return Infinity;
  }

  it('no travel and no scale: the old surface fades out where it is as the new one fades in, opacity only, in 200 ms or less (DR1, DR2)', async () => {
    reduceMotion = true;
    const ctx = setup('grid');
    const start = clock;
    select(ctx, 'grid', 'table');
    // The new surface: at Table, full size, from the first frame; it only
    // fades in.
    expect(ctx.layer('lens', 'width')).toBe('106px');
    expectHidden(ctx.segments.table);
    const entering = (t: number) => ctx.animator.get('opacity', t);
    const fadeIn = endOf(entering, start);
    expect(fadeIn).toBeGreaterThan(0);
    expect(fadeIn).toBeLessThanOrEqual(MAX_FADE_MS);
    expect(entering(start)).toBeCloseTo(0, 6);
    expect(entering(start + fadeIn)).toBeCloseTo(1, 6);
    for (let t = 0; t <= fadeIn; t += 10) {
      expect(ctx.animator.get('x', start + t)).toBe(xOf('table'));
      expect(ctx.animator.get('scaleX', start + t)).toBe(1);
      expect(ctx.animator.get('scaleY', start + t)).toBe(1);
    }
    // The old surface: the radiogroup's ::after, painted with the selected
    // surface at Grid, fading out where it is on the same clock. No element
    // is added for it.
    expect(isLeaving(ctx)).toBe(true);
    expect(ctx.layer('leaving', 'width')).toBe(`${SEGMENTS.grid.width}px`);
    expect(ctx.layer('leaving', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(ctx.track.querySelectorAll('*').length).toBe(3);
    const leavingOpacity = (t: number) => ctx.leavingAnimator.get('opacity', t);
    expect(leavingOpacity(start)).toBeCloseTo(1, 6);
    expect(endOf(leavingOpacity, start)).toBe(fadeIn);
    expect(leavingOpacity(start + fadeIn)).toBeCloseTo(0, 6);
    for (let t = 0; t < fadeIn; t += 10) {
      // Where it is while it shows, and the two always add up to one surface.
      expect(ctx.leavingAnimator.get('x', start + t)).toBe(xOf('grid'));
      expect(entering(start + t) + leavingOpacity(start + t)).toBeCloseTo(1, 6);
    }
    await advance(1000);
    expect(isLeaving(ctx)).toBe(false);
    expect(ctx.layer('leaving', 'background-color')).toBe('');
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.layer('lens', 'visibility')).toBe('');
    expectOwnSurface(ctx.segments.table);
  });

  it('a change mid-fade fades the surface out from the opacity on screen, where it is', async () => {
    reduceMotion = true;
    const ctx = setup('grid');
    const start = clock;
    select(ctx, 'grid', 'table');
    // Halfway through the fade, whatever its clock.
    await advance(endOf(t => ctx.animator.get('opacity', t), start) / 2);
    const opacity = ctx.animator.get('opacity');
    expect(opacity).toBeGreaterThan(0.05);
    expect(opacity).toBeLessThan(0.95);
    select(ctx, 'table', 'list');
    // The ::after now shows what was on screen, at Table, in the lens's
    // paint.
    expect(isLeaving(ctx)).toBe(true);
    expect(ctx.layer('leaving', 'background-color')).toBe('rgb(255, 255, 255)');
    expect(ctx.leavingAnimator.get('x')).toBe(xOf('table'));
    expect(ctx.leavingAnimator.get('opacity')).toBeCloseTo(opacity, 2);
    expect(ctx.animator.get('x')).toBe(xOf('list'));
  });

  it('the hand-back hides a leaving surface still on screen', () => {
    reduceMotion = true;
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    expect(isLeaving(ctx)).toBe(true);
    ctx.motion.settle();
    expect(isLeaving(ctx)).toBe(false);
  });

  it('with any other pointer the change completes at once: no fade, no leaving surface (DR3)', () => {
    reduceMotion = true;
    const ctx = setup('grid', {coarse: false});
    select(ctx, 'grid', 'table');
    expect(isLeaving(ctx)).toBe(false);
    expect(ctx.animator.get('x')).toBe(xOf('table'));
    expect(ctx.animator.get('opacity')).toBe(1);
    expect(ctx.animator.get('scaleX')).toBe(1);
  });

  it('without Reduce Motion there is no leaving surface: the lens slides', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    expect(isLeaving(ctx)).toBe(false);
    expect(ctx.animator.get('opacity')).toBe(1);
  });
});
