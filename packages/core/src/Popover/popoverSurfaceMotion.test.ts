// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file popoverSurfaceMotion.test.ts
 * @input vitest (jsdom), popoverSurfaceMotion, a recording stand-in for
 *   Element.animate (jsdom runs no animations)
 * @output Checks where the popover grows from on each side of its source,
 *   that every frame stays on UIKit's measured path (the edge on the source,
 *   the scale and the length on one spring), and what the touch presentation
 *   hands the browser on present, dismiss, present during the dismiss, reset
 *   and under Reduce Motion
 * @position Testing; the curves on a real compositor are proven in
 *   __tests__/PopoverTouchMotion.interaction.browser.spec.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {settlingDuration, solveSpring, toSpring} from '../motion/spring';
import {popover, springs} from '../motion/uikit';
import {
  createPopoverSurfaceMotion,
  POPOVER_EXIT_COPY_ATTRIBUTE,
  POPOVER_HOLD_ATTRIBUTE,
  popoverCollapsedState,
  popoverFrame,
  type PopoverSurfaceGeometry,
} from './popoverSurfaceMotion';

// UIKit on iOS 26.2 (batch 36): a 120 × 44 button at (141, 160) presents a
// 320 × 253 popover below it at (41, 204), centred on it.
const GEOMETRY: PopoverSurfaceGeometry = {
  surface: {left: 41, top: 204, width: 320, height: 253},
  source: {left: 141, top: 160, width: 120, height: 44},
};

/** The visual box of the surface scaled by (sx, sy) about the origin. */
function visualBox(
  geometry: PopoverSurfaceGeometry,
  origin: {x: number; y: number},
  sx: number,
  sy: number,
) {
  const {left, top, width, height} = geometry.surface;
  return {
    left: left + origin.x * (1 - sx),
    top: top + origin.y * (1 - sy),
    width: width * sx,
    height: height * sy,
  };
}

const scaleOf = (frame: Keyframe) =>
  String(frame.scale)
    .split(' ')
    .map(value => Number(value));

describe('popoverCollapsedState', () => {
  it('grows a popover below its source out of the source\u2019s bottom centre', () => {
    const state = popoverCollapsedState(GEOMETRY);
    expect(state.originX).toBe(160);
    expect(state.originY).toBe(0);
    expect(state.axis).toBe('y');
    expect(state.scale).toBe(popover.collapsedScale);
    expect(state.length).toBeCloseTo(popover.collapsedLengthPx / 253, 12);
  });

  it('turns the same motion toward a source above or beside the popover', () => {
    const above = popoverCollapsedState({
      surface: {left: 41, top: 100, width: 320, height: 200},
      source: {left: 141, top: 310, width: 120, height: 44},
    });
    expect([above.originX, above.originY, above.axis]).toEqual([160, 200, 'y']);
    const right = popoverCollapsedState({
      surface: {left: 200, top: 100, width: 180, height: 240},
      source: {left: 20, top: 150, width: 160, height: 40},
    });
    expect([right.originX, right.originY, right.axis]).toEqual([0, 70, 'x']);
    expect(right.length).toBeCloseTo(popover.collapsedLengthPx / 180, 12);
    const left = popoverCollapsedState({
      surface: {left: 10, top: 100, width: 180, height: 240},
      source: {left: 200, top: 150, width: 160, height: 40},
    });
    expect([left.originX, left.originY, left.axis]).toEqual([180, 70, 'x']);
  });

  it('keeps the point on the popover when its source is wider than it, and never grows a short popover', () => {
    const state = popoverCollapsedState({
      surface: {left: 300, top: 60, width: 90, height: 80},
      source: {left: 0, top: 10, width: 402, height: 44},
    });
    // The source's centre (201) lies left of the popover: its nearest point.
    expect(state.originX).toBe(0);
    expect(state.originY).toBe(0);
    // Shorter than the 100 pt it would grow from: the length does not move.
    expect(state.length).toBe(1);
  });
});

describe('popoverFrame', () => {
  it('keeps every frame on UIKit\u2019s path: the top on the source, the centre on its line, the length growing from 100 pt', () => {
    const state = popoverCollapsedState(GEOMETRY);
    // Progress past 1 is the spring's overshoot; the path extends straight.
    for (const p of [0, 0.1, 0.3126, 0.5, 0.9, 1, 1.0152]) {
      const frame = popoverFrame(state, p);
      const box = visualBox(
        GEOMETRY,
        {x: state.originX, y: state.originY},
        frame.scaleX,
        frame.scaleY,
      );
      const scale = popover.collapsedScale + (1 - popover.collapsedScale) * p;
      expect(box.top).toBeCloseTo(204, 9);
      expect(box.left + box.width / 2).toBeCloseTo(201, 9);
      expect(box.width).toBeCloseTo(320 * scale, 9);
      expect(box.height).toBeCloseTo(scale * (100 + 153 * p), 9);
      expect(frame.opacity).toBeCloseTo(p, 12);
    }
  });

  it('matches the popover view\u2019s measured frames', () => {
    const state = popoverCollapsedState(GEOMETRY);
    // Presentation frames of the popover view, iOS 26.2 (batch 36): scale,
    // then the visual width and height.
    for (const [scale, width, height] of [
      [0.0865, 27.69, 9.68],
      [0.3195, 102.25, 47.24],
      [0.6664, 213.26, 134.25],
      [0.9632, 308.22, 238.2],
      [1.015, 324.79, 259.14],
    ]) {
      const p = (scale - popover.collapsedScale) / (1 - popover.collapsedScale);
      const frame = popoverFrame(state, p);
      expect(320 * frame.scaleX).toBeCloseTo(width, 1);
      expect(253 * frame.scaleY).toBeCloseTo(height, 1);
    }
  });
});

interface Recorded {
  target: Element;
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  cancelled: boolean;
}

describe('createPopoverSurfaceMotion', () => {
  let clock = 1000;
  let recorded: Recorded[] = [];

  beforeEach(() => {
    clock = 1000;
    recorded = [];
    vi.useFakeTimers();
    HTMLElement.prototype.animate = function (keyframes, options) {
      const animation = {
        target: this,
        keyframes: keyframes as Keyframe[],
        options: options as KeyframeAnimationOptions,
        cancelled: false,
        startTime: null as number | null,
        finished: new Promise(() => {}),
        cancel() {
          this.cancelled = true;
        },
      };
      recorded.push(animation);
      return animation as unknown as Animation;
    };
  });

  // jsdom has no layout: the dismissal's copy stands where its inline box
  // says.
  const originalRect = HTMLElement.prototype.getBoundingClientRect;
  beforeEach(() => {
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      if (!this.hasAttribute(POPOVER_EXIT_COPY_ATTRIBUTE)) {
        return originalRect.call(this);
      }
      const left = parseFloat(this.style.left);
      const top = parseFloat(this.style.top);
      const width = parseFloat(this.style.width);
      const height = parseFloat(this.style.height);
      return {
        left,
        top,
        width,
        height,
        x: left,
        y: top,
        right: left + width,
        bottom: top + height,
        toJSON: () => ({}),
      };
    };
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    HTMLElement.prototype.getBoundingClientRect = originalRect;
    vi.useRealTimers();
  });

  const create = (reducedMotion = false) => {
    const host = document.createElement('section');
    document.body.appendChild(host);
    const element = document.createElement('div');
    element.id = 'popover-layer';
    element.setAttribute('popover', 'auto');
    element.innerHTML =
      '<div role="dialog" id="popover-dialog" aria-label="Filters"><button id="apply">Apply</button></div>';
    // jsdom has no layout: the surface stands where the open measured it.
    element.getBoundingClientRect = () => ({
      ...GEOMETRY.surface,
      x: GEOMETRY.surface.left,
      y: GEOMETRY.surface.top,
      right: GEOMETRY.surface.left + GEOMETRY.surface.width,
      bottom: GEOMETRY.surface.top + GEOMETRY.surface.height,
      toJSON: () => ({}),
    });
    host.appendChild(element);
    const motion = createPopoverSurfaceMotion(element, {
      now: () => clock,
      prefersReducedMotion: () => reducedMotion,
    });
    return {element, motion};
  };

  const live = (property: string, target?: Element) =>
    recorded.filter(
      animation =>
        !animation.cancelled &&
        (target == null || animation.target === target) &&
        animation.keyframes.some(frame => property in frame),
    );
  const copyOf = (element: HTMLElement) =>
    element.parentElement!.querySelector<HTMLElement>(
      `[${POPOVER_EXIT_COPY_ATTRIBUTE}]`,
    );

  it('grows the popover out of its source on UIKit\u2019s present spring, without the layer\u2019s CSS entrance', () => {
    const {element, motion} = create();
    // The read happens with the CSS entrance already off and no scale left.
    const measure = vi.fn(() => {
      expect(element.style.getPropertyValue('animation-name')).toBe('none');
      return GEOMETRY;
    });
    motion.enter(measure);
    expect(measure).toHaveBeenCalledTimes(1);
    const state = popoverCollapsedState(GEOMETRY);
    expect(element.style.getPropertyValue('animation-name')).toBe('none');
    expect(element.style.getPropertyValue('transform-origin')).toBe(
      `${state.originX}px ${state.originY}px`,
    );
    const [scaleAnimation] = live('scale');
    const first = scaleOf(scaleAnimation.keyframes[0]);
    expect(first[0]).toBeCloseTo(state.scale, 4);
    expect(first[1]).toBeCloseTo(state.scale * state.length, 4);
    expect(scaleOf(scaleAnimation.keyframes.at(-1)!)).toEqual([1, 1]);
    // Every keyframe is the measured path at the present spring's progress:
    // the width with the scale, the height with the scale and the length.
    const duration = Number(scaleAnimation.options.duration);
    const progress = solveSpring(toSpring(springs.popoverPresent), {
      from: 0,
      to: 1,
    });
    let peak = 0;
    for (const frame of scaleAnimation.keyframes) {
      const t = ((frame.offset as number) * duration) / 1000;
      const expected = popoverFrame(state, progress.value(t));
      const [sx, sy] = scaleOf(frame);
      expect(sx).toBeCloseTo(expected.scaleX, 2);
      expect(sy).toBeCloseTo(expected.scaleY, 2);
      peak = Math.max(peak, sx);
    }
    // UIKit's popover view peaks at 1.015 (bounce 0.2).
    expect(peak).toBeCloseTo(1.015, 2);
    const [opacityAnimation] = live('opacity');
    expect(Number(opacityAnimation.keyframes[0].opacity)).toBe(0);
    expect(Number(opacityAnimation.keyframes.at(-1)!.opacity)).toBe(1);
  });

  it('plays the dismissal on a static copy of the popover, back into its source, removed when the spring settles', async () => {
    const {element, motion} = create();
    motion.enter(() => GEOMETRY);
    clock += 1000;
    vi.advanceTimersByTime(1000);
    motion.exit();
    const copy = copyOf(element);
    expect(copy).not.toBeNull();
    // Beside the layer (same inherited theme), where it stands, out of reach.
    expect(copy!.previousElementSibling).toBe(element);
    expect(copy!.getAttribute('aria-hidden')).toBe('true');
    expect(copy!.hasAttribute('inert')).toBe(true);
    expect(copy!.hasAttribute('popover')).toBe(false);
    expect(copy!.querySelectorAll('[id]')).toHaveLength(0);
    expect(copy!.style.getPropertyValue('left')).toBe('41px');
    expect(copy!.style.getPropertyValue('top')).toBe('204px');
    const state = popoverCollapsedState(GEOMETRY);
    expect(copy!.style.getPropertyValue('transform-origin')).toBe(
      `${state.originX}px ${state.originY}px`,
    );
    // The copy shrinks into the point on the dismiss spring and fades.
    const [scaleAnimation] = live('scale', copy!);
    const last = scaleOf(scaleAnimation.keyframes.at(-1)!);
    expect(last[0]).toBeCloseTo(state.scale, 4);
    expect(last[1]).toBeCloseTo(state.scale * state.length, 4);
    const duration = Number(scaleAnimation.options.duration);
    const progress = solveSpring(toSpring(springs.popoverDismiss), {
      from: 0,
      to: 1,
    });
    for (const frame of scaleAnimation.keyframes) {
      const t = ((frame.offset as number) * duration) / 1000;
      const expected = popoverFrame(state, 1 - progress.value(t));
      const [sx, sy] = scaleOf(frame);
      expect(sx).toBeCloseTo(expected.scaleX, 2);
      expect(sy).toBeCloseTo(expected.scaleY, 2);
    }
    const [opacityAnimation] = live('opacity', copy!);
    expect(Number(opacityAnimation.keyframes[0].opacity)).toBe(1);
    expect(Number(opacityAnimation.keyframes.at(-1)!.opacity)).toBe(0);
    // The layer itself is left at rest for its next presentation.
    expect(element.style.getPropertyValue('scale')).toMatch(/^1( 1)?$/);
    expect(element.style.getPropertyValue('opacity')).toBe('1');
    // Gone once the spring settles.
    clock += 2000;
    vi.advanceTimersByTime(2000);
    return Promise.resolve().then(() => {
      expect(copyOf(element)).toBeNull();
    });
  });

  it('presented again during the dismissal, grows back from the frame on screen about the same point', () => {
    const {element, motion} = create();
    motion.enter(() => GEOMETRY);
    clock += 1000;
    vi.advanceTimersByTime(1000);
    motion.exit();
    const origin = element.style.getPropertyValue('transform-origin');
    clock += 80;
    const measure = vi.fn(() => GEOMETRY);
    motion.enter(measure);
    // No new measurement and no new pivot; the copy is gone.
    expect(measure).not.toHaveBeenCalled();
    expect(element.style.getPropertyValue('transform-origin')).toBe(origin);
    expect(copyOf(element)).toBeNull();
    const first = scaleOf(live('scale', element).at(-1)!.keyframes[0]);
    const state = popoverCollapsedState(GEOMETRY);
    // Mid-dismissal: smaller than the presented popover, larger than the
    // point, with the length between its two values.
    expect(first[0]).toBeLessThan(1);
    expect(first[0]).toBeGreaterThan(state.scale);
    const length = first[1] / first[0];
    expect(length).toBeLessThan(1);
    expect(length).toBeGreaterThan(state.length);
  });

  it('a dismissal with no touch presentation before it does nothing', () => {
    const {element, motion} = create();
    motion.exit();
    expect(recorded).toHaveLength(0);
    expect(copyOf(element)).toBeNull();
  });

  it('reset leaves the element as the component styles it', () => {
    const {element, motion} = create();
    motion.enter(() => GEOMETRY);
    motion.reset();
    for (const property of [
      'scale',
      'opacity',
      'transform-origin',
      'animation-name',
    ]) {
      expect(element.style.getPropertyValue(property), property).toBe('');
    }
    motion.exit();
    expect(copyOf(element)).toBeNull();
  });

  it('Reduce Motion: the popover fades in at its size, and out where it stands, on the present and dismiss springs', () => {
    const {element, motion} = create(true);
    motion.enter(() => GEOMETRY);
    // No growth: any scale keyframe after the start is the full size.
    for (const animation of live('scale', element)) {
      for (const frame of animation.keyframes) {
        if ((frame.offset as number) > 0) {
          expect(String(frame.scale)).toMatch(/^1( 1)?$/);
        }
      }
    }
    const [fadeIn] = live('opacity', element);
    const duration = Number(fadeIn.options.duration);
    const present = solveSpring(toSpring(springs.popoverPresent), {
      from: 0,
      to: 1,
    });
    for (const frame of fadeIn.keyframes) {
      const t = ((frame.offset as number) * duration) / 1000;
      if (t <= settlingDuration(toSpring(springs.popoverPresent))) {
        // Opacity cannot overshoot: the spring's bounce is clipped at 1.
        expect(Number(frame.opacity)).toBeCloseTo(
          Math.min(1, present.value(t)),
          2,
        );
      }
    }
    clock += 1000;
    vi.advanceTimersByTime(1000);
    motion.exit();
    const copy = copyOf(element)!;
    const [fadeOut] = live('opacity', copy);
    expect(Number(fadeOut.keyframes[0].opacity)).toBe(1);
    expect(Number(fadeOut.keyframes.at(-1)!.opacity)).toBe(0);
    const dismiss = solveSpring(toSpring(springs.popoverDismiss), {
      from: 1,
      to: 0,
    });
    const fadeOutMs = Number(fadeOut.options.duration);
    const settle = settlingDuration(toSpring(springs.popoverDismiss));
    for (const frame of fadeOut.keyframes) {
      const t = ((frame.offset as number) * fadeOutMs) / 1000;
      if (t <= settle) {
        expect(Number(frame.opacity)).toBeCloseTo(
          Math.max(0, dismiss.value(t)),
          2,
        );
      }
    }
    // The copy keeps its size while it fades (it moves once it is out).
    for (const animation of live('scale', copy)) {
      const length = Number(animation.options.duration);
      for (const frame of animation.keyframes) {
        if ((frame.offset as number) * length < settle * 900) {
          expect(String(frame.scale)).toMatch(/^1( 1)?$/);
        }
      }
    }
  });
  describe('the hold while it is presented', () => {
    const shown = new Set<Element>();
    const original = {
      show: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'showPopover',
      ),
      hide: Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'hidePopover',
      ),
    };
    const restore = (
      name: 'showPopover' | 'hidePopover',
      descriptor?: PropertyDescriptor,
    ) => {
      if (descriptor == null) {
        Reflect.deleteProperty(HTMLElement.prototype, name);
      } else {
        Object.defineProperty(HTMLElement.prototype, name, descriptor);
      }
    };
    beforeEach(() => {
      shown.clear();
      Object.defineProperty(HTMLElement.prototype, 'showPopover', {
        configurable: true,
        writable: true,
        value(this: HTMLElement) {
          shown.add(this);
        },
      });
      Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
        configurable: true,
        writable: true,
        value(this: HTMLElement) {
          shown.delete(this);
        },
      });
    });
    afterEach(() => {
      restore('showPopover', original.show);
      restore('hidePopover', original.hide);
    });

    const holdOf = (element: HTMLElement) =>
      element.querySelector<HTMLElement>(`[${POPOVER_HOLD_ATTRIBUTE}]`);

    it('takes every touch until the present spring settles, as UIKit ignores touches during the presentation', async () => {
      const {element, motion} = create();
      motion.enter(() => GEOMETRY);
      const hold = holdOf(element);
      expect(hold).not.toBeNull();
      // A manual popover inside the layer: above everything in the top layer,
      // and a tap on it is a tap inside the popover.
      expect(hold!.parentElement).toBe(element);
      expect(hold!.getAttribute('popover')).toBe('manual');
      expect(hold!.getAttribute('aria-hidden')).toBe('true');
      expect(shown.has(hold!)).toBe(true);
      const style = hold!.getAttribute('style') ?? '';
      expect(style).toContain('position: fixed');
      expect(style).toContain('inset: 0');
      expect(style).toContain('background: transparent');
      expect(style).toContain('touch-action: none');
      // Still there well into the presentation (UIKit ignored a tap 60 ms
      // in), gone once the spring has settled.
      clock += 300;
      vi.advanceTimersByTime(300);
      await Promise.resolve();
      expect(holdOf(element)).toBe(hold);
      const [presenting] = live('scale', element);
      const duration = Number(presenting.options.duration);
      clock += duration;
      vi.advanceTimersByTime(duration);
      await Promise.resolve();
      await Promise.resolve();
      expect(holdOf(element)).toBeNull();
      expect(shown.has(hold!)).toBe(false);
    });

    it('lets go at once when the popover is dismissed or reset during the presentation', () => {
      const dismissed = create();
      dismissed.motion.enter(() => GEOMETRY);
      expect(holdOf(dismissed.element)).not.toBeNull();
      dismissed.motion.exit();
      expect(holdOf(dismissed.element)).toBeNull();

      const reset = create();
      reset.motion.enter(() => GEOMETRY);
      reset.motion.reset();
      expect(holdOf(reset.element)).toBeNull();
      expect(shown.size).toBe(0);
    });

    it('holds under Reduce Motion too: the fade runs on the same spring', () => {
      const {element, motion} = create(true);
      motion.enter(() => GEOMETRY);
      expect(holdOf(element)).not.toBeNull();
    });

    it('places no hold where the browser has no popovers', () => {
      Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
      const {element, motion} = create();
      motion.enter(() => GEOMETRY);
      expect(holdOf(element)).toBeNull();
    });
  });
});
