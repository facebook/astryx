// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file GestureHost.test.ts
 * @input A GestureHost on the jsdom document, real DOM listeners, and
 *   dispatched touch, pointer, click, contextmenu and scroll events with
 *   explicit timestamps
 * @output The DOM integration: hit-path collection (shadow DOM included),
 *   touch-action negotiation, cancelling touchmove only while claimed,
 *   click suppression and replay, browser takeover, the mouse path, hover,
 *   context menus, focus loss
 * @position jsdom integration tests of packages/core/src/gestures
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {UIKIT_GESTURES} from '../../motion/uikit/gestures';
import {GestureHost} from '../GestureHost';
import {HoverGestureRecognizer} from '../HoverGestureRecognizer';
import {LongPressGestureRecognizer} from '../LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../PanGestureRecognizer';
import {TapGestureRecognizer} from '../TapGestureRecognizer';
import {ManualClock, RecordingConsumer} from './harness';

interface Contact {
  id: number;
  x: number;
  y: number;
  target?: EventTarget;
}

function touch(
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  target: EventTarget,
  changed: Contact[],
  all: Contact[],
  time: number,
  cancelable = true,
): Event {
  const event = new Event(type, {bubbles: true, cancelable, composed: true});
  const toTouch = (contact: Contact) => ({
    identifier: contact.id,
    clientX: contact.x,
    clientY: contact.y,
    target: contact.target ?? target,
  });
  Object.defineProperty(event, 'changedTouches', {value: changed.map(toTouch)});
  Object.defineProperty(event, 'touches', {value: all.map(toTouch)});
  Object.defineProperty(event, 'timeStamp', {value: time});
  target.dispatchEvent(event);
  return event;
}

function pointer(
  type: string,
  target: EventTarget,
  init: {
    id?: number;
    pointerType: string;
    x: number;
    y: number;
    buttons?: number;
    time: number;
  },
): Event {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId: init.id ?? 1,
    pointerType: init.pointerType,
    clientX: init.x,
    clientY: init.y,
    button: 0,
    buttons: init.buttons ?? 0,
  });
  Object.defineProperty(event, 'timeStamp', {value: init.time});
  target.dispatchEvent(event);
  return event;
}

let host: GestureHost;
let clock: ManualClock;
let detachers: (() => void)[];

function mount(html: string): Record<string, HTMLElement> {
  document.body.innerHTML = html;
  const elements: Record<string, HTMLElement> = {};
  for (const element of document.querySelectorAll<HTMLElement>('[id]')) {
    elements[element.id] = element;
  }
  return elements;
}

beforeEach(() => {
  clock = new ManualClock();
  host = new GestureHost(document, {clock});
  detachers = [];
});

afterEach(() => {
  for (const detach of detachers) {
    detach();
  }
  document.body.innerHTML = '';
});

describe('GestureHost', () => {
  it('sets touch-action and the long-press styles on attach, and restores them on detach', () => {
    const {box} = mount('<div id="box" style="color: red"></div>');
    const set = vi.spyOn(box.style, 'setProperty');
    const remove = vi.spyOn(box.style, 'removeProperty');
    const detachPan = host.attach(
      box,
      new PanGestureRecognizer({direction: 'horizontal'}),
    );
    const detachPress = host.attach(box, new LongPressGestureRecognizer());
    expect(set).toHaveBeenCalledWith('touch-action', 'pan-y pinch-zoom');
    expect(set).toHaveBeenCalledWith('-webkit-touch-callout', 'none');
    expect(set).toHaveBeenCalledWith('user-select', 'none');
    detachPress();
    expect(remove).toHaveBeenCalledWith('-webkit-touch-callout');
    detachPan();
    expect(remove).toHaveBeenCalledWith('touch-action');
  });

  it('cancels touchmove only once a recognizer owns the touch, and swallows the click', () => {
    const {box, child} = mount('<div id="box"><span id="child">x</span></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const states: string[] = [];
    pan.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, pan));
    const finger = {id: 7, x: 10, y: 10};
    touch('touchstart', child, [finger], [finger], 0);
    const early = touch(
      'touchmove',
      child,
      [{...finger, x: 15}],
      [{...finger, x: 15}],
      16,
    );
    expect(early.defaultPrevented).toBe(false);
    expect(pan.state).toBe('possible');
    const claimed = touch(
      'touchmove',
      child,
      [{...finger, x: 30}],
      [{...finger, x: 30}],
      32,
    );
    expect(claimed.defaultPrevented).toBe(true);
    expect(states).toEqual(['began']);
    const end = touch('touchend', child, [{...finger, x: 30}], [], 48);
    expect(end.defaultPrevented).toBe(true);
    expect(states).toEqual(['began', 'ended']);
  });

  it('leaves the touchend (and the click) alone when nothing claimed the touch', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    detachers.push(host.attach(box, pan));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    touch('touchmove', box, [{...finger, x: 13}], [{...finger, x: 13}], 16);
    const end = touch('touchend', box, [{...finger, x: 13}], [], 40);
    expect(end.defaultPrevented).toBe(false);
  });

  it('keeps cancelling while a second finger moves with the claimed one', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({maximumNumberOfTouches: 1});
    detachers.push(host.attach(box, pan));
    const first = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [first], [first], 0);
    const moved = {...first, x: 40};
    touch('touchmove', box, [moved], [moved], 16);
    const second = {id: 2, x: 200, y: 200};
    touch('touchstart', box, [second], [moved, second], 20);
    const pinchLike = touch(
      'touchmove',
      box,
      [{...second, x: 260}],
      [moved, {...second, x: 260}],
      32,
    );
    expect(pinchLike.defaultPrevented).toBe(true);
    expect(pan.state).toBe('began');
    expect(pan.numberOfTouches).toBe(1);
  });

  it('reads pointercancel on a finger as the browser taking it', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const view = new RecordingConsumer();
    const events: string[] = [];
    detachers.push(host.attach(box, pan), host.attachConsumer(box, view));
    pan.addTransitionListener((_r, _from, to) => events.push(to));
    const finger = {id: 3, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    pointer('pointercancel', box, {
      id: 99,
      pointerType: 'touch',
      x: 10,
      y: 14,
      time: 20,
    });
    expect(events).toEqual(['failed', 'possible']);
    // The view's touch is cancelled, with no release.
    expect(view.events.map(event => event.split(':')[0])).toEqual([
      'began',
      'cancelled',
    ]);
  });

  it("pairs a finger's pointer with its touch: pointermoves inside the browser's touchmove slop count", () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const states: string[] = [];
    pan.addListener(r => states.push(`${r.state}:${r.translation().x}`));
    detachers.push(host.attach(box, pan));
    // Chromium's order: pointerdown, then touchstart, at the same spot.
    pointer('pointerdown', box, {
      id: 21,
      pointerType: 'touch',
      x: 10,
      y: 10,
      buttons: 1,
      time: 0,
    });
    const finger = {id: 0, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    // No touchmove yet (inside the slop), but the pointer moved 12 px.
    pointer('pointermove', box, {
      id: 21,
      pointerType: 'touch',
      x: 16,
      y: 10,
      buttons: 1,
      time: 16,
    });
    pointer('pointermove', box, {
      id: 21,
      pointerType: 'touch',
      x: 22,
      y: 10,
      buttons: 1,
      time: 32,
    });
    // Translation 2: the 10 px hysteresis is left out, as in UIKit.
    expect(states).toEqual(['began:2']);
    // The first touchmove (the same input as a pointermove) is cancelled
    // and not read twice.
    pointer('pointermove', box, {
      id: 21,
      pointerType: 'touch',
      x: 26,
      y: 10,
      buttons: 1,
      time: 48,
    });
    const first = touch(
      'touchmove',
      box,
      [{...finger, x: 26}],
      [{...finger, x: 26}],
      48,
    );
    expect(first.defaultPrevented).toBe(true);
    expect(states).toEqual(['began:2', 'changed:6']);
    // pointercancel names the finger exactly, whatever its coordinates say.
    pointer('pointercancel', box, {
      id: 21,
      pointerType: 'touch',
      x: 0,
      y: 0,
      time: 60,
    });
    expect(host.arena.getTouch(1)?.takenByBrowser).toBe(true);
  });

  it('names the pointer a finger, a pen or a mouse is driven by', () => {
    const {box} = mount('<div id="box"></div>');
    const press = new LongPressGestureRecognizer({name: 'press'});
    detachers.push(host.attach(box, press));
    // A finger: its pointerdown pairs with its touchstart.
    pointer('pointerdown', box, {
      id: 31,
      pointerType: 'touch',
      x: 10,
      y: 10,
      buttons: 1,
      time: 0,
    });
    const finger = {id: 0, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    const [held] = press.trackedTouches;
    expect(host.pointerIdOf(held)).toBe(31);
    expect(host.pointerIdOf(held.id)).toBe(31);
    touch('touchend', box, [finger], [], 40);
    // A pen is its own pointer.
    pointer('pointerdown', box, {
      id: 7,
      pointerType: 'pen',
      x: 10,
      y: 10,
      buttons: 1,
      time: 100,
    });
    const [pen] = press.trackedTouches;
    expect(host.pointerIdOf(pen)).toBe(7);
    pointer('pointerup', box, {
      id: 7,
      pointerType: 'pen',
      x: 10,
      y: 10,
      time: 140,
    });
    expect(host.pointerIdOf(pen)).toBeNull();
  });

  it('reads a touchmove that can no longer be cancelled as the browser taking it', () => {
    const {box} = mount('<div id="box"></div>');
    const tap = new TapGestureRecognizer({name: 'tap'});
    const events: string[] = [];
    tap.addTransitionListener((_r, _from, to) => events.push(to));
    detachers.push(host.attach(box, tap));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    touch(
      'touchmove',
      box,
      [{...finger, y: 14}],
      [{...finger, y: 14}],
      16,
      false,
    );
    expect(events).toEqual(['failed', 'possible']);
  });

  it('reads a scroll above an unclaimed touch as the browser taking it', () => {
    const {list, row} = mount('<div id="list"><div id="row"></div></div>');
    const tap = new TapGestureRecognizer({name: 'tap'});
    detachers.push(host.attach(row, tap));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', row, [finger], [finger], 0);
    list.dispatchEvent(new Event('scroll'));
    expect(tap.state).toBe('possible');
    expect(tap.numberOfTouches).toBe(0);
  });

  it('drives mouse input through Pointer Events', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    let released = {x: 0, y: 0};
    pan.addListener(r => {
      if (r.state === 'ended') {
        released = r.velocity();
      }
    });
    detachers.push(host.attach(box, pan));
    pointer('pointerdown', box, {
      pointerType: 'mouse',
      x: 0,
      y: 0,
      buttons: 1,
      time: 0,
    });
    for (let t = 8; t <= 96; t += 8) {
      pointer('pointermove', box, {
        pointerType: 'mouse',
        x: t * 2,
        y: 0,
        buttons: 1,
        time: t,
      });
    }
    pointer('pointerup', box, {pointerType: 'mouse', x: 192, y: 0, time: 104});
    expect(pan.state).toBe('possible');
    expect(released.x).toBeCloseTo(2000, 0);
  });

  it('cancels the context menu while a long press owns the touch', () => {
    const {box} = mount('<div id="box"></div>');
    const press = new LongPressGestureRecognizer({name: 'press'});
    detachers.push(host.attach(box, press));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    const before = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    box.dispatchEvent(before);
    expect(before.defaultPrevented).toBe(false);
    host.arena.advanceTime(500);
    expect(press.state).toBe('began');
    const during = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    box.dispatchEvent(during);
    expect(during.defaultPrevented).toBe(true);
  });

  it('holds the click of a tap a double tap may claim, and replays it when the double tap fails', () => {
    const {row, button} = mount(
      '<div id="row"><button id="button">Go</button></div>',
    );
    const double = new TapGestureRecognizer({
      name: 'double',
      numberOfTapsRequired: 2,
    });
    detachers.push(host.attach(row, double));
    const clicks: {target: EventTarget | null; detail: number}[] = [];
    button.addEventListener('click', event =>
      clicks.push({target: event.target, detail: event.detail}),
    );
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', button, [finger], [finger], 0);
    const end = touch('touchend', button, [finger], [], 60);
    expect(end.defaultPrevented).toBe(true);
    expect(clicks).toEqual([]);
    const interval = UIKIT_GESTURES.tap.maximumIntervalBetweenTaps.value;
    host.arena.advanceTime(60 + interval);
    expect(clicks).toEqual([{target: button, detail: 1}]);
  });

  it('collects recognizers across shadow roots', () => {
    const {outer} = mount('<div id="outer"></div>');
    const shadow = outer.attachShadow({mode: 'open'});
    shadow.innerHTML = '<span id="inner">x</span>';
    const inner = shadow.getElementById('inner') as HTMLElement;
    const tap = new TapGestureRecognizer({name: 'tap'});
    const actions: string[] = [];
    tap.addListener(r => actions.push(r.state));
    detachers.push(host.attach(outer, tap));
    const finger = {id: 1, x: 5, y: 5, target: inner};
    touch('touchstart', inner, [finger], [finger], 0);
    touch('touchend', inner, [finger], [], 50);
    expect(actions).toEqual(['ended']);
  });

  it('drives hover recognizers from a hovering mouse', () => {
    const {box, other} = mount('<div id="box"></div><div id="other"></div>');
    const hover = new HoverGestureRecognizer();
    const states: string[] = [];
    hover.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, hover));
    pointer('pointermove', box, {pointerType: 'mouse', x: 1, y: 1, time: 0});
    pointer('pointermove', box, {pointerType: 'mouse', x: 2, y: 1, time: 16});
    pointer('pointermove', other, {
      pointerType: 'mouse',
      x: 300,
      y: 1,
      time: 32,
    });
    expect(states).toEqual(['began', 'changed', 'ended']);
    // A finger never hovers.
    pointer('pointermove', box, {pointerType: 'touch', x: 1, y: 1, time: 48});
    expect(states).toHaveLength(3);
  });

  it('cancels every touch in flight when the window loses focus', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const states: string[] = [];
    pan.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, pan));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    touch('touchmove', box, [{...finger, x: 40}], [{...finger, x: 40}], 16);
    window.dispatchEvent(new Event('blur'));
    expect(states).toEqual(['began', 'cancelled']);
  });

  it('finishes a gesture whose target left the document mid-gesture', () => {
    const {box, child} = mount('<div id="box"><span id="child">x</span></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const states: string[] = [];
    pan.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, pan));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', child, [finger], [finger], 0);
    touch('touchmove', child, [{...finger, x: 40}], [{...finger, x: 40}], 16);
    // A re-render replaces the span: its events no longer reach the document.
    child.remove();
    const move = touch(
      'touchmove',
      child,
      [{...finger, x: 60}],
      [{...finger, x: 60}],
      32,
    );
    expect(move.defaultPrevented).toBe(true);
    touch('touchend', child, [{...finger, x: 60}], [], 48);
    // The move and the lift after the removal still reached the pan.
    expect(states).toEqual(['began', 'changed', 'ended']);
    expect(host.arena.touches).toEqual([]);
  });

  it('cancels a finger the events say is no longer down', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const states: string[] = [];
    pan.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, pan));
    const first = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [first], [first], 0);
    touch('touchmove', box, [{...first, x: 40}], [{...first, x: 40}], 16);
    // Its touchend went to a node outside the document; the next event for
    // another finger no longer lists it.
    const other = {id: 2, x: 300, y: 300};
    touch('touchmove', document.body, [other], [other], 32);
    expect(states).toEqual(['began', 'cancelled']);
  });

  it('treats a reused finger number as a new touch', () => {
    const {box} = mount('<div id="box"></div>');
    const tap = new TapGestureRecognizer({name: 'tap'});
    const states: string[] = [];
    tap.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, tap));
    const finger = {id: 4, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    // No touchend reached us; the same identifier lands again.
    touch('touchstart', box, [finger], [finger], 500);
    touch('touchend', box, [finger], [], 560);
    expect(states).toEqual(['ended']);
  });

  it('cancels every finger on a touchcancel that names none', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    const states: string[] = [];
    pan.addListener(r => states.push(r.state));
    detachers.push(host.attach(box, pan));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', box, [finger], [finger], 0);
    touch('touchmove', box, [{...finger, x: 40}], [{...finger, x: 40}], 16);
    box.dispatchEvent(new Event('touchcancel', {bubbles: true}));
    expect(states).toEqual(['began', 'cancelled']);
  });

  it('reads epoch-stamped events on the arena clock', () => {
    const {box} = mount('<div id="box"></div>');
    const pan = new PanGestureRecognizer({name: 'pan'});
    let released = {x: 0, y: 0};
    pan.addListener(r => {
      if (r.state === 'ended') {
        released = r.velocity();
      }
    });
    detachers.push(host.attach(box, pan));
    const epoch = performance.timeOrigin + 5000;
    const finger = {id: 1, x: 0, y: 10};
    touch('touchstart', box, [finger], [finger], epoch);
    for (let t = 8; t <= 96; t += 8) {
      const at = {...finger, x: t};
      touch('touchmove', box, [at], [at], epoch + t);
    }
    touch('touchend', box, [{...finger, x: 96}], [], epoch + 100);
    expect(released.x).toBeCloseTo(1000, 0);
    expect(host.arena.now()).toBeLessThan(1e9);
  });

  it('ignores touches that land outside every attached element', () => {
    const {box, elsewhere} = mount(
      '<div id="box"></div><div id="elsewhere"></div>',
    );
    const pan = new PanGestureRecognizer({name: 'pan'});
    detachers.push(host.attach(box, pan));
    const finger = {id: 1, x: 10, y: 10};
    touch('touchstart', elsewhere, [finger], [finger], 0);
    const move = touch(
      'touchmove',
      elsewhere,
      [{...finger, x: 60}],
      [{...finger, x: 60}],
      16,
    );
    expect(move.defaultPrevented).toBe(false);
    expect(host.arena.touches).toEqual([]);
  });
});
