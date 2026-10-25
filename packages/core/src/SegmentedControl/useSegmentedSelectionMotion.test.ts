// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useSegmentedSelectionMotion.test.ts
 * @input vitest, jsdom, SegmentedSelectionMotion with an animator on a
 *   scripted clock, stubbed segment geometry and a recording `animate`
 * @output The touch layer's selection motion as a state machine: the lens
 *   (the radiogroup's ::before) is painted from the selected surface and
 *   springs from the old segment's box to the new one's on the UIKit spring,
 *   the segment's own surface hidden meanwhile and handed back on landing; a
 *   change mid-flight keeps the presented position and velocity; resize, a
 *   cleared selection and Reduced Motion (the ::after fading out where it
 *   is); under a finger the lift, its shadow (the ::after), the chase, the
 *   commit at the lift and what happens when the value does not come back;
 *   the pressed title's dim and the face that follows a dragging finger.
 * @position Unit tests for useSegmentedSelectionMotion.ts. The browser proofs
 *   (real touch, seeked curves, busy main thread, Layout / Paint, pixels) are
 *   __tests__/SegmentedControl.interaction.browser.spec.ts.
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createAnimator, type Animator} from '../motion/animator';
import {solveSpring, toSpring} from '../motion/spring';
import {segmentedControl} from '../motion/uikit';
import {measureSegments, segmentTargetAt} from './useSegmentedTouchTracking';
import {
  SegmentedSelectionMotion,
  TITLE_SELECTOR,
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

function setup(selected: string, {coarse = true}: {coarse?: boolean} = {}) {
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
    const title = document.createElement('span');
    title.dataset.segmentTitle = '';
    title.textContent = value;
    segment.append(title);
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
    prefersReducedMotion: () => reduceMotion,
    isCoarsePointer: () => coarse,
    pseudoElement: '::before',
  });
  // The ::after: the lifted lens's shadow, or the surface fading out.
  const afterAnimator: Animator = createAnimator(null, {
    now: () => clock,
    prefersReducedMotion: () => reduceMotion,
    isCoarsePointer: () => coarse,
    pseudoElement: '::after',
    initial: {opacity: 0},
  });
  const motion = new SegmentedSelectionMotion(animator, {
    now: () => clock,
    afterAnimator,
  });
  motion.attachTrack(track);
  paint(segments, selected);
  /** A custom property of one of the radiogroup's pseudo-element layers. */
  const layer = (name: Layer, property: string) =>
    track.style.getPropertyValue(layerVariable(name, property));
  return {
    track,
    segments,
    animator,
    shadowAnimator: afterAnimator,
    leavingAnimator: afterAnimator,
    motion,
    layer,
  };
}

type Ctx = ReturnType<typeof setup>;

/** The segment the touch tracking resolves for a finger at `clientX`. */
function targetAt(ctx: Ctx, clientX: number): HTMLElement | null {
  return segmentTargetAt(clientX, measureSegments(ctx.track));
}

/** A finger lands at `clientX` (the tracker's begin, then the motion's). */
function begin(ctx: Ctx, clientX: number): void {
  ctx.motion.begin(ctx.track, targetAt(ctx, clientX));
}

/** A finger lands at `clientX` and the press is on at once. */
function press(ctx: Ctx, clientX: number): void {
  begin(ctx, clientX);
  ctx.motion.lift();
}

/** The finger moves to `clientX`: the lens chases, then the highlight moves. */
function drag(ctx: Ctx, clientX: number): void {
  ctx.motion.drag(clientX);
  ctx.motion.highlight(targetAt(ctx, clientX));
}

/** The finger lets go at `clientX`, on the segment the tracker resolves. */
function release(ctx: Ctx, clientX: number): string | null {
  return ctx.motion.release(targetAt(ctx, clientX));
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
  [role="radio"][aria-checked="false"] [data-segment-title] {
    color: rgb(110, 110, 110);
    font-weight: 500;
  }
  [role="radio"][aria-checked="true"] [data-segment-title] {
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
    // The lens is laid out on the destination's box.
    expect(layer('lens', 'left')).toBe('198px');
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
    expect(ctx.layer('lens', 'visibility')).toBe('');
    expectOwnSurface(ctx.segments.table);
  });

  it('a change mid-flight starts from what is on screen and keeps its velocity', async () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    await advance(80);
    // The lens scales around its center: x is the center's offset from the
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
    expect(ctx.animator.get('x')).toBe(0);
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
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
    expectNoOverride(ctx.segments.list);
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
    expect(ctx.animator.get('x', clock)).toBeCloseTo(
      centerOf('table') - centerOf('list'),
      6,
    );
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
    expect(ctx.animator.get('x', 5000)).toBeCloseTo(0, 6);
  });

  it('Reduced Motion (design:reduced-motion): no travel, no scale; the old surface fades out where it is as the new one fades in, in 200 ms or less', async () => {
    reduceMotion = true;
    const ctx = setup('grid');
    const start = clock;
    select(ctx, 'grid', 'table');
    expect(ctx.layer('lens', 'width')).toBe('106px');
    expectHidden(ctx.segments.table);
    expectReducedMotionCrossFade(ctx, start, 'grid');
    await advance(1000);
    expect(isLeaving(ctx)).toBe(false);
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.layer('lens', 'visibility')).toBe('');
    expectOwnSurface(ctx.segments.table);
  });

  it('Reduced Motion with any other pointer: a change completes at once, with no fade and no leaving surface (DR3)', () => {
    reduceMotion = true;
    const ctx = setup('grid', {coarse: false});
    select(ctx, 'grid', 'table');
    expect(isLeaving(ctx)).toBe(false);
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.animator.get('opacity')).toBe(1);
    expect(ctx.animator.get('scaleX')).toBe(1);
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
 * Under Reduced Motion the ::after shows the surface that fades out where it
 * is: painted with a surface (the lifted lens's shadow has no fill).
 */
const isLeaving = (ctx: ReturnType<typeof setup>) =>
  ctx.layer('after', 'visibility') === 'visible' &&
  ctx.layer('after', 'background-color') !== '';

/** When `get` stops changing: the end of the fade, in ms after `start`. */
function endOf(get: (t: number) => number, start: number): number {
  const last = get(start + 5000);
  for (let t = 0; t <= 5000; t += 1) {
    if (Math.abs(get(start + t) - last) < 1e-6) {
      return t;
    }
  }
  return Infinity;
}

/**
 * The Reduce Motion cross-fade from `start` (design:reduced-motion DR1,
 * DR2): the lens fades in on its new segment, full size, never moving; a copy
 * of the surface fades out where `leavingFrom` rests, on the same clock; over
 * in 200 ms or less.
 */
function expectReducedMotionCrossFade(
  ctx: ReturnType<typeof setup>,
  start: number,
  leavingFrom: string,
): void {
  const entering = (t: number) => ctx.animator.get('opacity', t);
  const fadeIn = endOf(entering, start);
  expect(fadeIn).toBeGreaterThan(0);
  expect(fadeIn).toBeLessThanOrEqual(200);
  expect(entering(start)).toBeCloseTo(0, 6);
  expect(entering(start + fadeIn)).toBeCloseTo(1, 6);
  for (let t = 0; t <= fadeIn; t += 10) {
    expect(ctx.animator.get('x', start + t)).toBe(0);
    expect(ctx.animator.get('scaleX', start + t)).toBe(1);
    expect(ctx.animator.get('scaleY', start + t)).toBe(1);
  }
  // The ::after, painted with the selected surface where it rested; no
  // element is added for it.
  expect(isLeaving(ctx)).toBe(true);
  expect(ctx.layer('after', 'background-color')).toBe('rgb(255, 255, 255)');
  expect(ctx.layer('after', 'left')).toBe(
    `${SEGMENTS[leavingFrom].left - TRACK.left}px`,
  );
  expect(ctx.layer('after', 'width')).toBe(`${SEGMENTS[leavingFrom].width}px`);
  expect(ctx.track.querySelectorAll('*').length).toBe(6);
  const leavingOpacity = (t: number) => ctx.leavingAnimator.get('opacity', t);
  expect(leavingOpacity(start)).toBeCloseTo(1, 6);
  expect(endOf(leavingOpacity, start)).toBe(fadeIn);
  for (let t = 0; t < fadeIn; t += 10) {
    expect(ctx.leavingAnimator.get('x', start + t)).toBe(0);
    expect(entering(start + t) + leavingOpacity(start + t)).toBeCloseTo(1, 6);
  }
}

/** Client x of a segment's center (the track starts at client x 10). */
const clientCenterOf = (value: string) =>
  SEGMENTS[value].left + SEGMENTS[value].width / 2;

describe('under a finger', () => {
  it('landing on the selected segment lifts the lens in place, by UIKit’s additive growth on the lift spring', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('grid'));
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.layer('lens', 'width')).toBe('96px');
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
    press(ctx, clientCenterOf('grid'));
    await advance(2000);
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.animator.get('scaleX')).toBeCloseTo(120 / 96, 6);
    expect(release(ctx, clientCenterOf('grid'))).toBeNull();
    await advance(2000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
  });

  it('landing on another segment leaves the lens alone', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    drag(ctx, clientCenterOf('list'));
    expect(ctx.motion.isSliding).toBe(false);
    expect(ctx.layer('lens', 'visibility')).toBe('');
  });

  it('a commit that is not adopted (vetoed, or kept by the parent) sends the lens back, and the next change to that value still slides', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    // The commit's click ran (nobody vetoed it); the value has not come back.
    ctx.motion.clicked(ctx.track, 'table', false);
    await Promise.resolve();
    await advance(60);
    expect(ctx.motion.isSliding).toBe(true);
    // Grid stays selected.
    ctx.motion.decline(ctx.track, 'table');
    await advance(3000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
    // A later change to Table slides from Grid: the declined commit is gone.
    select(ctx, 'grid', 'table');
    expect(ctx.motion.isSliding).toBe(true);
    expect(ctx.layer('lens', 'visibility')).toBe('visible');
    expect(ctx.animator.get('x', clock)).toBeCloseTo(
      centerOf('grid') - centerOf('table'),
      6,
    );
  });

  it('a click the item vetoes sends the lens back at once', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    await advance(60);
    ctx.motion.clicked(ctx.track, 'table', true);
    // Bound for Grid again, from where it is.
    await advance(3000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
    expectNoOverride(ctx.segments.table);
  });

  it('a parent that adopts the value 200 ms later: no bounce, the lens keeps going and lands there', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    // The click was not vetoed; the value has not come back yet (the lens
    // sets off once the click's event is over).
    ctx.motion.clicked(ctx.track, 'table', false);
    await Promise.resolve();
    // Every frame until the parent adopts it heads for Table, never back.
    let center = centerOf('table') + ctx.animator.get('x');
    for (let t = 0; t < 200; t += 16) {
      await advance(16);
      const next = centerOf('table') + ctx.animator.get('x');
      expect(next).toBeGreaterThanOrEqual(center - 1e-6);
      center = next;
    }
    select(ctx, 'grid', 'table');
    await advance(3000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
    expectNoOverride(ctx.segments.grid);
  });

  it('a later render that keeps the old value sends the lens back', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    release(ctx, clientCenterOf('table'));
    ctx.motion.clicked(ctx.track, 'table', false);
    await Promise.resolve();
    await advance(50);
    // The parent re-rendered with Grid still selected.
    ctx.motion.rendered(ctx.track, 'grid');
    await advance(3000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
  });

  it('a value that never comes back: the lens goes back once its slide settles, the bound being the slide itself', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    release(ctx, clientCenterOf('table'));
    ctx.motion.clicked(ctx.track, 'table', false);
    await Promise.resolve();
    // Mid-slide it still waits.
    await advance(300);
    expect(centerOf('table') + ctx.animator.get('x')).toBeGreaterThan(
      centerOf('list'),
    );
    await advance(6000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
    expectNoOverride(ctx.segments.table);
  });

  it('the commit re-aims the lens at the destination’s box as it is once the new value shows (the titles’ weights move the segments)', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    // The commit's titles take their new weights: Table grows 4 px.
    ctx.segments.table.getBoundingClientRect = () =>
      rect(206, TRACK.top + 2, 110, 27);
    select(ctx, 'grid', 'table');
    expect(ctx.layer('lens', 'width')).toBe('110px');
    expect(ctx.layer('lens', 'left')).toBe('196px');
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.animator.get('scaleX')).toBe(1);
    expect(ctx.motion.isSliding).toBe(false);
  });

  it('a resize while a finger holds the lens (the selected face reflows the titles) keeps it lifted', async () => {
    const ctx = setup('grid');
    let width = TRACK.width;
    Object.defineProperty(ctx.track, 'offsetWidth', {get: () => width});
    press(ctx, clientCenterOf('grid'));
    drag(ctx, clientCenterOf('list'));
    width += 3;
    ctx.motion.resized(ctx.track);
    expect(ctx.motion.isSliding).toBe(true);
    await advance(1000);
    expect(ctx.animator.get('scaleX')).toBeCloseTo(120 / 96, 6);
  });

  it('a drag carries the lens on the tracking spring, no further than 11 pt past the end segments', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('grid'));
    drag(ctx, clientCenterOf('list'));
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
    drag(ctx, 500);
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
    press(forty, clientCenterOf('grid'));
    drag(forty, at(0.4));
    await advance(500);
    expect(release(forty, at(0.4))).toBeNull();
    await advance(3000);
    expect(forty.animator.get('x')).toBe(0);
    expect(forty.motion.isSliding).toBe(false);
    expectOwnSurface(forty.segments.grid);
    document.body.innerHTML = '';
    document.head.innerHTML = '';

    const sixty = setup('grid');
    press(sixty, clientCenterOf('grid'));
    drag(sixty, at(0.6));
    await advance(500);
    const centerAtLift = centerOf('grid') + sixty.animator.get('x');
    expect(release(sixty, at(0.6))).toBe('list');
    // Until the new value comes back, the old selection's paint is carried.
    expectHidden(sixty.segments.grid);
    // The commit (synchronous, through the segment's click) shows List: the
    // lens re-bases onto it without a jump, then springs there on the slide
    // spring while it comes down on the lift spring, painted by List.
    select(sixty, 'grid', 'list');
    expect(centerOf('list') + sixty.animator.get('x')).toBeCloseTo(
      centerAtLift,
      6,
    );
    expect(sixty.layer('lens', 'width')).toBe('100px');
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
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
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
    press(ctx, clientCenterOf('grid'));
    drag(ctx, clientCenterOf('table'));
    await advance(200);
    ctx.motion.cancel();
    await advance(3000);
    expect(ctx.animator.get('x')).toBe(0);
    expect(ctx.animator.get('scaleX')).toBe(1);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
  });

  it('the lifted lens casts its shadow with the lift and drops it at the lift of the finger', async () => {
    const ctx = setup('grid');
    expect(ctx.shadowAnimator.get('opacity')).toBe(0);
    press(ctx, clientCenterOf('grid'));
    // The ::after, laid out with the lens, with its corners and the theme's
    // elevation shadow, and no fill.
    for (const property of ['left', 'top', 'width', 'height']) {
      expect(ctx.layer('after', property)).toBe(ctx.layer('lens', property));
    }
    expect(ctx.layer('after', 'border-top-left-radius')).toBe('6px');
    // Unset: the stylesheet's default, the theme's elevation shadow.
    expect(ctx.layer('after', 'box-shadow')).toBe('');
    expect(ctx.layer('after', 'background-color')).toBe('');
    expect(ctx.layer('after', 'visibility')).toBe('visible');
    // It moves on the lens's curves.
    for (const t of [16, 50, 100]) {
      expect(ctx.shadowAnimator.get('scaleX', 1000 + t)).toBeCloseTo(
        ctx.animator.get('scaleX', 1000 + t),
        9,
      );
    }
    const lift = solveSpring(toSpring(segmentedControl.liftSpring), {
      from: 0,
      to: 1,
      velocity: 0,
    });
    // The opacity rides the lift spring, on the lens's clock.
    expect(ctx.shadowAnimator.get('opacity', 1050)).toBeCloseTo(
      lift.value(0.05),
      6,
    );
    await advance(1000);
    expect(ctx.shadowAnimator.get('opacity')).toBeCloseTo(1, 6);
    release(ctx, clientCenterOf('grid'));
    await advance(2000);
    expect(ctx.shadowAnimator.get('opacity')).toBe(0);
    expect(ctx.motion.isSliding).toBe(false);
  });

  it('a tap’s shadow rises and falls with its lift', async () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    release(ctx, clientCenterOf('table'));
    select(ctx, 'grid', 'table');
    await advance(segmentedControl.tapLiftHangMs - 10);
    expect(ctx.shadowAnimator.get('opacity')).toBeGreaterThan(0.9);
    await advance(2000);
    expect(ctx.shadowAnimator.get('opacity')).toBe(0);
  });

  it('a press waits to lift until it is on (a scroller’s delay), and a drag lifts it then', async () => {
    const ctx = setup('grid');
    begin(ctx, clientCenterOf('grid'));
    expect(ctx.motion.isSliding).toBe(false);
    drag(ctx, clientCenterOf('list'));
    expect(ctx.motion.isSliding).toBe(true);
    await advance(1000);
    expect(ctx.animator.get('scaleX')).toBeCloseTo(120 / 96, 6);
    expect(ctx.shadowAnimator.get('opacity')).toBeCloseTo(1, 6);
    expect(release(ctx, clientCenterOf('list'))).toBe('list');
  });

  it('a press cancelled before it is on leaves everything as it was', () => {
    const ctx = setup('grid');
    begin(ctx, clientCenterOf('grid'));
    ctx.motion.cancel();
    expect(ctx.motion.isSliding).toBe(false);
    ctx.motion.lift();
    expect(ctx.motion.isSliding).toBe(false);
  });

  it('never commits a disabled segment', () => {
    const ctx = setup('grid');
    ctx.segments.table.setAttribute('aria-disabled', 'true');
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBeNull();
  });

  it('Reduced Motion: no lift, no chase; the drag commits at the lift and the selection cross-fades there, on any pointer (a touch release, DR2)', async () => {
    reduceMotion = true;
    // A fine primary pointer: the touch release still fades.
    const ctx = setup('grid', {coarse: false});
    press(ctx, clientCenterOf('grid'));
    expect(ctx.motion.isSliding).toBe(false);
    // The lens stays parked on the selected segment while the finger moves.
    drag(ctx, clientCenterOf('list'));
    drag(ctx, clientCenterOf('table'));
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.grid);
    // The segment under the finger at the lift is committed...
    const start = clock;
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    select(ctx, 'grid', 'table');
    // ...and the selection cross-fades there.
    expect(ctx.layer('lens', 'width')).toBe('106px');
    expectReducedMotionCrossFade(ctx, start, 'grid');
    expectHidden(ctx.segments.table);
    await advance(1000);
    expect(ctx.motion.isSliding).toBe(false);
    expectOwnSurface(ctx.segments.table);
  });

  it('Reduced Motion: a hold and a lift on the selected segment change nothing', () => {
    reduceMotion = true;
    const ctx = setup('grid');
    press(ctx, clientCenterOf('grid'));
    expect(release(ctx, clientCenterOf('grid'))).toBeNull();
    expect(ctx.motion.isSliding).toBe(false);
  });
});

describe('the titles under a finger (UIKit, F4 batch 64)', () => {
  interface Recorded {
    element: HTMLElement;
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    cancel: ReturnType<typeof vi.fn>;
  }
  let recorded: Recorded[] = [];
  const realAnimate = HTMLElement.prototype.animate;
  const ease = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

  beforeEach(() => {
    recorded = [];
    HTMLElement.prototype.animate = function (
      this: HTMLElement,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions,
    ) {
      const finished = new Promise<void>(() => {});
      const cancel = vi.fn();
      if (this.dataset.segmentTitle == null) {
        return {finished, cancel, startTime: null} as unknown as Animation;
      }
      recorded.push({
        element: this,
        keyframes: keyframes as Keyframe[],
        options: options as KeyframeAnimationOptions,
        cancel,
      });
      return {finished, cancel} as unknown as Animation;
    };
  });

  afterEach(() => {
    HTMLElement.prototype.animate = realAnimate;
  });

  const titleOf = (segment: HTMLElement): HTMLElement => {
    const title = segment.querySelector<HTMLElement>(TITLE_SELECTOR);
    if (title == null) {
      throw new Error('no title');
    }
    return title;
  };
  // A press dims the title (and the icon, when the segment has one).
  const fadesOf = (segment: HTMLElement) =>
    recorded.filter(r => r.element === titleOf(segment));
  const lastFadeOf = (segment: HTMLElement): Recorded => {
    const fade = fadesOf(segment).at(-1);
    if (fade == null) {
      throw new Error('no fade');
    }
    return fade;
  };
  const faceOf = (segment: HTMLElement) => ({
    weight: titleOf(segment).style.fontWeight,
    color: titleOf(segment).style.color,
  });
  const NO_FACE = {weight: '', color: ''};

  it('Reduced Motion: the dim and its recovery fade on the animator’s 200 ms fade, not UIKit’s 470 ms, whatever the roles say (design:reduced-motion DR2, DR4)', () => {
    reduceMotion = true;
    const ctx = setup('grid');
    press(ctx, clientCenterOf('list'));
    const dim = lastFadeOf(ctx.segments.list);
    expect(dim.keyframes.at(-1)).toEqual({opacity: 0.2});
    expect(dim.options.duration).toBeGreaterThan(0);
    expect(dim.options.duration).toBeLessThanOrEqual(200);
    expect(Object.keys(dim.keyframes[0])).toEqual(['opacity']);
    release(ctx, clientCenterOf('list'));
    const back = lastFadeOf(ctx.segments.list);
    expect(back.keyframes.at(-1)).toEqual({opacity: 1});
    expect(back.options.duration).toBeLessThanOrEqual(200);
  });

  it('Reduced Motion with any other pointer: the dim changes at once (DR3)', () => {
    reduceMotion = true;
    const ctx = setup('grid', {coarse: false});
    press(ctx, clientCenterOf('list'));
    expect(lastFadeOf(ctx.segments.list).options.duration).toBe(0);
  });

  it('a finger on an unselected segment dims its title to 0.2 over 470 ms on CSS ease; the lens stays', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('list'));
    const dim = lastFadeOf(ctx.segments.list);
    expect(dim.keyframes.at(-1)).toEqual({opacity: 0.2});
    expect(dim.options.duration).toBe(segmentedControl.pressedTitle.fadeMs);
    expect(dim.options.duration).toBe(470);
    expect(dim.options.easing).toBe(ease);
    expect(fadesOf(ctx.segments.grid)).toHaveLength(0);
    expect(ctx.motion.isSliding).toBe(false);
  });

  it('the dim moves with the finger into another segment, and never lands on the selected one', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('list'));
    const first = lastFadeOf(ctx.segments.list);
    drag(ctx, clientCenterOf('table'));
    expect(first.cancel).toHaveBeenCalled();
    const back = lastFadeOf(ctx.segments.list);
    expect(back.keyframes.at(-1)).toEqual({opacity: 1});
    expect(back.options.duration).toBe(470);
    expect(lastFadeOf(ctx.segments.table).keyframes.at(-1)).toEqual({
      opacity: 0.2,
    });
    drag(ctx, clientCenterOf('grid'));
    expect(fadesOf(ctx.segments.grid)).toHaveLength(0);
    expect(lastFadeOf(ctx.segments.table).keyframes.at(-1)).toEqual({
      opacity: 1,
    });
  });

  it('at the lift the chosen title comes back in 180 ms, and the commit switches the faces at once (F4 b64b)', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    const back = lastFadeOf(ctx.segments.table);
    expect(back.keyframes.at(-1)).toEqual({opacity: 1});
    expect(back.options.duration).toBe(segmentedControl.pressedTitle.liftMs);
    expect(back.options.duration).toBe(180);
    expect(back.options.easing).toBe(ease);
    const fades = recorded.length;
    select(ctx, 'grid', 'table');
    // The titles take their new faces with the selection: nothing fades.
    expect(recorded).toHaveLength(fades);
  });

  it('a tap on the selected segment dims nothing', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('grid'));
    expect(release(ctx, clientCenterOf('grid'))).toBeNull();
    expect(recorded).toHaveLength(0);
  });

  it('during a lifted drag the selected face follows the finger at once', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('grid'));
    drag(ctx, clientCenterOf('list'));
    expect(faceOf(ctx.segments.list)).toEqual({
      weight: '600',
      color: 'rgb(10, 10, 10)',
    });
    expect(faceOf(ctx.segments.grid)).toEqual({
      weight: '500',
      color: 'rgb(110, 110, 110)',
    });
    expect(faceOf(ctx.segments.table)).toEqual(NO_FACE);
    // One frame: nothing fades.
    expect(recorded).toHaveLength(0);
    drag(ctx, clientCenterOf('table'));
    expect(faceOf(ctx.segments.table).weight).toBe('600');
    expect(faceOf(ctx.segments.list)).toEqual(NO_FACE);
    // The lift commits; the selection's own styles take over in its commit,
    // and nothing fades: the faces are already the ones on screen.
    expect(release(ctx, clientCenterOf('table'))).toBe('table');
    select(ctx, 'grid', 'table');
    for (const segment of Object.values(ctx.segments)) {
      expect(faceOf(segment)).toEqual(NO_FACE);
    }
    expect(recorded).toHaveLength(0);
  });

  it('a finger in the gap between two segments counts for the nearer one, never for a segment further on', () => {
    const ctx = setup('grid');
    // Gaps of 4 px between the segments, as the track's padding lays out.
    const gapped: Record<string, [number, number]> = {
      grid: [12, 96],
      list: [112, 96],
      table: [212, 102],
    };
    for (const [value, [left, width]] of Object.entries(gapped)) {
      ctx.segments[value].getBoundingClientRect = () =>
        rect(left, TRACK.top + 2, width, 27);
    }
    const weightOf = (value: string) => faceOf(ctx.segments[value]).weight;
    press(ctx, 60);
    // Just past Grid, in the gap but nearer Grid: still Grid's.
    drag(ctx, 109);
    expect([weightOf('list'), weightOf('table')]).toEqual(['', '']);
    // Nearer List: List's.
    drag(ctx, 111);
    expect(weightOf('list')).toBe('600');
    expect(weightOf('table')).toBe('');
    // In the next gap, nearer List, then nearer Table.
    drag(ctx, 209);
    expect(weightOf('list')).toBe('600');
    drag(ctx, 211);
    expect(weightOf('table')).toBe('600');
    expect(weightOf('list')).toBe('');
  });

  it('a lifted drag back onto the selected segment, or a cancel, puts the faces back', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('grid'));
    drag(ctx, clientCenterOf('table'));
    drag(ctx, clientCenterOf('grid'));
    expect(faceOf(ctx.segments.table)).toEqual(NO_FACE);
    expect(faceOf(ctx.segments.grid)).toEqual(NO_FACE);
    drag(ctx, clientCenterOf('list'));
    ctx.motion.cancel();
    expect(faceOf(ctx.segments.list)).toEqual(NO_FACE);
    expect(faceOf(ctx.segments.grid)).toEqual(NO_FACE);
    press(ctx, clientCenterOf('grid'));
    drag(ctx, clientCenterOf('table'));
    expect(release(ctx, clientCenterOf('grid'))).toBeNull();
    expect(faceOf(ctx.segments.table)).toEqual(NO_FACE);
    expect(faceOf(ctx.segments.grid)).toEqual(NO_FACE);
  });

  it('a press the page takes away brings the dimmed title back', () => {
    const ctx = setup('grid');
    press(ctx, clientCenterOf('list'));
    ctx.motion.cancel();
    const back = lastFadeOf(ctx.segments.list);
    expect(back.keyframes.at(-1)).toEqual({opacity: 1});
    expect(back.options.duration).toBe(470);
  });

  it('a programmatic or keyboard change animates no title: the titles switch at once', () => {
    const ctx = setup('grid');
    select(ctx, 'grid', 'table');
    expect(recorded).toHaveLength(0);
  });
});
