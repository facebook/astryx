// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file inputHold.ts
 * @input A layer's root element, what ends the hold (a promise, or an
 *   animator handle's `finished`), and its scope; the gesture host's touch
 *   gates
 * @output holdInput, useInputHold, isInHeldLayer and
 *   isInputShield: input held away from a layer while its
 *   presentation runs
 * @position The Layer module's one input hold, for every component
 *   whose layer presents or dismisses under a finger
 *
 * UIKit delivers no touch while a presentation runs: until it completes, a
 * tap reaches nothing, and a dismissal drops every input until it ends
 * (measured on iOS 26.2 with UIAlertController: taps 400 ms into its
 * presentation ignored, 450 ms in handled). A hold covers one layer root
 * until what ends it settles, and decides by each event's pointer, never by
 * the primary pointer (spec:AST-094 FR35): a finger's or a pen's press is
 * held, a mouse's keeps today's behavior during a presentation, so a mouse
 * or a trackpad on a touch screen keeps its clicks:
 *
 * - `scope: 'viewport'` (a presentation): a touch, a pointer press or a
 *   click anywhere reaches nothing. A transparent shield inside the layer
 *   covers the viewport from the top layer, so a tap on it lands inside the
 *   layer (a light-dismissing layer stays open) and starts no pan (iOS
 *   drops that input too while it presents), while a pinch on it still
 *   zooms the page, which stays the browser's (spec:AST-094 FR10, FR18,
 *   FR35; WCAG 1.4.4); the gesture host holds
 *   the layer's touches away from every recognizer. Keys and assistive
 *   technology stay live, as on iOS.
 * - `scope: 'layer'` (a dismissal, an inert bar): the same shield, and the
 *   layer's content is inert (no focus, key or assistive-technology
 *   activation; a focused element inside it is blurred, since one that turns
 *   inert keeps its key activation). The layer element itself stays live, so
 *   the shield inside
 *   it still catches every hit: an inert subtree is no hit target, and a tap
 *   on it would otherwise land on whatever lies beneath. A modal dialog
 *   still receives its own `cancel` (Escape): the caller ignores it while
 *   held.
 *
 * A finger's or a pen's press that lands anywhere while a layer is held is
 * held with its moves, its release, its click and the compatibility mouse
 * events a browser sends for it, to the end of that press, even when the
 * hold ends first: the whole tap reaches nothing. Window listeners, the first
 * stop of every event's capture path, swallow it, so neither the page nor the
 * gesture host hears it; a touch's start is never canceled (that would cancel
 * a pinch too), and a move is canceled, so that it pans nothing, only while
 * one finger is down. A click a key or assistive technology sends (`detail`
 * 0) passes. During a presentation a mouse passes too: once it moves, the
 * shield stops taking hits and the gesture host's gate lets it through, and a
 * finger's press makes the shield take them again (a finger that lands while
 * it does not is captured to it, so its release stays the hold's and a
 * light-dismissing layer stays open). A press that lands before the mouse
 * has moved still meets the shield. A dismissal's shield takes every hit,
 * a mouse's included: its content is inert, and a click would fall through
 * it to the page.
 *
 * The shield sets its own `pointer-events` and `visibility`, so a layer root
 * that takes no hits itself (its content or a backdrop child opts back in)
 * is held all the same. A hit test that must see past held input (a press
 * the finger that opened the layer continues, captured before the hold
 * began) skips shields and nothing else: the first element of
 * `elementsFromPoint` for which `isInputShield` is false, so an
 * overlay really above the layer still wins. The shield is a manual
 * popover, so its `toggle` events reach a document listener that logs
 * every popover's: such a log keeps to its own popovers.
 *
 * One hold per layer: holds on a held layer stack, and the layer comes back
 * when the last one ends (when what ends it settles, resolved or rejected;
 * when its release runs; on unmount, for the hook). Nothing is written to
 * the DOM but the shield and the content's `inert` attribute; the host
 * learns through one touch gate per document that asks whether the target is
 * in a held layer, walking the flat tree as it does (a slotted node to its
 * slot, a shadow root to its host), for that event's pointer. A layer that
 * leaves the document holds nothing more.
 *
 * SYNC: When modified, update inputHold.test.tsx,
 * __tests__/inputHold.interaction.browser.spec.ts and the components
 * that hold their layer (holdInput and useInputHold callers).
 */

import {useEffect, type RefObject} from 'react';
import {getGestureHost} from '../gestures/GestureHost';
import {parentAcrossShadow} from '../gestures/nativeScroll';

/** What a hold covers: the whole viewport, or the layer alone. */
export type InputHoldScope = 'viewport' | 'layer';

/** What ends a hold: a promise, or an animator handle (its `finished`). */
export type InputHoldEnd =
  PromiseLike<unknown> | {readonly finished: PromiseLike<unknown>};

export interface InputHoldOptions {
  /** The hold ends when this settles. */
  until: InputHoldEnd;
  /** `'viewport'` while presenting, `'layer'` while dismissing. */
  scope: InputHoldScope;
}

interface HeldLayer {
  viewport: number;
  layer: number;
  shield: HTMLElement | null;
  /** The content a dismissal made inert, and whether each was already. */
  inertContent: Map<Element, boolean> | null;
  /** Ends the holding of new presses; held ones are followed to their end. */
  releasePresses: (() => void) | null;
}

const held = new WeakMap<Element, HeldLayer>();
const gatedDocuments = new WeakSet<Document>();
const liveShields = new WeakSet<Node>();
/** The pointer of the latest pointer event a hold saw, by document. */
const latestPointer = new WeakMap<Document, string>();

/**
 * Whether `node` is the shield of a live hold. A hit test that must see past
 * held input takes the first element of `elementsFromPoint` that is not one.
 */
export function isInputShield(node: Node | null): boolean {
  return node != null && liveShields.has(node);
}

/**
 * Whether `target` is inside a held layer, walking the flat tree as the
 * gesture host does (parentAcrossShadow: a slotted node to its slot, a
 * shadow root to its host).
 */
export function isInHeldLayer(target: Node | null): boolean {
  for (
    let node: Node | null = target;
    node != null;
    node = parentAcrossShadow(node)
  ) {
    if (node instanceof Element && held.has(node)) {
      return true;
    }
  }
  return false;
}

/**
 * Whether the gesture host holds `target` away for the pointer at hand: in a
 * dismissing layer always, in a presenting one unless that pointer is a
 * mouse (spec:AST-094 FR35: a mouse keeps today's behavior).
 */
function holdsTarget(target: Node): boolean {
  let isHeld = false;
  for (
    let node: Node | null = target;
    node != null;
    node = parentAcrossShadow(node)
  ) {
    const state = node instanceof Element ? held.get(node) : undefined;
    if (state != null) {
      if (state.layer > 0) {
        return true;
      }
      isHeld = true;
    }
  }
  const doc = target instanceof Document ? target : target.ownerDocument;
  return isHeld && (doc == null || latestPointer.get(doc) !== 'mouse');
}

/** One gate per document: the host holds a held layer's touches away. */
function gate(doc: Document): void {
  if (gatedDocuments.has(doc)) {
    return;
  }
  gatedDocuments.add(doc);
  getGestureHost(doc).addTouchGate(holdsTarget);
}

const SWALLOWED = [
  'pointerdown',
  'pointerup',
  'touchstart',
  'touchend',
  'mousedown',
  'mouseup',
  'click',
  'contextmenu',
] as const;

const swallow = (event: Event) => {
  // A touch's start stays uncancelled: cancelling it would cancel the page's
  // pinch-zoom too. The shield's `touch-action: pinch-zoom` keeps a finger
  // from panning, and a tap's mouse events and click land on the shield,
  // which swallows them.
  if (event.cancelable && event.type !== 'touchstart') {
    event.preventDefault();
  }
  event.stopPropagation();
};

/** A transparent top-layer cover of the viewport, inside `layer`. */
function addShield(layer: Element): HTMLElement {
  const shield = layer.ownerDocument.createElement('div');
  shield.setAttribute('popover', 'manual');
  shield.setAttribute('aria-hidden', 'true');
  Object.assign(shield.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: '0',
    padding: '0',
    border: '0',
    background: 'transparent',
    overflow: 'hidden',
    touchAction: 'pinch-zoom',
    // The two inherited properties that decide hit-testing, set here so the
    // shield takes hits whatever its layer root opts out of (a full-viewport
    // layer that is `pointer-events: none` and lets a backdrop child take the
    // hits): inherited, they would let a held tap fall through to the page.
    pointerEvents: 'auto',
    visibility: 'visible',
  });
  for (const type of SWALLOWED) {
    shield.addEventListener(type, swallow, {capture: true, passive: false});
  }
  layer.append(shield);
  liveShields.add(shield);
  if (typeof shield.showPopover === 'function') {
    try {
      shield.showPopover();
    } catch {
      // Not connected, or popovers unsupported: the shield still covers
      // what it can as a fixed element.
    }
  }
  return shield;
}

/**
 * Holds input away from `layer` until `until` settles. Returns the release
 * (idempotent), for a hold that ends early.
 */
export function holdInput(
  layer: Element,
  {until, scope}: InputHoldOptions,
): () => void {
  gate(layer.ownerDocument);
  let state = held.get(layer);
  if (state == null) {
    state = {
      viewport: 0,
      layer: 0,
      shield: null,
      inertContent: null,
      releasePresses: null,
    };
    held.set(layer, state);
  }
  if (state.shield == null) {
    state.shield = addShield(layer);
  }
  state.releasePresses ??= holdPresses(layer);
  if (scope === 'viewport') {
    state.viewport += 1;
  } else {
    state.layer += 1;
    // A dismissal's shield takes every hit, a mouse's included.
    state.shield.style.pointerEvents = 'auto';
    if (state.layer === 1) {
      state.inertContent = makeContentInert(layer, state.shield);
    }
  }
  let isReleased = false;
  const release = () => {
    if (isReleased) {
      return;
    }
    isReleased = true;
    const current = held.get(layer);
    if (current == null) {
      return;
    }
    if (scope === 'viewport') {
      current.viewport -= 1;
    } else {
      current.layer -= 1;
      if (current.layer === 0 && current.inertContent != null) {
        restoreInert(current.inertContent);
        current.inertContent = null;
      }
    }
    if (current.viewport === 0 && current.layer === 0) {
      if (current.shield != null) {
        liveShields.delete(current.shield);
        current.shield.remove();
      }
      current.releasePresses?.();
      held.delete(layer);
    }
  };
  const end = 'finished' in until ? until.finished : until;
  void Promise.resolve(end).then(release, release);
  return release;
}

/** The pointers whose presses are held: a finger's and a pen's. */
const HELD_POINTERS: ReadonlySet<string> = new Set(['touch', 'pen']);

/**
 * How long after a held press ends its click and compatibility mouse events
 * still count as its own (WebKit sends them after `touchend`).
 */
const CLICK_WINDOW_MS = 800;

/** How long a held press is followed past the hold's end, at most. */
const STRAY_PRESS_MS = 10_000;

const POINTER_EVENTS = [
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
] as const;
const TOUCH_EVENTS = [
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
] as const;
const PRESS_EVENTS = [
  'mousedown',
  'mouseup',
  'click',
  'auxclick',
  'dblclick',
  'contextmenu',
] as const;

const WINDOW_LISTENER = {capture: true, passive: false} as const;

/**
 * Holds every press of a finger or a pen that lands in `layer`'s window
 * while `layer` is held, each to its own end, and lets a moving mouse
 * through a presentation's shield. Returns the release: no new press is held
 * after it, and the listeners go once the held presses and their clicks have
 * ended.
 */
function holdPresses(layer: Element): (() => void) | null {
  const doc = layer.ownerDocument;
  const view = doc.defaultView;
  if (view == null) {
    return null;
  }
  latestPointer.delete(doc);
  /** Whether a new press is held: until the release. */
  let isHolding = true;
  let isListening = true;
  /** The held presses still down, by pointer id and by touch identifier. */
  const pointers = new Set<number>();
  const touches = new Set<number>();
  /** Whose press the next click is: a held one's, or any other's. */
  let lastPress: 'held' | 'free' | null = null;
  /** Until when a click with no pointer type is a held press's. */
  let clickUntil = -Infinity;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const now = () => view.performance.now();
  const isPressDown = () => pointers.size > 0 || touches.size > 0;

  const swallow = (event: Event) => {
    if (event.cancelable) {
      event.preventDefault();
    }
    event.stopImmediatePropagation();
  };

  /** After the release: stops once the last held press and its click end. */
  const settle = () => {
    if (isHolding || !isListening) {
      return;
    }
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    if (isPressDown()) {
      timer = setTimeout(stop, STRAY_PRESS_MS);
      return;
    }
    const wait = clickUntil - now();
    if (wait > 0) {
      timer = setTimeout(stop, wait);
    } else {
      stop();
    }
  };

  /** A layer that has left the document holds nothing more. */
  const holdsNewPress = () => {
    if (isHolding && !layer.isConnected) {
      isHolding = false;
      settle();
    }
    return isHolding;
  };

  const pressEnded = () => {
    clickUntil = now() + CLICK_WINDOW_MS;
    settle();
  };

  /** The shield takes hits for a finger or a pen, not for a moving mouse. */
  const followPointer = (pointerType: string) => {
    const state = held.get(layer);
    if (state?.shield == null) {
      return;
    }
    const value =
      pointerType === 'mouse' && state.layer === 0 ? 'none' : 'auto';
    if (state.shield.style.pointerEvents !== value) {
      state.shield.style.pointerEvents = value;
    }
  };

  /**
   * A held press that landed past the shield (it let a mouse through) is
   * captured to it, so its release stays the hold's: a light-dismissing
   * layer stays open.
   */
  const captureToShield = (event: PointerEvent) => {
    const shield = held.get(layer)?.shield;
    if (shield == null || event.target === shield) {
      return;
    }
    try {
      shield.setPointerCapture(event.pointerId);
    } catch {
      // Not capturable: its events are swallowed all the same.
    }
  };

  const onPointer = (event: Event) => {
    const {pointerId, pointerType, type} = event as PointerEvent;
    if (pointerType === 'mouse' || HELD_POINTERS.has(pointerType)) {
      latestPointer.set(doc, pointerType);
      if (isHolding && (type === 'pointermove' || type === 'pointerdown')) {
        followPointer(pointerType);
      }
    }
    if (type === 'pointerdown') {
      if (!holdsNewPress() || !HELD_POINTERS.has(pointerType)) {
        // A mouse's press, or one after the hold: its click is its own, and a
        // held press with its id ended unheard.
        pointers.delete(pointerId);
        lastPress = 'free';
        clickUntil = -Infinity;
        settle();
        return;
      }
      pointers.add(pointerId);
      lastPress = 'held';
      captureToShield(event as PointerEvent);
    } else if (!pointers.has(pointerId)) {
      return;
    }
    // Canceling the press keeps the browser from sending its compatibility
    // mouse events, and with them a focus move.
    swallow(event);
    if (type === 'pointerup' || type === 'pointercancel') {
      pointers.delete(pointerId);
      pressEnded();
    }
  };

  const onTouch = (event: Event) => {
    const {changedTouches, touches: down, type} = event as Partial<TouchEvent>;
    const changed = Array.from(changedTouches ?? []);
    if (type === 'touchstart') {
      // A held touch the screen no longer has ended unheard: its target left
      // the document (the shield, removed at the release), so its end
      // reached no listener here.
      const live = new Set(Array.from(down ?? [], touch => touch.identifier));
      for (const identifier of touches) {
        if (!live.has(identifier)) {
          touches.delete(identifier);
        }
      }
      if (!holdsNewPress()) {
        // A touch after the hold is a new one, whatever its identifier.
        for (const touch of changed) {
          touches.delete(touch.identifier);
        }
        lastPress = 'free';
        clickUntil = -Infinity;
        settle();
        return;
      }
      for (const touch of changed) {
        touches.add(touch.identifier);
      }
      lastPress = 'held';
      // Never canceled: canceling a touch's start would cancel the page's
      // pinch-zoom with it.
      event.stopImmediatePropagation();
      return;
    }
    if (!changed.some(touch => touches.has(touch.identifier))) {
      return;
    }
    if (type === 'touchmove') {
      event.stopImmediatePropagation();
      // One finger pans nothing; two still zoom the page.
      if (down?.length === 1 && event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    // A canceled end sends no click and no compatibility mouse events.
    swallow(event);
    for (const touch of changed) {
      touches.delete(touch.identifier);
    }
    pressEnded();
  };

  const onPress = (event: Event) => {
    // A click a key or assistive technology sends counts no press.
    if ((event as MouseEvent).detail === 0) {
      return;
    }
    // A click that names its pointer is judged by it; a compatibility mouse
    // event, or a click a browser sends as a plain mouse event, belongs to
    // the last press.
    const {pointerType} = event as Partial<PointerEvent>;
    const isHeldPress =
      lastPress === 'held' &&
      (pointerType == null ||
        pointerType === '' ||
        HELD_POINTERS.has(pointerType));
    if (isHeldPress && (isPressDown() || now() <= clickUntil)) {
      swallow(event);
    }
  };

  function stop(): void {
    if (!isListening) {
      return;
    }
    isListening = false;
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    for (const type of POINTER_EVENTS) {
      view?.removeEventListener(type, onPointer, WINDOW_LISTENER);
    }
    for (const type of TOUCH_EVENTS) {
      view?.removeEventListener(type, onTouch, WINDOW_LISTENER);
    }
    for (const type of PRESS_EVENTS) {
      view?.removeEventListener(type, onPress, WINDOW_LISTENER);
    }
  }

  for (const type of POINTER_EVENTS) {
    view.addEventListener(type, onPointer, WINDOW_LISTENER);
  }
  for (const type of TOUCH_EVENTS) {
    view.addEventListener(type, onTouch, WINDOW_LISTENER);
  }
  for (const type of PRESS_EVENTS) {
    view.addEventListener(type, onPress, WINDOW_LISTENER);
  }

  return () => {
    if (!isHolding) {
      return;
    }
    isHolding = false;
    settle();
  };
}

/**
 * Makes the layer's content inert, the shield aside, and moves focus out of
 * it: an element that turns inert while focused keeps its focus, and with it
 * its key activation (Enter and Space still click a focused button), until
 * the engine's focus fixup runs, if it runs at all (measured in Chromium and
 * WebKit). Blurring it leaves focus on the document, as that fixup does.
 */
function makeContentInert(
  layer: Element,
  shield: Element,
): Map<Element, boolean> {
  const content = new Map<Element, boolean>();
  for (const child of layer.children) {
    if (child !== shield) {
      content.set(child, child.hasAttribute('inert'));
      child.setAttribute('inert', '');
    }
  }
  const focused = deepActiveElement(layer.ownerDocument);
  if (
    focused instanceof HTMLElement &&
    [...content.keys()].some(child => isInFlatTree(child, focused))
  ) {
    focused.blur();
  }
  return content;
}

/** The focused element, inside any shadow roots on the way down. */
function deepActiveElement(doc: Document): Element | null {
  let active = doc.activeElement;
  while (active?.shadowRoot?.activeElement != null) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** Whether `node` is `root` or inside it, walking the flat tree. */
function isInFlatTree(root: Node, node: Node): boolean {
  for (
    let current: Node | null = node;
    current != null;
    current = parentAcrossShadow(current)
  ) {
    if (current === root) {
      return true;
    }
  }
  return false;
}

function restoreInert(content: Map<Element, boolean>): void {
  for (const [element, wasInert] of content) {
    if (!wasInert) {
      element.removeAttribute('inert');
    }
  }
}

/**
 * Holds input away from the layer behind `ref` while `isHeld` is true (an
 * inert bar, a presentation driven by state); released when `isHeld` turns
 * false or the component unmounts.
 */
export function useInputHold(
  ref: RefObject<Element | null>,
  {isHeld, scope}: {isHeld: boolean; scope: InputHoldScope},
): void {
  useEffect(() => {
    const layer = ref.current;
    if (!isHeld || layer == null) {
      return;
    }
    // Released by the cleanup alone.
    return holdInput(layer, {
      until: new Promise<never>(() => {}),
      scope,
    });
  }, [ref, isHeld, scope]);
}
