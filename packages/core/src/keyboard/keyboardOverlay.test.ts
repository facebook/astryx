// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file keyboardOverlay.test.ts
 * @input vitest, jsdom, getKeyboardLayoutGuide, a stand-in
 *   navigator.virtualKeyboard and visual viewport
 * @output Tests overlayWhileFocused on Chrome: the overlay is set while a
 *   registered field has focus (from the touch or the focus), restored when
 *   focus leaves every registered field, never taken from a page that set it,
 *   and the keyboard read from geometrychange while overlaying; a hide Chrome
 *   reports for a moment while focus moves between fields is held
 * @position Unit tests for the overlay part of keyboard/keyboardLayoutGuide.ts
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {getKeyboardLayoutGuide} from './keyboardLayoutGuide';
import type {KeyboardTransition} from './keyboardModel';

type FakeKeyboard = EventTarget & {
  overlaysContent: boolean;
  boundingRect: DOMRectReadOnly;
};
let keyboard: FakeKeyboard;
let viewport: EventTarget & {height: number; offsetTop: number; scale: number};
let field: HTMLTextAreaElement;
let other: HTMLInputElement;
let second: HTMLInputElement;
const cleanups: (() => void)[] = [];

function geometry(height: number) {
  keyboard.boundingRect = new DOMRect(0, 24, 411, height);
  keyboard.dispatchEvent(new Event('geometrychange'));
}

function pointer(type: string, target: Element) {
  const event = new Event(type, {bubbles: true});
  Object.assign(event, {pointerType: 'touch', isPrimary: true, pointerId: 1});
  target.dispatchEvent(event);
}

describe('overlayWhileFocused (Chrome)', () => {
  beforeEach(() => {
    keyboard = Object.assign(new EventTarget(), {
      overlaysContent: false,
      boundingRect: new DOMRect(0, 0, 0, 0),
    });
    Object.defineProperty(window.navigator, 'virtualKeyboard', {
      configurable: true,
      value: keyboard,
    });
    viewport = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });
    document.body.innerHTML =
      '<div id="composer"><textarea id="field"></textarea><button id="send">Send</button></div><input id="second"><input id="other">';
    field = document.getElementById('field') as HTMLTextAreaElement;
    second = document.getElementById('second') as HTMLInputElement;
    other = document.getElementById('other') as HTMLInputElement;
  });

  afterEach(() => {
    while (cleanups.length > 0) {
      cleanups.pop()?.();
    }
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.innerHTML = '';
    Reflect.deleteProperty(window.navigator, 'virtualKeyboard');
    Reflect.deleteProperty(window, 'visualViewport');
    vi.useRealTimers();
  });

  const register = (element: Element) => {
    cleanups.push(getKeyboardLayoutGuide(window).overlayWhileFocused(element));
  };

  it('overlays while a registered field has focus and restores when focus leaves it', () => {
    register(document.getElementById('composer')!);
    field.focus();
    expect(keyboard.overlaysContent).toBe(true);
    other.focus();
    expect(keyboard.overlaysContent).toBe(false);
  });

  it('sets the overlay at the touch on the field, before the keyboard shows', () => {
    register(document.getElementById('composer')!);
    pointer('pointerdown', field);
    expect(keyboard.overlaysContent).toBe(true);
  });

  it('does not overlay for a touch on something in the field that brings up no keyboard', () => {
    register(document.getElementById('composer')!);
    pointer('pointerdown', document.getElementById('send')!);
    expect(keyboard.overlaysContent).toBe(false);
  });

  it('lets go when a touch that set the overlay focuses nothing', () => {
    vi.useFakeTimers();
    register(document.getElementById('composer')!);
    pointer('pointerdown', field);
    pointer('pointercancel', field);
    vi.advanceTimersByTime(500);
    expect(keyboard.overlaysContent).toBe(false);
  });

  it('keeps the overlay while focus moves between registered fields', () => {
    register(document.getElementById('composer')!);
    register(second);
    field.focus();
    const writes: boolean[] = [];
    let value = keyboard.overlaysContent;
    Object.defineProperty(keyboard, 'overlaysContent', {
      configurable: true,
      get: () => value,
      set: (v: boolean) => {
        writes.push(v);
        value = v;
      },
    });
    second.focus();
    expect(value).toBe(true);
    expect(writes).toEqual([]);
  });

  it('never changes an overlay the page set itself', () => {
    keyboard.overlaysContent = true;
    register(document.getElementById('composer')!);
    field.focus();
    other.focus();
    expect(keyboard.overlaysContent).toBe(true);
  });

  it('lets go when the field unregisters', () => {
    const composer = document.getElementById('composer')!;
    const dispose =
      getKeyboardLayoutGuide(window).overlayWhileFocused(composer);
    field.focus();
    expect(keyboard.overlaysContent).toBe(true);
    dispose();
    expect(keyboard.overlaysContent).toBe(false);
  });

  it('reads the keyboard from geometrychange while overlaying and ignores viewport resizes', () => {
    vi.useFakeTimers();
    register(document.getElementById('composer')!);
    const seen: KeyboardTransition[] = [];
    cleanups.push(getKeyboardLayoutGuide(window).subscribe(t => seen.push(t)));
    field.focus();
    // Chrome's transient viewport resize while the page overlays the keyboard.
    viewport.height = window.innerHeight + 312;
    viewport.dispatchEvent(new Event('resize'));
    expect(seen).toEqual([]);
    geometry(312);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({kind: 'show', to: 312});
    expect(seen[0].curve).not.toBeNull();
    // Back, once the field has had focus a while.
    vi.advanceTimersByTime(1000);
    geometry(0);
    expect(seen.at(-1)).toMatchObject({kind: 'hide', to: 0});
  });

  it('does nothing without the VirtualKeyboard API', () => {
    Reflect.deleteProperty(window.navigator, 'virtualKeyboard');
    const guide = getKeyboardLayoutGuide(window);
    expect(guide.overlayWhileFocused(field)).toBeTypeOf('function');
  });
});

describe('focus moving between fields on Chrome', () => {
  let view: EventTarget & {height: number; offsetTop: number; scale: number};
  let a: HTMLInputElement;
  let b: HTMLInputElement;
  let button: HTMLButtonElement;
  const seen: KeyboardTransition[] = [];
  let unsubscribe: () => void = () => {};

  const resize = (inset: number) => {
    view.height = window.innerHeight - inset;
    view.dispatchEvent(new Event('resize'));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    view = Object.assign(new EventTarget(), {
      height: window.innerHeight,
      offsetTop: 0,
      scale: 1,
    });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: view,
    });
    document.body.innerHTML =
      '<input id="a"><button id="pop">Open</button><input id="b">';
    a = document.getElementById('a') as HTMLInputElement;
    b = document.getElementById('b') as HTMLInputElement;
    button = document.getElementById('pop') as HTMLButtonElement;
    seen.length = 0;
    unsubscribe = getKeyboardLayoutGuide(window).subscribe(t => seen.push(t));
    a.focus();
    resize(360);
    vi.advanceTimersByTime(1000);
  });

  afterEach(() => {
    unsubscribe();
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.innerHTML = '';
    Reflect.deleteProperty(window, 'visualViewport');
    vi.useRealTimers();
  });

  it('holds the momentary hide Chrome reports while focus moves to another field', () => {
    expect(seen.map(t => t.kind)).toEqual(['show']);
    // Through a popover's container to its field: Chrome reports the
    // keyboard gone, then back, within about 50 ms.
    button.focus();
    b.focus();
    vi.advanceTimersByTime(30);
    resize(0);
    vi.advanceTimersByTime(15);
    resize(360);
    vi.advanceTimersByTime(500);
    expect(seen.map(t => t.kind)).toEqual(['show']);
    expect(getKeyboardLayoutGuide(window).inset).toBe(360);
  });

  it('believes a hide that lasts once the move settles', () => {
    button.focus();
    b.focus();
    vi.advanceTimersByTime(30);
    resize(0);
    expect(seen.map(t => t.kind)).toEqual(['show']);
    vi.advanceTimersByTime(200);
    expect(seen.map(t => t.kind)).toEqual(['show', 'hide']);
  });

  it('hides at once when the field has had focus a while (Back)', () => {
    resize(0);
    expect(seen.map(t => t.kind)).toEqual(['show', 'hide']);
  });
});
