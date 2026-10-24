// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fingerTouch.ts
 * @input Testing Library's act, jsdom
 * @output Exports place (stub an element's layout box) and finger (a contact
 *   that dispatches touch events, with ids and a clock that only moves
 *   forward): the input the gesture system reads in jsdom
 * @position Test-only helper for menu suites whose finger tracking runs on
 *   the gesture system (useMenuPress's 'uikit' touch tracking)
 */

import {act} from '@testing-library/react';

interface Point {
  x: number;
  y: number;
}

/** Stub an element's layout box (jsdom lays nothing out). */
export function place(
  element: Element,
  box: {left: number; top: number; width: number; height: number},
): void {
  const rect = DOMRect.fromRect({
    x: box.left,
    y: box.top,
    width: box.width,
    height: box.height,
  });
  element.getBoundingClientRect = () => rect;
}

/** Stack the elements as rows, 40 px tall with a 10 px gap, from y = 0. */
export function placeRows(rows: ReadonlyArray<Element>, left = 0): void {
  rows.forEach((row, index) => {
    place(row, {left, top: index * 50, width: 200, height: 40});
  });
}

/** The center of a row placed by placeRows. */
export function rowCenter(index: number, left = 0): Point {
  return {x: left + 100, y: index * 50 + 20};
}

let nextId = 100;
let time = 10_000;

function dispatchTouch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  target: EventTarget,
  id: number,
  point: Point,
): Event {
  const event = new Event(type, {bubbles: true, cancelable: true});
  const entry = {identifier: id, clientX: point.x, clientY: point.y, target};
  const isLift = type === 'touchend' || type === 'touchcancel';
  Object.defineProperty(event, 'changedTouches', {value: [entry]});
  Object.defineProperty(event, 'touches', {value: isLift ? [] : [entry]});
  Object.defineProperty(event, 'timeStamp', {value: time});
  // Inside act: what the press runs (a row's click) re-renders at once.
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

/**
 * A finger. Each event advances the shared clock (16 ms by default); `down`
 * starts a second after the later of that clock and the page's, so presses
 * never chain into one another and never land in the arena's past.
 */
export function finger() {
  const id = nextId++;
  return {
    down(target: Element, point: Point) {
      // Never behind the page's own clock: the arena orders every input (a
      // mouse click's real timestamp included) on one timeline.
      time = Math.max(time, performance.now()) + 1000;
      return dispatchTouch('touchstart', target, id, point);
    },
    move(target: Element, point: Point, after = 16) {
      time += after;
      return dispatchTouch('touchmove', target, id, point);
    },
    up(target: Element, point: Point, after = 16) {
      time += after;
      return dispatchTouch('touchend', target, id, point);
    },
    cancel(target: Element, point: Point) {
      time += 16;
      return dispatchTouch('touchcancel', target, id, point);
    },
  };
}
