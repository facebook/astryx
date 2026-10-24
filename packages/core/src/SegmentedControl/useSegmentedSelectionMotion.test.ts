// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSegmentedSelectionMotion.test.ts
 * @input vitest, jsdom, SegmentedSelectionMotion with an animator on a
 *   scripted clock, stubbed segment geometry and a recording `animate`
 * @output The touch presentation's selection motion as a state machine: the
 *   proxy copies the selected surface and springs from the old segment's box
 *   to the new one's on the UIKit spring, hides the segment's own surface
 *   meanwhile and hands it back on landing; a change mid-flight keeps the
 *   presented position and velocity; resize, a cleared selection and Reduced
 *   Motion; the title cross-fade's twin, clock, curve and interruption swap.
 * @position Unit tests for useSegmentedSelectionMotion.ts. The browser proofs
 *   (real touch, seeked curves, busy main thread, Layout / Paint, pixels) are
 *   __tests__/SegmentedControl.interaction.browser.spec.ts.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createAnimator, type Animator} from '../motion/animator';
import {cubicBezier} from '../motion/bezier';
import {solveSpring, toSpring} from '../motion/spring';
import {segmentedControl} from '../motion/uikit';
import {
  SegmentedSelectionMotion,
  TITLE_SELECTOR,
  TITLE_TWIN_SELECTOR,
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

function setup(selected: string) {
  const track = document.createElement('div');
  track.getBoundingClientRect = () =>
    rect(TRACK.left, TRACK.top, TRACK.width, TRACK.height);
  Object.defineProperty(track, 'offsetWidth', {value: TRACK.width});
  const proxy = document.createElement('span');
  track.append(proxy);
  const segments: Record<string, HTMLElement> = {};
  for (const [value, geometry] of Object.entries(SEGMENTS)) {
    const segment = document.createElement('button');
    segment.setAttribute('role', 'radio');
    segment.dataset.value = value;
    segment.getBoundingClientRect = () =>
      rect(geometry.left, TRACK.top + 2, geometry.width, 27);
    const title = document.createElement('span');
    title.dataset.segmentTitle = 'text';
    title.textContent = value;
    const twin = document.createElement('span');
    twin.dataset.segmentTitle = 'twin';
    twin.textContent = value;
    segment.append(title, twin);
    track.append(segment);
    segments[value] = segment;
  }
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.append(style);
  document.body.append(track);
  const animator: Animator = createAnimator(null, {
    now: () => clock,
    prefersReducedMotion: () => reduceMotion,
  });
  const motion = new SegmentedSelectionMotion(animator, {
    now: () => clock,
    prefersReducedMotion: () => reduceMotion,
  });
  motion.attachProxy(proxy);
  paint(segments, selected);
  motion.rememberTitles(track);
  return {track, proxy, segments, animator, motion};
}

/**
 * The component's styles, as a stylesheet: the selected segment paints the
 * raised surface, and each title's rendering follows its segment's state.
 * (A stylesheet and not inline styles: the controller hides and restores the
 * surface inline, exactly as it does over the real component's classes.)
 */
const STYLES = `
  [role="radio"] { border-top-left-radius: 6px; }
  [role="radio"][aria-checked="true"] {
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px;
  }
  [role="radio"][aria-checked="false"] [data-segment-title="text"] {
    color: rgb(110, 110, 110);
    font-weight: 500;
  }
  [role="radio"][aria-checked="true"] [data-segment-title="text"] {
    color: rgb(10, 10, 10);
    font-weight: 600;
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

/** A segment's center in the track's padding-box coordinates. */
const centerOf = (value: string) =>
  SEGMENTS[value].left - TRACK.left + SEGMENTS[value].width / 2;

/** The proxy carries this segment's surface: hidden on the segment, inline. */
function expectHidden(segment: HTMLElement): void {
  expect(segment.style.getPropertyValue('background-color')).toBe(
    'transparent',
  );
}

/** The segment paints its own surface again: nothing inline, the stylesheet's paint. */
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
  vi.useRealTimers();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

async function advance(ms: number): Promise<void> {
  clock += ms;
  await vi.advanceTimersByTimeAsync(ms);
}

describe('the selection slide', () => {
  it('copies the selected surface onto the proxy and hides it on the segment', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    const {proxy, segments} = ctx;
    expect(proxy.style.visibility).toBe('visible');
    expect(proxy.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(proxy.style.boxShadow).toBe('rgba(0, 0, 0, 0.1) 0px 1px 2px');
    expect(proxy.style.borderTopLeftRadius).toBe('6px');
    // Inline and with priority, so a theme's rule cannot paint a second one.
    expect(segments.table.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    expect(segments.table.style.getPropertyPriority('background-color')).toBe(
      'important',
    );
    expect(segments.table.style.getPropertyValue('box-shadow')).toBe('none');
    // The proxy is laid out at the destination's size, at its offset.
    expect(proxy.style.width).toBe('106px');
    expect(proxy.style.height).toBe('27px');
    expect(proxy.style.top).toBe('2px');
  });

  it('hands the surface back to the segment when it lands', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    expect(ctx.motion.isSliding).toBe(true);
    await advance(400);
    expect(ctx.motion.isSliding).toBe(true);
    await advance(2000);
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.proxy.style.visibility).toBe('hidden');
    expectOwnSurface(ctx.segments.table);
  });

  it('a change mid-flight starts from what is on screen and keeps its velocity', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    await advance(80);
    // The proxy scales around its center: x is the center's offset from the
    // destination's center.
    const centerBefore = centerOf('table') + ctx.animator.get('x');
    const vBefore = ctx.animator.getVelocity('x');
    const widthBefore = ctx.animator.get('scaleX') * 106;
    expect(vBefore).toBeGreaterThan(500);
    select(ctx, 'table', 'list');
    // No jump and no lost velocity at the retarget.
    expect(centerOf('list') + ctx.animator.get('x')).toBeCloseTo(
      centerBefore,
      6,
    );
    expect(ctx.animator.getVelocity('x')).toBeCloseTo(vBefore, 3);
    expect(ctx.animator.get('scaleX') * 100).toBeCloseTo(widthBefore, 6);
    // The proxy now carries the new destination's surface and size; the
    // abandoned destination shows its own (unselected) paint again.
    expect(ctx.proxy.style.width).toBe('100px');
    expect(ctx.segments.table.style.getPropertyValue('background-color')).toBe(
      '',
    );
    expect(ctx.segments.list.style.getPropertyValue('background-color')).toBe(
      'transparent',
    );
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.list);
  });

  it('settle() hands the surface back at once (resize, unmount, presentation change)', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'list');
    ctx.motion.settle();
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.proxy.style.visibility).toBe('hidden');
    expectOwnSurface(ctx.segments.list);
  });

  it('stop() ends a slide and its fades, and leaves the controller usable (StrictMode remounts)', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    ctx.motion.stop();
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
    // The next change still slides, on the same proxy.
    select(ctx, 'table', 'list');
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.proxy.style.visibility).toBe('visible');
    expect(ctx.animator.get('x', clock)).toBeCloseTo(
      centerOf('table') - centerOf('list'),
      6,
    );
    expect(ctx.proxy.style.translate).not.toBe('');
  });

  it('does not slide when nothing was selected, and settles when the selection clears', () => {
    const ctx = setup('none');
    select(ctx, 'none', 'list');
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.proxy.style.visibility).toBe('');
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
    expect(ctx.proxy.style.width).toBe('106px');
    expect(ctx.animator.get('x', 5000)).toBeCloseTo(0, 6);
  });

  it('Reduced Motion: no travel; the surface fades and scales in at the destination on UIKit’s 0.2 s block', async () => {
    reduceMotion = true;
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    // At the destination from the first frame (centered there).
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.proxy.style.width).toBe('106px');
    expectHidden(ctx.segments.table);
    expectReducedMotionFade(ctx);
    await advance(1000);
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.proxy.style.visibility).toBe('hidden');
    expectOwnSurface(ctx.segments.table);
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
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.motion.isSliding).toBe(false);
  });
});

/**
 * The Reduce Motion fade from `clock`: opacity from 0 and a uniform scale
 * from `reducedMotion.scaleFrom` on one curve, with no travel.
 */
function expectReducedMotionFade(ctx: ReturnType<typeof setup>): void {
  const {reducedMotion} = segmentedControl;
  const ease = cubicBezier(reducedMotion.curve);
  for (const t of [0, 16, 50, 100, 150, 199]) {
    const p = ease(t / reducedMotion.fadeMs);
    expect(ctx.animator.get('opacity', clock + t)).toBeCloseTo(p, 4);
    expect(ctx.animator.get('scaleX', clock + t)).toBeCloseTo(
      reducedMotion.scaleFrom + (1 - reducedMotion.scaleFrom) * p,
      4,
    );
    expect(ctx.animator.get('scaleY', clock + t)).toBeCloseTo(
      ctx.animator.get('scaleX', clock + t),
      6,
    );
    expect(ctx.animator.get('x', clock + t)).toBe(0);
  }
}

/** Client x of a segment's center (the track starts at client x 10). */
const clientCenterOf = (value: string) =>
  SEGMENTS[value].left + SEGMENTS[value].width / 2;

describe('under a finger', () => {
  it('landing on the selected segment lifts the lens in place, by UIKit’s additive growth on the lift spring', () => {
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('grid'));
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.proxy.style.width).toBe('96px');
    expectHidden(ctx.segments.grid);
    const lift = solveSpring(toSpring(segmentedControl.liftSpring), {
      from: 96,
      to: 96 + 24,
      velocity: 0,
    });
    for (const t of [16, 50, 100, 200]) {
      expect(ctx.animator.get('scaleX', 1000 + t) * 96).toBeCloseTo(
        lift.value(t / 1000),
        6,
      );
    }
    // Centered: the position does not move.
    expect(ctx.animator.get('x', 1100)).toBe(0);
    expect(ctx.animator.get('scaleY', 3000) * 27).toBeCloseTo(27 + 16, 6);
  });

  it('a held lens stays lifted until the finger lets go, then comes down and hands back', async () => {
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('grid'));
    await advance(2000);
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.animator.get('scaleX')).toBeCloseTo(120 / 96, 6);
    expect(ctx.motion.release(clientCenterOf('grid'))).toBeNull();
    await advance(2000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
  });

  it('landing on another segment leaves the lens alone', () => {
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('table'));
    ctx.motion.drag(clientCenterOf('list'));
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.proxy.style.visibility).toBe('');
  });

  it('a drag carries the lens on the tracking spring, no further than 11 pt past the end segments', async () => {
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('grid'));
    ctx.motion.drag(clientCenterOf('list'));
    const chase = solveSpring(toSpring(segmentedControl.trackingSpring), {
      from: 0,
      to: centerOf('list') - centerOf('grid'),
      velocity: 0,
    });
    expect(ctx.animator.get('x', 1050)).toBeCloseTo(chase.value(0.05), 6);
    await advance(1000);
    expect(ctx.animator.get('x')).toBeCloseTo(
      centerOf('list') - centerOf('grid'),
      6,
    );
    // Far past the last segment: clamped.
    ctx.motion.drag(500);
    await advance(1000);
    expect(ctx.animator.get('x')).toBeCloseTo(
      centerOf('table') + segmentedControl.dragOvershoot - centerOf('grid'),
      6,
    );
    // Still lifted throughout.
    expect(ctx.animator.get('scaleX')).toBeCloseTo(120 / 96, 6);
  });

  it('letting go commits the segment nearest the finger: 40 % of the way stays, 60 % moves', async () => {
    const forty = setup('grid');
    const at = (p: number) =>
      clientCenterOf('grid') +
      (clientCenterOf('list') - clientCenterOf('grid')) * p;
    forty.motion.press(forty.track, clientCenterOf('grid'));
    forty.motion.drag(at(0.4));
    await advance(500);
    expect(forty.motion.release(at(0.4))).toBeNull();
    await advance(3000);
    expect(forty.animator.get('x')).toBe(0);
    expect(forty.motion.isSliding).toBe(false);
    expectOwnSurface(forty.segments.grid);
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    const sixty = setup('grid');
    sixty.motion.press(sixty.track, clientCenterOf('grid'));
    sixty.motion.drag(at(0.6));
    await advance(500);
    const centerAtLift = centerOf('grid') + sixty.animator.get('x');
    expect(sixty.motion.release(at(0.6))).toBe('list');
    // The lens re-bases onto the destination without a jump, then springs
    // there on the slide spring while it comes down on the lift spring.
    expect(centerOf('list') + sixty.animator.get('x')).toBeCloseTo(
      centerAtLift,
      6,
    );
    expect(sixty.proxy.style.width).toBe('100px');
    // Until the new value comes back, the old selection's paint is carried.
    expectHidden(sixty.segments.grid);
    select(sixty, 'grid', 'list');
    expectHidden(sixty.segments.list);
    expect(sixty.segments.grid.style.getPropertyValue('background-color')).toBe(
      '',
    );
    await advance(3000);
    expect(sixty.animator.get('x')).toBe(0);
    expect(sixty.animator.get('scaleX')).toBe(1);
    expect(sixty.motion.isSliding).toBe(false);
    expectOwnSurface(sixty.segments.list);
  });

  it('a tap on another segment slides there lifted, coming down after the hang', async () => {
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('table'));
    expect(ctx.motion.release(clientCenterOf('table'))).toBe('table');
    select(ctx, 'grid', 'table');
    const travel = solveSpring(toSpring(segmentedControl.selectionSpring), {
      from: centerOf('grid') - centerOf('table'),
      to: 0,
      velocity: 0,
    });
    expect(ctx.animator.get('x', 1100)).toBeCloseTo(travel.value(0.1), 6);
    // Lifted toward the destination's lifted size...
    await advance(segmentedControl.tapLiftHangMs - 10);
    expect(ctx.animator.get('scaleX') * 106).toBeGreaterThan(106 + 12);
    // ...then down again while still travelling.
    await advance(30);
    await advance(2000);
    expect(ctx.animator.get('scaleX')).toBe(1);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
  });

  it('a cancelled touch puts the lens back', async () => {
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('grid'));
    ctx.motion.drag(clientCenterOf('table'));
    await advance(200);
    ctx.motion.cancel();
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.animator.get('scaleX')).toBe(1);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
  });

  it('never commits a disabled segment', () => {
    const ctx = setup('grid');
    ctx.segments.table.setAttribute('aria-disabled', 'true');
    ctx.motion.press(ctx.track, clientCenterOf('table'));
    expect(ctx.motion.release(clientCenterOf('table'))).toBeNull();
  });

  it('Reduced Motion: no lift, no chase; the drag commits at the lift and the lens fades and scales in there', async () => {
    reduceMotion = true;
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('grid'));
    expect(ctx.motion.isSliding).toBe(false);
    // The lens stays parked on the selected segment while the finger moves.
    ctx.motion.drag(clientCenterOf('list'));
    ctx.motion.drag(clientCenterOf('table'));
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
    // The segment under the finger at the lift is committed...
    expect(ctx.motion.release(clientCenterOf('table'))).toBe('table');
    // ...and the lens appears there with UIKit's fade and scale-in.
    expect(ctx.proxy.style.width).toBe('106px');
    expectReducedMotionFade(ctx);
    select(ctx, 'grid', 'table');
    expectHidden(ctx.segments.table);
    await advance(1000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
  });

  it('Reduced Motion: a hold and a lift on the selected segment change nothing', () => {
    reduceMotion = true;
    const ctx = setup('grid');
    ctx.motion.press(ctx.track, clientCenterOf('grid'));
    expect(ctx.motion.release(clientCenterOf('grid'))).toBeNull();
    expect(ctx.motion.isSliding).toBe(false);
  });
});

describe('the title cross-fade', () => {
  interface Recorded {
    element: HTMLElement;
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    cancel: ReturnType<typeof vi.fn>;
    finish: () => void;
  }
  let recorded: Recorded[] = [];
  const realAnimate = HTMLElement.prototype.animate;

  beforeEach(() => {
    recorded = [];
    HTMLElement.prototype.animate = function (
      this: HTMLElement,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      let resolve: () => void = () => {};
      let reject: (error: Error) => void = () => {};
      const finished = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      // The cancel rejection is the interrupting change's business; keep it
      // from surfacing as an unhandled rejection in the test run.
      finished.catch(() => {});
      const cancel = vi.fn(() => reject(new Error('AbortError')));
      if (this.dataset.segmentTitle == null) {
        // The animator's own compositor animations on the proxy.
        return {finished, cancel, startTime: null} as unknown as Animation;
      }
      recorded.push({
        element: this,
        keyframes: keyframes as Keyframe[],
        options: options as KeyframeAnimationOptions,
        cancel,
        finish: resolve,
      });
      return {finished, cancel} as unknown as Animation;
    };
  });

  afterEach(() => {
    HTMLElement.prototype.animate = realAnimate;
  });

  const layers = (segment: HTMLElement) => ({
    title: segment.querySelector<HTMLElement>(TITLE_SELECTOR)!,
    twin: segment.querySelector<HTMLElement>(TITLE_TWIN_SELECTOR)!,
  });

  it('the twin shows the outgoing rendering and fades out as the title fades in, 200 ms on CSS ease', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    const grid = layers(ctx.segments.grid);
    const table = layers(ctx.segments.table);
    // The old selection fades out its selected rendering...
    expect(grid.twin.style.visibility).toBe('visible');
    expect(grid.twin.style.color).toBe('rgb(10, 10, 10)');
    expect(grid.twin.style.fontWeight).toBe('600');
    // ...and the new one its unselected rendering.
    expect(table.twin.style.color).toBe('rgb(110, 110, 110)');
    expect(table.twin.style.fontWeight).toBe('500');
    const of = (element: HTMLElement) =>
      recorded.find(r => r.element === element)!;
    for (const layer of [grid, table]) {
      expect(of(layer.twin).keyframes).toEqual([{opacity: 1}, {opacity: 0}]);
      expect(of(layer.twin).options.fill).toBe('forwards');
      expect(of(layer.title).keyframes).toEqual([{opacity: 0}, {opacity: 1}]);
      expect(of(layer.title).options.fill).toBe('forwards');
      for (const element of [layer.twin, layer.title]) {
        expect(of(element).options.duration).toBe(200);
        expect(of(element).options.easing).toBe(
          'cubic-bezier(0.25, 0.1, 0.25, 1)',
        );
      }
    }
  });

  it('mid-slide, a finished fade keeps its invisible twin until the hand-back', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    for (const r of recorded) {
      r.finish();
    }
    await vi.advanceTimersByTimeAsync(0);
    // The slide is still travelling: no restyle yet (the twin holds opacity 0).
    expect(ctx.motion.isSliding).toBe(true);
    expect(layers(ctx.segments.table).twin.style.visibility).toBe('visible');
    ctx.motion.settle();
    for (const segment of [ctx.segments.grid, ctx.segments.table]) {
      const {twin} = layers(segment);
      expect(twin.style.visibility).toBe('');
      expect(twin.style.color).toBe('');
      expect(twin.style.fontWeight).toBe('');
    }
  });

  it('with no slide running, the twin is hidden again as soon as the fade ends', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    // The surface handed back before the titles finish (a resize, say).
    ctx.motion.settle();
    expect(ctx.motion.isSliding).toBe(false);
    for (const r of recorded) {
      r.finish();
    }
    await vi.advanceTimersByTimeAsync(0);
    for (const segment of [ctx.segments.grid, ctx.segments.table]) {
      const {twin} = layers(segment);
      expect(twin.style.visibility).toBe('');
      expect(twin.style.fontWeight).toBe('');
    }
  });

  it('an interrupted fade swaps the layers and continues from the opacities on screen', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    const table = layers(ctx.segments.table);
    // 40% of the way: the title (selected) at 0.4, the twin (unselected) at 0.6.
    table.title.style.opacity = '0.4';
    table.twin.style.opacity = '0.6';
    recorded = [];
    select(ctx, 'table', 'grid');
    const of = (element: HTMLElement) =>
      recorded.find(r => r.element === element)!;
    // The twin now shows the selected rendering it was fading in, from 0.4...
    expect(table.twin.style.color).toBe('rgb(10, 10, 10)');
    expect(of(table.twin).keyframes).toEqual([{opacity: 0.4}, {opacity: 0}]);
    // ...and the title, now unselected, comes back from 0.6.
    expect(of(table.title).keyframes).toEqual([{opacity: 0.6}, {opacity: 1}]);
  });

  it('a segment without a title (icon only) is left alone', () => {
    const ctx = setup('grid');
    ctx.segments.table.querySelector(TITLE_SELECTOR)?.remove();
    select(ctx, 'grid', 'table');
    expect(recorded.map(r => r.element.parentElement)).toEqual([
      ctx.segments.grid,
      ctx.segments.grid,
    ]);
  });
});
