// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file gestureDelegates.test.ts
 * @input GestureArena with named recognizers driven by synthetic touches;
 *   GestureHost on jsdom elements; useGestureDelegate under React
 * @output Outside code relating to a component's recognizers: nothing changes
 *   without a delegate; an app pan waits for a named component recognizer and
 *   the reverse; outside vetoes through shouldBegin and shouldReceiveTouch
 *   (the first touch included); outside simultaneity; the owner's veto still
 *   wins; removal restores the default; gestureNamed's name lists and scopes
 *   (within, containing, refs); the hook's lifetime and latest functions
 * @position Unit tests of packages/core/src/gestures/gestureDelegates.ts and
 *   the delegate hooks of GestureArena.ts and GestureRecognizer.ts
 */

import {renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {
  PUBLISHED_GESTURES,
  addGestureDelegate,
  gestureNamed,
  useGestureDelegate,
} from '../gestureDelegates';
import {getGestureHost} from '../GestureHost';
import type {GestureRecognizer} from '../GestureRecognizer';
import {PanGestureRecognizer} from '../PanGestureRecognizer';
import {createHarness} from './harness';

const sheetDrag = gestureNamed('BottomSheet.drag');

/** A stand-in for a component's internal drag, published under its name. */
const sheet = (options = {}) =>
  new PanGestureRecognizer({
    name: 'BottomSheet.drag',
    direction: 'down',
    ...options,
  });

describe('relating to a component recognizer from outside', () => {
  it('changes nothing for code that declares nothing: the innermost wins', () => {
    const h = createHarness();
    const app = new PanGestureRecognizer({name: 'app'});
    const drag = sheet();
    h.finger(1)
      .down(0, 0, 0, {recognizers: [app, drag]})
      .move(0, 20, 16);
    expect(app.state).toBe('began');
    expect(drag.state).toBe('failed');
  });

  it("lets an app pan inside a sheet wait for the sheet's drag, and take what the drag fails on", () => {
    const down = createHarness();
    const app = new PanGestureRecognizer({
      name: 'app',
      shouldRequireFailureOf: (_self, other) => sheetDrag(other),
    });
    const drag = sheet();
    down
      .finger(1)
      .down(0, 0, 0, {recognizers: [app, drag]})
      .move(0, 20, 16);
    expect(drag.state).toBe('began');
    expect(app.state).toBe('failed');
    down.finger(1).up(32);

    // Sideways: the sheet's drag fails, so the app pan begins.
    down
      .finger(2)
      .down(0, 0, 100, {recognizers: [app, drag]})
      .move(20, 0, 116);
    expect(drag.state).toBe('failed');
    expect(app.state).toBe('began');
  });

  it("lets the sheet's drag wait for an app pan around it, and take the drag when the app pan fails", () => {
    const h = createHarness();
    let appWantsIt = true;
    const app = new PanGestureRecognizer({
      name: 'app',
      shouldBegin: () => appWantsIt,
      shouldBeRequiredToFailBy: (_self, other) => sheetDrag(other),
    });
    const drag = sheet();
    h.finger(1)
      .down(0, 0, 0, {recognizers: [drag, app]})
      .move(0, 20, 16);
    expect(app.state).toBe('began');
    expect(drag.state).toBe('failed');
    h.finger(1).up(32);

    appWantsIt = false;
    h.finger(2)
      .down(0, 0, 100, {recognizers: [drag, app]})
      .move(0, 20, 116);
    expect(app.state).toBe('failed');
    expect(drag.state).toBe('began');
  });

  it('vetoes a component recognizer through shouldBegin, leaving its touch to the browser', () => {
    const h = createHarness();
    const drag = sheet();
    let isEditing = true;
    h.arena.addDelegate(sheetDrag, {shouldBegin: () => !isEditing});
    h.finger(1)
      .down(0, 0, 0, {recognizers: [drag]})
      .move(0, 20, 16);
    expect(drag.state).toBe('failed');
    expect(h.claims).toEqual([]);
    h.finger(1).up(32);

    isEditing = false;
    h.finger(2)
      .down(0, 0, 100, {recognizers: [drag]})
      .move(0, 20, 116);
    expect(drag.state).toBe('began');
  });

  it('keeps a touch from a component recognizer through shouldReceiveTouch, from its first touch', () => {
    const h = createHarness();
    const drag = sheet();
    h.arena.addDelegate(sheetDrag, {shouldReceiveTouch: () => false});
    h.finger(1).down(0, 0, 0, {recognizers: [drag]});
    expect(drag.numberOfTouches).toBe(0);
  });

  it('lets two recognizers run together when an outside delegate allows it', () => {
    const h = createHarness();
    const app = new PanGestureRecognizer({name: 'app'});
    const drag = sheet();
    h.arena.addDelegate(sheetDrag, {
      shouldRecognizeSimultaneously: (_self, other) => other === app,
    });
    h.finger(1)
      .down(0, 0, 0, {recognizers: [app, drag]})
      .move(0, 20, 16);
    expect(app.state).toBe('began');
    expect(drag.state).toBe('began');
  });

  it("cannot overrule the owner's own veto", () => {
    const h = createHarness();
    const drag = sheet({shouldBegin: () => false});
    h.arena.addDelegate(sheetDrag, {shouldBegin: () => true});
    h.finger(1)
      .down(0, 0, 0, {recognizers: [drag]})
      .move(0, 20, 16);
    expect(drag.state).toBe('failed');
  });

  it('restores the default once the delegate is removed', () => {
    const h = createHarness();
    const drag = sheet();
    const remove = h.arena.addDelegate(sheetDrag, {shouldBegin: () => false});
    remove();
    h.finger(1)
      .down(0, 0, 0, {recognizers: [drag]})
      .move(0, 20, 16);
    expect(drag.state).toBe('began');
  });
});

describe('gestureNamed', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  function mount() {
    document.body.innerHTML = `
      <div id="sheetA"><div id="canvasA"></div></div>
      <div id="sheetB"><div id="canvasB"></div></div>`;
    const element = (id: string) => document.getElementById(id) as Element;
    const host = getGestureHost(document);
    const dragA = sheet();
    const dragB = sheet();
    const detachA = host.attach(element('sheetA'), dragA);
    const detachB = host.attach(element('sheetB'), dragB);
    return {element, dragA, dragB, detach: () => (detachA(), detachB())};
  }

  it('matches a name, or any of a list, and only published-style names it is given', () => {
    const drag = sheet();
    const toast = new PanGestureRecognizer({name: 'Toast.swipe'});
    expect(gestureNamed('BottomSheet.drag')(drag)).toBe(true);
    expect(gestureNamed('BottomSheet.drag')(toast)).toBe(false);
    expect(gestureNamed(['Toast.swipe', 'BottomSheet.drag'])(toast)).toBe(true);
    // Every published name is Component.role.
    for (const name of Object.keys(PUBLISHED_GESTURES)) {
      expect(name).toMatch(/^[A-Z][A-Za-z]+\.[a-z][A-Za-z]+$/);
    }
  });

  it('tells two instances apart by the element they are attached to', () => {
    const {element, dragA, dragB, detach} = mount();
    const withinA = gestureNamed('BottomSheet.drag', {
      within: element('sheetA'),
    });
    expect(withinA(dragA)).toBe(true);
    expect(withinA(dragB)).toBe(false);
    const aroundCanvasB = gestureNamed('BottomSheet.drag', {
      containing: element('canvasB'),
    });
    expect(aroundCanvasB(dragA)).toBe(false);
    expect(aroundCanvasB(dragB)).toBe(true);
    // A ref is read when a touch asks; an empty one matches nothing.
    const ref: {current: Element | null} = {current: null};
    const inRef = gestureNamed('BottomSheet.drag', {within: ref});
    expect(inRef(dragA)).toBe(false);
    ref.current = element('sheetA');
    expect(inRef(dragA)).toBe(true);
    detach();
  });

  it('registers delegates on the document host', () => {
    const {element, dragA, dragB, detach} = mount();
    const remove = addGestureDelegate(
      document,
      gestureNamed('BottomSheet.drag', {within: element('sheetA')}),
      {shouldBegin: () => false},
    );
    const arena = getGestureHost(document).arena;
    expect(arena.delegatesFor(dragA)).toHaveLength(1);
    expect(arena.delegatesFor(dragB)).toHaveLength(0);
    remove();
    expect(arena.delegatesFor(dragA)).toHaveLength(0);
    detach();
  });
});

describe('useGestureDelegate', () => {
  it('applies for the component lifetime, with the latest functions, and can be turned off', () => {
    const drag = sheet();
    const arena = getGestureHost(document).arena;
    const begins = (recognizer: GestureRecognizer) =>
      arena
        .delegatesFor(recognizer)
        .every(delegate => delegate.shouldBegin?.(recognizer) ?? true);
    const {rerender, unmount} = renderHook(
      (props: {editing: boolean; enabled: boolean}) =>
        useGestureDelegate(
          sheetDrag,
          {shouldBegin: () => !props.editing},
          {isEnabled: props.enabled},
        ),
      {initialProps: {editing: true, enabled: true}},
    );
    expect(arena.delegatesFor(drag)).toHaveLength(1);
    expect(begins(drag)).toBe(false);
    rerender({editing: false, enabled: true});
    expect(arena.delegatesFor(drag)).toHaveLength(1);
    expect(begins(drag)).toBe(true);
    rerender({editing: true, enabled: false});
    expect(arena.delegatesFor(drag)).toHaveLength(0);
    rerender({editing: true, enabled: true});
    unmount();
    expect(arena.delegatesFor(drag)).toHaveLength(0);
  });
});
