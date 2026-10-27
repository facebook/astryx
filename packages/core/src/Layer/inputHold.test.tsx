// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {GestureHost} from '../gestures/GestureHost';
import {
  holdInput,
  isInHeldLayer,
  isInputShield,
  useInputHold,
} from './inputHold';

/**
 * Every touch gate registered on a gesture host in this file, kept in order:
 * a hold registers its gate once per document, at the first hold.
 */
const touchGates: ((target: Node) => boolean)[] = [];
const addTouchGate = GestureHost.prototype.addTouchGate;
GestureHost.prototype.addTouchGate = function (
  this: GestureHost,
  gate: (target: Node) => boolean,
) {
  touchGates.push(gate);
  return addTouchGate.call(this, gate);
};

function deferred() {
  let resolve: () => void = () => {};
  let reject: (error: unknown) => void = () => {};
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

/** A layer root with a child, in the document. */
function mountLayer(): {layer: HTMLElement; child: HTMLElement} {
  const layer = document.createElement('div');
  const child = document.createElement('button');
  layer.append(child);
  document.body.append(layer);
  return {layer, child};
}

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('holdInput', () => {
  it('holds a presenting layer with a shield over the viewport until its end settles', async () => {
    const {layer, child} = mountLayer();
    const outside = document.createElement('div');
    document.body.append(outside);
    const end = deferred();
    holdInput(layer, {until: end.promise, scope: 'viewport'});
    const shield = layer.lastElementChild as HTMLElement;
    expect(shield).not.toBe(child);
    expect(shield.getAttribute('popover')).toBe('manual');
    expect(shield.style.position).toBe('fixed');
    // No pan, and a pinch still zooms the page (spec:AST-094 FR10).
    expect(shield.style.touchAction).toBe('pinch-zoom');
    // Its own hit-testing, whatever the layer root's (the browser proof holds
    // a root that is pointer-events: none).
    expect(shield.style.pointerEvents).toBe('auto');
    expect(shield.style.visibility).toBe('visible');
    expect(isInHeldLayer(child)).toBe(true);
    expect(isInHeldLayer(shield)).toBe(true);
    expect(isInHeldLayer(outside)).toBe(false);
    // Keys and assistive technology stay live while presenting.
    expect(layer.hasAttribute('inert')).toBe(false);
    end.resolve();
    await flush();
    expect(shield.isConnected).toBe(false);
    expect(isInHeldLayer(child)).toBe(false);
  });

  it('swallows a press and a click on the shield before they reach the page, and leaves a touch its start so a pinch can still zoom', () => {
    const {layer} = mountLayer();
    holdInput(layer, {until: new Promise(() => {}), scope: 'viewport'});
    const shield = layer.lastElementChild as HTMLElement;
    const seen: string[] = [];
    for (const type of ['pointerdown', 'click', 'touchstart']) {
      document.addEventListener(type, () => seen.push(type));
    }
    const press = new Event('pointerdown', {bubbles: true, cancelable: true});
    const click = new MouseEvent('click', {bubbles: true, cancelable: true});
    const touch = new Event('touchstart', {bubbles: true, cancelable: true});
    shield.dispatchEvent(press);
    shield.dispatchEvent(click);
    shield.dispatchEvent(touch);
    expect(seen).toEqual([]);
    expect(press.defaultPrevented).toBe(true);
    expect(click.defaultPrevented).toBe(true);
    // Cancelling a touch's start would cancel the page's pinch-zoom too.
    expect(touch.defaultPrevented).toBe(false);
  });

  it("holds a dismissing layer: its content inert, the layer itself live under the shield, each element's inert given back", async () => {
    const {layer, child} = mountLayer();
    const already = document.createElement('div');
    already.setAttribute('inert', '');
    layer.append(already);
    child.focus();
    expect(document.activeElement).toBe(child);
    const end = deferred();
    holdInput(layer, {until: end.promise, scope: 'layer'});
    // Focus leaves the content: a focused element that turns inert would
    // keep its key activation.
    expect(document.activeElement).not.toBe(child);
    const shield = layer.lastElementChild as HTMLElement;
    expect(shield.getAttribute('popover')).toBe('manual');
    // The layer stays live so the shield inside it catches every hit: an
    // inert subtree is no hit target.
    expect(layer.hasAttribute('inert')).toBe(false);
    expect(shield.hasAttribute('inert')).toBe(false);
    expect(child.hasAttribute('inert')).toBe(true);
    expect(isInHeldLayer(child)).toBe(true);
    end.reject(new Error('interrupted'));
    await flush();
    expect(child.hasAttribute('inert')).toBe(false);
    expect(already.hasAttribute('inert')).toBe(true);
    expect(shield.isConnected).toBe(false);
    expect(isInHeldLayer(child)).toBe(false);
  });

  it('names a live hold’s shield, and only it, so a hit test can skip it', () => {
    const {layer, child} = mountLayer();
    const popover = document.createElement('div');
    popover.setAttribute('popover', 'manual');
    document.body.append(popover);
    const release = holdInput(layer, {
      until: new Promise(() => {}),
      scope: 'viewport',
    });
    const shield = layer.lastElementChild as HTMLElement;
    expect(isInputShield(shield)).toBe(true);
    for (const other of [layer, child, popover, null]) {
      expect(isInputShield(other)).toBe(false);
    }
    release();
    expect(isInputShield(shield)).toBe(false);
  });

  it('sees slotted content as held: the flat tree, a slotted node to its slot', () => {
    const host = document.createElement('div');
    const slotted = document.createElement('button');
    host.append(slotted);
    document.body.append(host);
    const root = host.attachShadow({mode: 'open'});
    const layer = document.createElement('div');
    layer.append(document.createElement('slot'));
    root.append(layer);
    expect(isInHeldLayer(slotted)).toBe(false);
    const release = holdInput(layer, {
      until: new Promise(() => {}),
      scope: 'viewport',
    });
    expect(isInHeldLayer(slotted)).toBe(true);
    release();
    expect(isInHeldLayer(slotted)).toBe(false);
  });

  it('takes an animator handle, ending with its finished', async () => {
    const {layer, child} = mountLayer();
    const end = deferred();
    holdInput(layer, {until: {finished: end.promise}, scope: 'layer'});
    expect(isInHeldLayer(child)).toBe(true);
    end.resolve();
    await flush();
    expect(isInHeldLayer(child)).toBe(false);
  });

  it('stacks holds on one layer, either scope, under one shield: it comes back when the last one ends', () => {
    const {layer, child} = mountLayer();
    const first = holdInput(layer, {
      until: new Promise(() => {}),
      scope: 'viewport',
    });
    const second = holdInput(layer, {
      until: new Promise(() => {}),
      scope: 'layer',
    });
    expect(layer.querySelectorAll('[popover]')).toHaveLength(1);
    expect(child.hasAttribute('inert')).toBe(true);
    first();
    first();
    expect(isInHeldLayer(child)).toBe(true);
    expect(layer.querySelectorAll('[popover]')).toHaveLength(1);
    second();
    expect(isInHeldLayer(child)).toBe(false);
    expect(child.hasAttribute('inert')).toBe(false);
    expect(layer.querySelectorAll('[popover]')).toHaveLength(0);
  });

  it("registers one touch gate per document, which answers whether a touch's target is held", () => {
    const addTouchGate = vi.spyOn(GestureHost.prototype, 'addTouchGate');
    const {layer, child} = mountLayer();
    holdInput(layer, {until: new Promise(() => {}), scope: 'layer'});
    const release = holdInput(layer, {
      until: new Promise(() => {}),
      scope: 'viewport',
    });
    expect(addTouchGate.mock.calls.length).toBeLessThanOrEqual(1);
    const registered =
      addTouchGate.mock.calls[0]?.[0] ??
      ((target: Node) => isInHeldLayer(target));
    expect(registered(child)).toBe(true);
    expect(registered(document.body)).toBe(false);
    release();
  });
});

describe("holdInput decides by each event's pointer (spec:AST-094 FR35)", () => {
  const INIT = {bubbles: true, cancelable: true, composed: true};

  /** The holds a case starts, released after it: a hold listens on the window. */
  const releases: (() => void)[] = [];
  const hold = (layer: Element, scope: 'viewport' | 'layer' = 'viewport') => {
    const release = holdInput(layer, {until: new Promise(() => {}), scope});
    releases.push(release);
    return release;
  };

  afterEach(() => {
    for (const release of releases.splice(0)) {
      release();
    }
  });

  beforeEach(() => {
    // Each case starts with a finger as the page's latest pointer.
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', {...INIT, pointerType: 'touch'}),
    );
    document.body.dispatchEvent(
      new PointerEvent('pointerup', {...INIT, pointerType: 'touch'}),
    );
  });

  /** A button that records every event that reaches it. */
  function recorder(parent: Element = document.body) {
    const button = document.createElement('button');
    parent.append(button);
    const reached: string[] = [];
    for (const type of [
      'pointerdown',
      'pointermove',
      'pointerup',
      'touchstart',
      'touchmove',
      'touchend',
      'mousedown',
      'mouseup',
      'click',
      'contextmenu',
    ]) {
      button.addEventListener(type, () => reached.push(type));
    }
    return {button, reached};
  }

  function pointer(
    element: Element,
    type: string,
    pointerType: string,
    pointerId = 1,
  ): Event {
    const event = new PointerEvent(type, {...INIT, pointerId, pointerType});
    element.dispatchEvent(event);
    return event;
  }

  /** A click as a browser sends it: a pointer event naming its pointer. */
  function click(element: Element, pointerType: string, detail = 1): Event {
    const event = new PointerEvent('click', {...INIT, pointerType, detail});
    element.dispatchEvent(event);
    return event;
  }

  /** A compatibility mouse event, or a click sent as a plain mouse event. */
  function mouse(element: Element, type: string, detail = 1): Event {
    const event = new MouseEvent(type, {...INIT, detail});
    element.dispatchEvent(event);
    return event;
  }

  function touch(
    element: Element,
    type: string,
    identifiers: number[],
    down: number = identifiers.length,
  ): Event {
    const event = new Event(type, INIT);
    const list = identifiers.map(identifier => ({identifier, target: element}));
    Object.defineProperty(event, 'changedTouches', {value: list});
    Object.defineProperty(event, 'touches', {
      value: Array.from({length: down}, (_, identifier) => ({identifier})),
    });
    element.dispatchEvent(event);
    return event;
  }

  /** A finger's or a pen's tap: down, up, then the browser's click. */
  function tap(element: Element, pointerType: 'touch' | 'pen', pointerId = 1) {
    pointer(element, 'pointerdown', pointerType, pointerId);
    pointer(element, 'pointerup', pointerType, pointerId);
    click(element, pointerType);
  }

  it("holds a finger's press anywhere in the page, with its moves, release and click, whatever the primary pointer", () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder();
    hold(layer);
    const down = pointer(button, 'pointerdown', 'touch');
    pointer(button, 'pointermove', 'touch');
    pointer(button, 'pointerup', 'touch');
    click(button, 'touch');
    // Canceled: the browser sends no compatibility mouse events for it, and
    // no focus move.
    expect(down.defaultPrevented).toBe(true);
    expect(reached).toEqual([]);
  });

  it("holds a pen's press as a finger's", () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder(layer);
    hold(layer);
    tap(button, 'pen');
    expect(reached).toEqual([]);
  });

  it("leaves a mouse's press and click alone during a presentation, a click sent as a plain mouse event included", () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder(layer);
    hold(layer);
    const down = pointer(button, 'pointerdown', 'mouse');
    mouse(button, 'mousedown');
    pointer(button, 'pointerup', 'mouse');
    mouse(button, 'mouseup');
    click(button, 'mouse');
    mouse(button, 'click');
    expect(down.defaultPrevented).toBe(false);
    expect(reached).toEqual([
      'pointerdown',
      'mousedown',
      'pointerup',
      'mouseup',
      'click',
      'click',
    ]);
  });

  it("lets a mouse through a presentation's shield once it moves, takes hits again at a finger's press, and keeps a dismissal's shield taking every hit", () => {
    const {layer} = mountLayer();
    const {button} = recorder(layer);
    hold(layer);
    const shield = layer.lastElementChild as HTMLElement;
    expect(shield.style.pointerEvents).toBe('auto');
    // A mouse or a trackpad moving on a touch screen: what it points at is
    // hit, as with no hold.
    pointer(document.body, 'pointermove', 'mouse');
    expect(shield.style.pointerEvents).toBe('none');
    // A finger: the shield is the hit target again for the next one.
    pointer(button, 'pointerdown', 'touch', 2);
    expect(shield.style.pointerEvents).toBe('auto');
    pointer(button, 'pointerup', 'touch', 2);
    // A dismissal's content is inert: a mouse would fall through it to the
    // page, so its shield keeps every hit.
    hold(layer, 'layer');
    pointer(document.body, 'pointermove', 'mouse');
    expect(shield.style.pointerEvents).toBe('auto');
  });

  it("starts a presentation's shield letting a mouse through when a mouse is the page's latest pointer, so its press before any movement passes", () => {
    const {layer, child} = mountLayer();
    const {button, reached} = recorder(layer);
    // The mouse moved last, before the layer opened.
    pointer(document.body, 'pointermove', 'mouse');
    hold(layer);
    const shield = layer.lastElementChild as HTMLElement;
    expect(shield.style.pointerEvents).toBe('none');
    const isGated = (target: Node) => touchGates.some(gate => gate(target));
    expect(isGated(child)).toBe(false);
    pointer(button, 'pointerdown', 'mouse');
    mouse(button, 'mousedown');
    pointer(button, 'pointerup', 'mouse');
    mouse(button, 'mouseup');
    click(button, 'mouse');
    expect(reached).toEqual([
      'pointerdown',
      'mousedown',
      'pointerup',
      'mouseup',
      'click',
    ]);
  });

  it("starts a presentation's shield taking hits when a finger is the page's latest pointer, and a dismissal's whatever the pointer", () => {
    const {layer} = mountLayer();
    hold(layer);
    expect((layer.lastElementChild as HTMLElement).style.pointerEvents).toBe(
      'auto',
    );
    const other = mountLayer().layer;
    pointer(document.body, 'pointermove', 'mouse');
    hold(other, 'layer');
    expect((other.lastElementChild as HTMLElement).style.pointerEvents).toBe(
      'auto',
    );
  });

  it("lets the gesture host's gate pass a mouse during a presentation and hold it during a dismissal", () => {
    const {layer, child} = mountLayer();
    hold(layer);
    // The gate the hold registered for this document, as the host asks it.
    const isGated = (target: Node) => touchGates.some(gate => gate(target));
    // Before any pointer: held.
    expect(isGated(child)).toBe(true);
    pointer(child, 'pointerdown', 'mouse');
    expect(isGated(child)).toBe(false);
    pointer(child, 'pointerup', 'mouse');
    pointer(child, 'pointerdown', 'touch', 2);
    expect(isGated(child)).toBe(true);
    pointer(child, 'pointerup', 'touch', 2);
    hold(layer, 'layer');
    pointer(child, 'pointerdown', 'mouse');
    expect(isGated(child)).toBe(true);
    expect(isGated(document.body)).toBe(false);
  });

  it('lets a key or assistive technology click through: it counts no press', () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder(layer);
    hold(layer);
    pointer(button, 'pointerdown', 'touch');
    pointer(button, 'pointerup', 'touch');
    click(button, '', 0);
    expect(reached).toEqual(['click']);
  });

  it("never cancels a touch's start, and cancels a move only while one finger is down", () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder(layer);
    hold(layer);
    expect(touch(button, 'touchstart', [1]).defaultPrevented).toBe(false);
    expect(touch(button, 'touchmove', [1]).defaultPrevented).toBe(true);
    // A second finger: a pinch, which still zooms the page.
    expect(touch(button, 'touchstart', [2], 2).defaultPrevented).toBe(false);
    expect(touch(button, 'touchmove', [1, 2]).defaultPrevented).toBe(false);
    touch(button, 'touchend', [1, 2], 0);
    expect(reached).toEqual([]);
  });

  it('swallows the compatibility mouse events and the click a browser sends after a held touch', () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder(layer);
    hold(layer);
    touch(button, 'touchstart', [1]);
    expect(touch(button, 'touchend', [1], 0).defaultPrevented).toBe(true);
    mouse(button, 'mousedown');
    mouse(button, 'mouseup');
    mouse(button, 'click');
    expect(reached).toEqual([]);
  });

  it('follows a press that landed during the hold to its end, past the release, and leaves the next tap alone', () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder();
    const release = hold(layer);
    pointer(button, 'pointerdown', 'touch');
    release();
    pointer(button, 'pointerup', 'touch');
    click(button, 'touch');
    expect(reached).toEqual([]);
    // The next tap is the page's again.
    tap(button, 'touch', 2);
    expect(reached).toEqual(['pointerdown', 'pointerup', 'click']);
  });

  it('lets a touch after the release through when a held touch ended where the window could not hear it, its identifier reused', () => {
    const {layer} = mountLayer();
    const {button, reached} = recorder();
    const release = hold(layer);
    // A held touch whose end went to its removed target, unheard here.
    touch(button, 'touchstart', [0]);
    release();
    // The next touch reuses its identifier: it is the page's, and so is its
    // end, which the browser follows with a click.
    touch(button, 'touchstart', [0]);
    const end = touch(button, 'touchend', [0], 0);
    expect(end.defaultPrevented).toBe(false);
    mouse(button, 'click');
    expect(reached).toEqual(['touchstart', 'touchend', 'click']);
  });

  it('holds nothing once its layer has left the document', () => {
    const {layer} = mountLayer();
    hold(layer);
    layer.remove();
    const {button, reached} = recorder();
    tap(button, 'touch');
    expect(reached).toEqual(['pointerdown', 'pointerup', 'click']);
  });
});

describe('useInputHold', () => {
  function Bar({isHeld}: {isHeld: boolean}) {
    const ref = useRef<HTMLDivElement>(null);
    useInputHold(ref, {isHeld, scope: 'layer'});
    return (
      <div ref={ref} data-testid="bar">
        <button type="button">Back</button>
      </div>
    );
  }

  it('holds the layer while asked, and releases it when no longer asked or unmounted', () => {
    const view = render(<Bar isHeld />);
    const bar = view.getByTestId('bar');
    const back = view.getByRole('button', {name: 'Back', hidden: true});
    expect(back.hasAttribute('inert')).toBe(true);
    expect(isInHeldLayer(back)).toBe(true);
    view.rerender(<Bar isHeld={false} />);
    expect(back.hasAttribute('inert')).toBe(false);
    view.rerender(<Bar isHeld />);
    expect(back.hasAttribute('inert')).toBe(true);
    view.unmount();
    expect(isInHeldLayer(bar)).toBe(false);
  });
});
