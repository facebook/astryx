// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PressTracker.test.ts
 * @input A PressTracker fed through a GestureArena by synthetic touches
 * @output UIControl semantics: events, the expanded tracking bounds,
 *   cancellation, and a keepsTouch control's delivery inside and outside
 *   scrollers
 * @position Unit tests of packages/core/src/gestures/PressTracker.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {UIKIT_GESTURES} from '../../motion/uikit/gestures';
import {PanGestureRecognizer} from '../PanGestureRecognizer';
import {PressTracker, type ControlEvent} from '../PressTracker';
import {TapGestureRecognizer} from '../TapGestureRecognizer';
import {createHarness, scrollProbe} from './harness';

const BOUNDS = {left: 100, top: 100, right: 200, bottom: 140};
const EXPANSION = UIKIT_GESTURES.control.trackingExpansion.value;
const DELAY = UIKIT_GESTURES.press.contentTouchDelay.value;

function setup(options: {keepsTouch?: boolean; cancelTravel?: number} = {}) {
  const events: ControlEvent[] = [];
  const tracker = new PressTracker({
    getBounds: () => BOUNDS,
    onControlEvent: event => events.push(event),
    ...options,
  });
  return {events, tracker, h: createHarness()};
}

describe('PressTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports touch down and touch up inside', () => {
    const {events, tracker, h} = setup();
    h.finger(1).down(150, 120, 0, {recognizers: [], consumer: tracker});
    expect(tracker.isTracking).toBe(true);
    h.finger(1).move(152, 121, 16);
    h.finger(1).up(80);
    expect(events).toEqual(['touchDown', 'touchDragInside', 'touchUpInside']);
    expect(tracker.isTracking).toBe(false);
  });

  it('keeps tracking inside the expanded bounds and exits past them', () => {
    const {events, tracker, h} = setup();
    const finger = h.finger(1).down(150, 120, 0, {
      recognizers: [],
      consumer: tracker,
    });
    finger.move(200 + EXPANSION, 120, 16);
    expect(tracker.isTouchInside).toBe(true);
    finger.move(200 + EXPANSION + 1, 120, 32);
    expect(tracker.isTouchInside).toBe(false);
    finger.move(150, 120, 48);
    finger.up(64, 200 + EXPANSION + 10, 120);
    expect(events).toEqual([
      'touchDown',
      'touchDragInside',
      'touchDragExit',
      'touchDragOutside',
      'touchDragEnter',
      'touchDragInside',
      'touchUpOutside',
    ]);
  });

  it('is cancelled when a recognizer takes the touch', () => {
    const {events, tracker, h} = setup();
    const pan = new PanGestureRecognizer({name: 'pan'});
    h.finger(1).down(150, 120, 0, {recognizers: [pan], consumer: tracker});
    h.finger(1).move(175, 120, 16);
    expect(events).toEqual(['touchDown', 'touchCancel']);
  });

  it('is cancelled when the browser takes the touch to scroll', () => {
    const {events, tracker, h} = setup();
    h.finger(1).down(150, 120, 0, {recognizers: [], consumer: tracker});
    h.finger(1).takenByBrowser(30);
    expect(events).toEqual(['touchDown', 'touchCancel']);
    expect(tracker.isTracking).toBe(false);
  });

  it('is cancelled for good once the finger travels past cancelTravel', () => {
    const limit = UIKIT_GESTURES.pan.hysteresis.value;
    const {events, tracker, h} = setup({cancelTravel: limit});
    const finger = h.finger(1).down(150, 120, 0, {
      recognizers: [],
      consumer: tracker,
    });
    finger.move(150, 120 + limit, 16);
    expect(tracker.isTracking).toBe(true);
    finger.move(150, 120 + limit + 1, 32);
    expect(tracker.isTracking).toBe(false);
    // Back inside: the lift does nothing.
    finger.move(150, 120, 48);
    finger.up(64);
    expect(events).toEqual(['touchDown', 'touchDragInside', 'touchCancel']);
  });

  it('tracks one finger at a time', () => {
    const {events, tracker, h} = setup();
    h.finger(1).down(150, 120, 0, {recognizers: [], consumer: tracker});
    h.finger(2).down(160, 120, 10, {recognizers: [], consumer: tracker});
    h.finger(2).up(20);
    h.finger(1).up(30);
    expect(events).toEqual(['touchDown', 'touchUpInside']);
  });

  it('sets no timer and keeps no touch without keepsTouch', () => {
    const {tracker, h} = setup();
    h.finger(1).down(150, 120, 0, {
      recognizers: [],
      consumer: tracker,
      scroll: scrollProbe(() => true, true),
    });
    expect(tracker.keepsTouch).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
    h.finger(1).up(400);
  });
});

describe('PressTracker keepsTouch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the touch at once outside a scroller, until the lift', () => {
    const {tracker, h} = setup({keepsTouch: true});
    h.finger(1).down(150, 120, 0, {recognizers: [], consumer: tracker});
    expect(tracker.keepsTouch?.()).toBe(true);
    // Slid off the control, the delivered press keeps its touch.
    h.finger(1).move(200 + EXPANSION + 20, 120, 16);
    expect(tracker.keepsTouch?.()).toBe(true);
    h.finger(1).up(80);
    expect(tracker.keepsTouch?.()).toBe(false);
  });

  it("inside a scroller, keeps it after UIScrollView's content-touch delay", () => {
    const {tracker, h} = setup({keepsTouch: true});
    h.finger(1).down(150, 120, 0, {
      recognizers: [],
      consumer: tracker,
      scroll: scrollProbe(() => true, true),
    });
    expect(tracker.keepsTouch?.()).toBe(false);
    vi.advanceTimersByTime(DELAY - 1);
    expect(tracker.keepsTouch?.()).toBe(false);
    vi.advanceTimersByTime(1);
    expect(tracker.keepsTouch?.()).toBe(true);
    h.finger(1).up(400);
    expect(tracker.keepsTouch?.()).toBe(false);
  });

  it('never keeps a touch whose finger scrolled before the delay ran out', () => {
    const {tracker, h} = setup({keepsTouch: true});
    h.finger(1).down(150, 120, 0, {
      recognizers: [],
      consumer: tracker,
      scroll: scrollProbe(() => true, true),
    });
    h.finger(1).move(150, 135, 20);
    vi.advanceTimersByTime(DELAY * 2);
    expect(tracker.keepsTouch?.()).toBe(false);
    h.finger(1).up(400);
  });
});

describe('PressTracker in the arena', () => {
  it("lets a control veto an ancestor's single tap (UIControl's rule)", () => {
    const h = createHarness();
    const button = new PressTracker({getBounds: () => null, view: 'button'});
    const tap = new TapGestureRecognizer({name: 'tap'});
    tap.view = 'row';
    const double = new TapGestureRecognizer({
      name: 'double',
      numberOfTapsRequired: 2,
    });
    double.view = 'row';
    h.finger(1).down(0, 0, 0, {recognizers: [tap, double], consumer: button});
    expect(h.finger(1).up(50)).toBe('defer');
    expect(h.log[0]).toBe('tap:failed@50');
    expect(double.state).toBe('possible');
  });
});
