// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMenuPress.ts
 * @input The menu root, its trigger, the enabled-row selector, and callbacks
 *   for opening, highlighting, activating and dismissing
 * @output Exports useMenuPress, the marker attribute, and the module-level
 *   activation mark
 * @position Core hook; mounted by DropdownMenu, ContextMenu,
 *   DropdownMenuSubMenu, Selector and MenuBottomSheetActionList. The pure
 *   transition table lives in menuPressGesture.ts.
 *
 * One press in a menu, from the trigger or from inside, owned end to end:
 *
 * - The pointer is tracked at DOCUMENT level by `pointerId`. A finger's
 *   pointer events stay with the element it landed on (implicit capture), so a
 *   menu container never sees a finger that slid onto it — the document does.
 * - The highlight follows the pointer (DOM focus with `preventScroll` in a
 *   menu, its indicator following the last input; a callback for a picker
 *   that highlights by index).
 * - The row under the RELEASE acts, the way its own click would, carrying the
 *   release's button and modifier keys.
 * - The browser's stray `click` for a tracked gesture is swallowed at the
 *   window in the capture phase, ahead of React's own listener. It arms at a
 *   tracked release and disarms at the next pointer press or after a short
 *   window; a click with `detail === 0` (a keyboard's or a screen reader's)
 *   always passes.
 * - A mouse press on the trigger opens the menu at once. A finger held for
 *   `longPressDelayMs` opens it and the opening press follows the settle
 *   rule (see menuPressGesture.ts). DropdownMenu's own entry
 *   (`useDropdownMenuPress`, touch model `'uikit'`, `spec:AST-094` FR29)
 *   instead opens it as a finger presses on a trigger in a fixed bar, and
 *   inside a scroll view once the 150 ms content-touch delay has passed with
 *   no scroll; the opening finger then travels UIMenu's handoff distance
 *   before it picks.
 * - A gesture that began elsewhere (a context menu's long press) continues
 *   into the menu through the same internal entry's `continueGesture`, as
 *   the opening press under the same handoff.
 * - `pointercancel`, a second pointer, or the window losing focus end the
 *   gesture with nothing acting; the model never re-implements scrolling.
 * - While a press is tracked in an overflowing menu, a pointer resting near
 *   the top or bottom edge scrolls the menu toward that edge (the shared
 *   timer of utils/edgeAutoscroll.ts).
 * - Under the internal touch model `'uikit'` a finger that lands in the menu
 *   is tracked as UIMenu's list tracks it instead (menuSelectionRecognizer.ts on the
 *   gesture system, driving the shared action-group tracker): its row lights
 *   after UIKit's content-touch delay, a tap acts at the lift, and in a menu
 *   that scrolls a travelling finger scrolls it, on every touch device. A
 *   mouse keeps the pointer model.
 *
 * The menu root is marked `data-astryx-menu-press` so a nested flyout (a DOM
 * descendant of its parent menu) can tell which level owns a press, and so a
 * surface can be recognised as carrying this model. A menu the root renders
 * beside itself names the root with `data-astryx-menu-press-surface` and counts
 * as nested in it.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 * - /packages/core/src/hooks/useMenuPress.doc.mjs
 * - /packages/core/src/hooks/useMenuPress.test.tsx
 * - /packages/core/src/hooks/menuPressGesture.ts
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import {currentGesture} from '../Layer/gestureCounter';
import {
  IDLE_MENU_PRESS,
  menuPressTransition,
  type MenuPressOutcome,
  type MenuPressInput,
  type MenuPressState,
  type MenuPressPointerType,
} from './menuPressGesture';
import {useMenuTriggerPress, type MenuTriggerContext} from './menuTriggerPress';
import {TOUCH_QUERY} from '../utils/touchPresentation';
import {useMediaQuery} from './useMediaQuery';
import type {UseLongPressHandlers} from './useLongPress';
import {getGestureHost} from '../gestures/GestureHost';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';
import {
  createActionGroupTracker,
  type ActionGroupTracker,
} from './actionGroupTracker';
import {MenuSelectionGestureRecognizer} from './menuSelectionRecognizer';
import {edgeAutoscroll} from '../utils/edgeAutoscroll';
import {focusForLastInput} from '../utils/focusReturn';
import {useInteractionModalityTracking} from '../utils/interactionModality';

/** Marks a menu root that carries this press model. */
export const MENU_PRESS_MARKER = 'data-astryx-menu-press';
const MENU_PRESS_ROOT_SELECTOR = `[${MENU_PRESS_MARKER}]`;
/**
 * Carried by a menu root that another root renders beside itself rather than
 * inside it, naming that root's `id`: the menu of a sub-menu with a header or
 * footer, in a dialog beside the root's menu, is nested in that root for the
 * press model, as a flyout inside the root's DOM is. Nothing else beside the
 * root carries it, so a picker placed in a header or footer stays its own root.
 */
export const MENU_PRESS_SURFACE_ATTR = 'data-astryx-menu-press-surface';

/** How long after a tracked release the browser's click is still swallowed. */
export const MENU_PRESS_STRAY_CLICK_MS = 400;
export {MENU_PRESS_LONG_PRESS_MS} from './menuTriggerPress';
/** Distance from a scrolling menu's edge within which a resting pointer scrolls. */
export const MENU_PRESS_AUTOSCROLL_ZONE_PX = 24;
const AUTOSCROLL_STEP_PX = 6;
const AUTOSCROLL_INTERVAL_MS = 16;

const FOCUSABLE_ROW_SELECTOR =
  '[tabindex], a[href], button, input, select, textarea, [contenteditable]';
const INNER_CONTROL_SELECTOR = 'a[href], button, [tabindex]';

// =============================================================================
// Module state: the activation mark and the stray-click swallower
// =============================================================================

let isModelActivation = false;

/**
 * Whether a menu row activation dispatched by the press model is in flight.
 * True for the synchronous extent of that dispatch, so a row that forwards
 * the activation to a control inside it (a link) can tell the model's click
 * from the browser's stray one.
 */
export function isMenuPressActivation(): boolean {
  return isModelActivation;
}

interface StrayClickSwallower {
  doc: Document;
  isArmed: boolean;
  timer: ReturnType<typeof setTimeout> | null;
}

let swallower: StrayClickSwallower | null = null;

function disarmStrayClick(): void {
  if (swallower == null) {
    return;
  }
  swallower.isArmed = false;
  if (swallower.timer != null) {
    clearTimeout(swallower.timer);
    swallower.timer = null;
  }
}

function onWindowClickCapture(event: MouseEvent): void {
  if (swallower == null || !swallower.isArmed) {
    return;
  }
  // A keyboard's or a screen reader's activation reports detail 0, as does the
  // model's own dispatch. Those are never the browser's stray click.
  if (event.detail === 0 || isModelActivation) {
    return;
  }
  event.preventDefault();
  event.stopImmediatePropagation();
  disarmStrayClick();
}

function armStrayClick(doc: Document): void {
  const view = doc.defaultView;
  if (view == null) {
    return;
  }
  if (swallower == null || swallower.doc !== doc) {
    if (swallower != null) {
      swallower.doc.defaultView?.removeEventListener(
        'click',
        onWindowClickCapture,
        true,
      );
      swallower.doc.removeEventListener('pointerdown', disarmStrayClick, true);
    }
    // The window, capture phase: ahead of React's root listener and of any
    // document listener, so no framework sees the click.
    view.addEventListener('click', onWindowClickCapture, true);
    // The next press is a new gesture; its click must never be eaten.
    doc.addEventListener('pointerdown', disarmStrayClick, true);
    swallower = {doc, isArmed: false, timer: null};
  }
  disarmStrayClick();
  swallower.isArmed = true;
  swallower.timer = setTimeout(disarmStrayClick, MENU_PRESS_STRAY_CLICK_MS);
}

/** Test-only: forget an armed swallower between cases. */
export function __resetMenuPressForTest(): void {
  disarmStrayClick();
}

// =============================================================================
// Options
// =============================================================================

export interface UseMenuPressOptions {
  /** The menu (or listbox) root: the surface whose rows the press picks from. */
  menuRef: RefObject<HTMLElement | null>;
  /** The control that opens the menu, when the press may start there. */
  triggerRef?: RefObject<HTMLElement | null>;
  /**
   * Selector matching the ENABLED rows. A pointer over anything else inside
   * the menu — a divider, a heading, a disabled row — highlights nothing.
   */
  itemSelector: string;
  /**
   * A mouse pressed the trigger, or a finger has rested on it for the
   * long-press delay: open the menu under the held pointer. Return whether it opened; a `false` (the
   * press closed an open menu instead) ends the gesture. The click the
   * trigger receives for this same gesture is reported by
   * {@link UseMenuPressReturn.isTriggerClickFromPress} so the caller can
   * leave it alone.
   */
  onTriggerPress?: (pointerType: MenuPressPointerType) => boolean;
  /**
   * Move the highlight. `null` clears it. Defaults to moving DOM focus with
   * `preventScroll` onto the row (or the control inside it), and onto the
   * menu root when there is no row — a picker that highlights through
   * `aria-activedescendant` supplies its own.
   */
  onHighlight?: (row: HTMLElement | null) => void;
  /**
   * Act on the row under the release. Defaults to dispatching a click on the
   * row that carries the release's button and modifier keys, so the row acts
   * exactly as its own click would.
   */
  onActivate?: (row: HTMLElement, release: PointerEvent) => void;
  /** Close the menu: a MOUSE was released outside it with nothing acting. */
  onDismiss?: () => void;
  /**
   * The element to scroll while a tracked pointer rests near its edge.
   * Defaults to the menu root when it overflows; return `null` for none.
   */
  getScroller?: () => HTMLElement | null;
  /**
   * Resolve the element under a viewport point. Defaults to
   * `elementFromPoint` on the menu's own document or shadow root, falling back
   * to the event target where the document lacks it (jsdom). A test seam.
   */
  hitTest?: (x: number, y: number) => Element | null;
  /**
   * How long a finger rests on the trigger before the menu opens under it.
   * Unset, the wait follows `spec:AST-094` FR29 where the primary pointer is
   * coarse (none in a fixed bar, 150 ms in a scroll view, the opening finger
   * picking after UIMenu's handoff) and is 500 ms where it is fine. Set, it
   * is that wait everywhere, as released (`spec:AST-094` FR25).
   */
  longPressDelayMs?: number;
  /** Whether the model is live. @default true */
  isEnabled?: boolean;
}

/**
 * DropdownMenu's options for the press model: everything the public hook
 * takes, plus its touch model. The touch mode stays internal
 * (`architecture:public-component-api` INV16 reaches it through
 * DropdownMenu's `presentation`), so it is not an option of the public hook.
 *
 * @internal
 */
export interface DropdownMenuPressOptions extends UseMenuPressOptions {
  /**
   * How a finger on the trigger opens the menu and picks from it.
   * `'pointer'`: after `longPressDelayMs`, and the opening press follows the
   * settle rule. `'uikit'` (`spec:AST-094` FR29): as the finger presses on a
   * trigger in a fixed bar, and inside a scroll view once the content-touch
   * delay has passed with no scroll; the opening finger picks only after
   * UIMenu's handoff distance. `'uikit'` also tracks a finger that lands in
   * the open menu as UIMenu's list tracks it (menuSelectionRecognizer.ts;
   * `spec:AST-094` FR26 to FR30): its row lights after the content-touch
   * delay, a tap acts at the lift, and in a menu that scrolls a travelling
   * finger scrolls it. A menu with no trigger (a sub-menu) takes its root's,
   * so a finger in it follows the root's rules: a cancelled touch clears its
   * lit row (`spec:AST-094` FR28). A mouse is unaffected.
   * @default 'pointer'
   */
  touchModel?: 'pointer' | 'uikit';
  /**
   * Whether the menu shows. Under the touch model `'uikit'` the finger
   * tracking joins the gesture system only while it does, so a closed menu
   * adds no listener anywhere. Without it, a menu in a popover follows the
   * popover's own toggle.
   */
  isOpen?: boolean;
}

export interface UseMenuPressReturn {
  /** Spread onto the menu root: claims presses that begin inside it. */
  menuProps: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    [MENU_PRESS_MARKER]: '';
  };
  /** Spread onto the trigger: a mouse press opens; a held finger opens. */
  triggerProps: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onContextMenu: (event: React.MouseEvent<HTMLElement>) => void;
  };
  /**
   * Whether the click reaching the trigger belongs to the gesture that just
   * pressed it — the press already opened or closed the menu, so the click
   * must neither toggle nor reopen it.
   */
  isTriggerClickFromPress: () => boolean;
  /** End the gesture in flight with nothing acting (the menu closed). */
  cancel: () => void;
}

/**
 * An in-flight pointer handed to
 * {@link DropdownMenuPressReturn.continueGesture}.
 *
 * @internal
 */
export interface MenuPressContinuation {
  pointerId: number;
  pointerType: MenuPressPointerType;
  /** `Date.now()` of the moment the menu opened under it. */
  time: number;
}

/**
 * What core's own menus get from {@link useDropdownMenuPress}: the public
 * return, and the continuation of a pointer that went down elsewhere. Not
 * exported from the hooks entry point.
 *
 * @internal
 */
export interface DropdownMenuPressReturn extends UseMenuPressReturn {
  /**
   * Continue a pointer that went down elsewhere (a context menu's long press,
   * a trigger this hook does not own) into the menu that just opened under
   * it. The pointer is tracked from here as the opening press
   * (`module:DropdownMenu/useMenuPress` FR11). With the `'uikit'` touch model
   * (the primary pointer is coarse) a finger picks only after UIMenu's handoff
   * distance from the first position the menu sees after it opened, as a
   * trigger's opening finger does, and its lift before that acts on nothing and
   * leaves the menu open; otherwise, and for a mouse, the opening press follows
   * the settle rule. Ignored while another gesture is live or the hook is
   * disabled.
   */
  continueGesture: (pointer: MenuPressContinuation) => void;
}

// =============================================================================
// Helpers
// =============================================================================

function normalizePointerType(type: string): MenuPressPointerType | null {
  return type === 'mouse' || type === 'touch' || type === 'pen' ? type : null;
}

/**
 * Where a pointer is, for a finger's handoff distance: given with
 * `touchModel: 'uikit'`, the primary pointer being coarse, for the trigger's
 * opening finger and a continued one alike (`spec:AST-094` FR29, FR33). Without
 * it the machine keeps the settle rule.
 */
function handoffPosition(
  event: PointerEvent,
  hasHandoff: boolean,
): {x?: number; y?: number} {
  return hasHandoff ? {x: event.clientX, y: event.clientY} : {};
}

function isRowFocusable(row: HTMLElement): boolean {
  return row.matches(FOCUSABLE_ROW_SELECTOR);
}

/** The outermost marked root: a flyout is a DOM descendant of its parent menu. */
function getOutermostRoot(menu: HTMLElement): HTMLElement {
  let root = menu;
  for (;;) {
    const parent =
      root.parentElement?.closest<HTMLElement>(MENU_PRESS_ROOT_SELECTOR) ??
      getSurfaceOwner(root);
    if (parent == null || parent === root) {
      return root;
    }
    root = parent;
  }
}

/**
 * The menu root that renders `menu` beside itself, if any (see
 * `MENU_PRESS_SURFACE_ATTR`). Read off the menu itself, never an ancestor, so
 * a root placed in a region of that surface is not adopted.
 */
function getSurfaceOwner(menu: HTMLElement): HTMLElement | null {
  const ownerId = menu.getAttribute(MENU_PRESS_SURFACE_ATTR);
  if (!ownerId) {
    return null;
  }
  const owner = menu.ownerDocument.getElementById(ownerId);
  return owner?.matches(MENU_PRESS_ROOT_SELECTOR) === true ? owner : null;
}

/**
 * Whether `element` is inside the menu tree whose outermost root is `root`:
 * inside the root itself, or inside a menu nested in it through a surface
 * the root renders beside itself. Anything else in such a surface (a header
 * field, say) is outside the menu, as the root's own regions are.
 */
function isInMenuTree(element: Element, root: HTMLElement): boolean {
  if (root.contains(element)) {
    return true;
  }
  const owner = element.closest<HTMLElement>(MENU_PRESS_ROOT_SELECTOR);
  return owner != null && getOutermostRoot(owner) === root;
}

/**
 * The release a finger's recognized press hands the activation: a primary
 * button at the lift's position, with no modifiers.
 */
function syntheticRelease(
  row: HTMLElement,
  {x, y}: {x: number; y: number},
): PointerEvent {
  const view = row.ownerDocument.defaultView;
  const init = {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x,
    clientY: y,
    screenX: x,
    screenY: y,
  };
  const PointerEventCtor = view?.PointerEvent;
  return (
    typeof PointerEventCtor === 'function'
      ? new PointerEventCtor('pointerup', {...init, pointerType: 'touch'})
      : new MouseEvent('pointerup', init)
  ) as PointerEvent;
}

interface ResolvedPoint {
  row: HTMLElement | null;
  isInMenu: boolean;
  isOnTrigger: boolean;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Whether the menu root is rendered: false inside a closed popover. An
 * environment without `checkVisibility` counts it as showing.
 */
/**
 * Follows a popover's `beforetoggle` (whether it is about to show); returns
 * the function that stops following it.
 */
function watchToggle(
  layer: Element,
  onToggle: (isOpen: boolean) => void,
): () => void {
  const onBeforeToggle = (event: Event) => {
    onToggle((event as ToggleEvent).newState === 'open');
  };
  layer.addEventListener('beforetoggle', onBeforeToggle);
  return () => layer.removeEventListener('beforetoggle', onBeforeToggle);
}

function isShowing(element: Element): boolean {
  return typeof element.checkVisibility === 'function'
    ? element.checkVisibility()
    : true;
}

/**
 * The press model for a menu: the row under the release acts, the highlight
 * follows a held pointer, a mouse opens on press. See the file header.
 *
 * @example
 * ```
 * const menuPress = useMenuPress({
 *   menuRef: listRef,
 *   triggerRef: buttonRef,
 *   itemSelector: MENU_ITEM_SELECTOR,
 *   onTriggerPress: () => openMenu(),
 *   onDismiss: closeMenu,
 * });
 * <button {...menuPress.triggerProps} onClick={e => {
 *   if (menuPress.isTriggerClickFromPress()) return;
 *   toggle();
 * }} />
 * <div ref={listRef} role="menu" {...menuPress.menuProps}>…</div>
 * ```
 */
export function useMenuPress(options: UseMenuPressOptions): UseMenuPressReturn {
  // The touch model is DropdownMenu's alone; an untyped caller's
  // `touchModel` does not reach the model.
  const {touchModel: _touchModel, ...publicOptions} =
    options as DropdownMenuPressOptions;
  // An unset delay follows FR29 where the primary pointer is coarse
  // (spec:AST-094 FR25); a set one, or a fine primary pointer, keeps the
  // released wait.
  const isCoarsePrimary = useMediaQuery(TOUCH_QUERY, false);
  const press = useDropdownMenuPress({
    ...publicOptions,
    touchModel:
      publicOptions.longPressDelayMs === undefined && isCoarsePrimary
        ? 'uikit'
        : 'pointer',
  });
  // Neither is the continuation: the public return is the public contract.
  return useMemo(() => {
    const {continueGesture: _continueGesture, ...publicPress} = press;
    return publicPress;
  }, [press]);
}

/**
 * The press model with DropdownMenu's touch model
 * ({@link DropdownMenuPressOptions.touchModel}). Not exported from the hooks
 * entry point.
 *
 * @internal
 */
export function useDropdownMenuPress(
  options: DropdownMenuPressOptions,
): DropdownMenuPressReturn {
  const {surface, triggerContext} = useMenuPressModel(options);
  const trigger = useMenuTriggerPress(triggerContext, options);
  return useMemo(
    () => ({...surface, triggerProps: trigger}),
    [surface, trigger],
  );
}

/**
 * What a menu that never presses a trigger gets from
 * {@link useMenuSurfacePress}: everything but the trigger half. Not exported
 * from the hooks entry point.
 *
 * @internal
 */
export type MenuSurfacePressReturn = Omit<
  DropdownMenuPressReturn,
  'triggerProps'
>;

/**
 * The press model for a menu that never presses a trigger (a sub-menu, a
 * context menu, a Selector's list, a sheet's action list): the menu half
 * alone, so the trigger half's long-press detectors and scroll probe stay
 * out of its bundle (menuTriggerPress.ts). A sub-menu passes its root
 * menu's touch model. Not exported from the hooks entry point.
 *
 * @internal
 */
export function useMenuSurfacePress(
  options: DropdownMenuPressOptions,
): MenuSurfacePressReturn {
  return useMenuPressModel(options).surface;
}

/**
 * The shared model: the menu half, and the stable context the trigger half
 * (menuTriggerPress.ts) drives it through.
 */
function useMenuPressModel(options: DropdownMenuPressOptions): {
  surface: MenuSurfacePressReturn;
  triggerContext: MenuTriggerContext;
} {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  // The highlight, and the hover focus of the rows in this menu, follow the
  // last input, which this tracks for the document.
  useInteractionModalityTracking();

  const gestureRef = useRef<MenuPressState<HTMLElement>>(IDLE_MENU_PRESS);
  const pointerIdRef = useRef<number | null>(null);
  const detachRef = useRef<(() => void) | null>(null);
  // The held finger is detected by `useLongPress`, the same hook ContextMenu
  // uses, so the hold duration and the movement tolerance have one home. The
  // handle is held in a ref because the pointer handlers below are stable
  // callbacks and the hook is created further down, once `fireLongPress`
  // exists.
  const longPressApiRef = useRef<UseLongPressHandlers | null>(null);
  // Which detector the live press uses: inside a scrolling region or not.
  const holdKindRef = useRef<'plain' | 'scroller'>('plain');
  const touchMovePreventerRef = useRef<(() => void) | null>(null);
  // The edge autoscroll running now: its scroller, its direction, and the
  // re-read of the row under the resting pointer after each step.
  const autoscrollRef = useRef<{
    scroller: HTMLElement;
    direction: 1 | -1;
    reread: () => void;
  } | null>(null);
  const [autoscroll] = useState(() =>
    edgeAutoscroll({
      intervalMs: AUTOSCROLL_INTERVAL_MS,
      immediate: true,
      step: () => (autoscrollRef.current?.direction ?? 0) * AUTOSCROLL_STEP_PX,
      apply: delta => {
        const running = autoscrollRef.current;
        if (running == null) {
          return 0;
        }
        const before = running.scroller.scrollTop;
        running.scroller.scrollTop = before + delta;
        const moved = running.scroller.scrollTop - before;
        if (moved === 0) {
          // The edge is reached; nothing more to reveal.
          autoscrollRef.current = null;
          return 0;
        }
        running.reread();
        return moved;
      },
    }),
  );
  const lastPointerEventRef = useRef<PointerEvent | null>(null);
  const triggerGestureRef = useRef<number | null>(null);
  // The second pointer that ended a gesture must not start the next one.
  const ignoredPointerIdRef = useRef<number | null>(null);

  const getDocument = useCallback((): Document => {
    return (
      optionsRef.current.menuRef.current?.ownerDocument ??
      optionsRef.current.triggerRef?.current?.ownerDocument ??
      document
    );
  }, []);

  const resolvePoint = useCallback(
    (event: PointerEvent): ResolvedPoint => {
      const {menuRef, triggerRef, itemSelector, hitTest} = optionsRef.current;
      const menu = menuRef.current;
      const doc = getDocument();
      let element: Element | null;
      if (hitTest != null) {
        element = hitTest(event.clientX, event.clientY);
      } else if (typeof doc.elementFromPoint === 'function') {
        // Hit-test in the menu's own tree: inside a shadow root the document
        // answers with the shadow host, never the row under the pointer.
        const tree = menu?.getRootNode();
        const scope: Pick<Document, 'elementFromPoint'> =
          tree != null &&
          tree !== doc &&
          typeof (tree as ShadowRoot).elementFromPoint === 'function'
            ? (tree as ShadowRoot)
            : doc;
        element = scope.elementFromPoint(event.clientX, event.clientY);
      } else {
        element = event.target instanceof Element ? event.target : null;
      }
      const root = menu == null ? null : getOutermostRoot(menu);
      const isInMenu =
        root != null && element != null && isInMenuTree(element, root);
      const trigger = triggerRef?.current ?? null;
      const isOnTrigger =
        trigger != null && element != null && trigger.contains(element);
      let row: HTMLElement | null = null;
      if (isInMenu && element != null) {
        row = element.closest<HTMLElement>(itemSelector);
        if (row != null && !isInMenuTree(row, root)) {
          row = null;
        }
      }
      return {row, isInMenu, isOnTrigger};
    },
    [getDocument],
  );

  const stopAutoscroll = useCallback(() => {
    autoscroll.stop();
    autoscrollRef.current = null;
  }, [autoscroll]);

  const endGesture = useCallback(() => {
    longPressApiRef.current?.cancel();
    touchMovePreventerRef.current?.();
    touchMovePreventerRef.current = null;
    stopAutoscroll();
    detachRef.current?.();
    detachRef.current = null;
    pointerIdRef.current = null;
    lastPointerEventRef.current = null;
    gestureRef.current = IDLE_MENU_PRESS;
  }, [stopAutoscroll]);

  const highlight = useCallback(
    (row: HTMLElement | null) => {
      const {onHighlight, menuRef} = optionsRef.current;
      if (onHighlight != null) {
        onHighlight(row);
        return;
      }
      // In a menu the highlight IS focus. A row whose root takes no
      // focus is highlighted through the control inside it; over nothing,
      // the menu root holds focus so no row is lit. The focus follows the
      // last input (`architecture:interaction-modality` INV1): a held press
      // is pointer input, so the row does not match :focus-visible, which a
      // plain focus() would inherit from the focus before it.
      const target =
        row == null
          ? menuRef.current
          : isRowFocusable(row)
            ? row
            : row.querySelector<HTMLElement>(INNER_CONTROL_SELECTOR);
      if (target != null && target !== getDocument().activeElement) {
        focusForLastInput(target, {preventScroll: true});
      }
    },
    [getDocument],
  );

  const activate = useCallback((row: HTMLElement, release: PointerEvent) => {
    const {onActivate} = optionsRef.current;
    isModelActivation = true;
    try {
      if (onActivate != null) {
        onActivate(row, release);
        return;
      }
      // The row acts as its own click would. `detail: 0` marks a dispatched
      // activation, as a keyboard's does, so the stray-click swallower lets
      // it through; the button and modifiers are the release's.
      row.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: 0,
          button: release.button,
          clientX: release.clientX,
          clientY: release.clientY,
          screenX: release.screenX,
          screenY: release.screenY,
          ctrlKey: release.ctrlKey,
          shiftKey: release.shiftKey,
          altKey: release.altKey,
          metaKey: release.metaKey,
        }),
      );
    } finally {
      isModelActivation = false;
    }
  }, []);

  // Declared before `step` so the mutual recursion through refs type-checks.
  const stepRef = useRef<
    (event: MenuPressInput<HTMLElement>, native?: PointerEvent) => void
  >(() => {});

  const applyEffect = useCallback(
    (
      effect: MenuPressOutcome<HTMLElement>,
      gesture: MenuPressState<HTMLElement>,
      native: PointerEvent | undefined,
    ) => {
      const doc = getDocument();
      switch (effect.type) {
        case 'none':
          return;
        case 'open': {
          const pointerType =
            gesture.phase === 'open' ? gesture.pointerType : 'mouse';
          triggerGestureRef.current = currentGesture();
          const didOpen =
            optionsRef.current.onTriggerPress?.(pointerType) ?? false;
          if (!didOpen) {
            endGesture();
          }
          return;
        }
        case 'highlight':
          highlight(effect.row);
          return;
        case 'clear':
          highlight(null);
          return;
        case 'act': {
          // Detach before acting: the activation usually closes the menu.
          endGesture();
          armStrayClick(doc);
          if (native != null) {
            activate(effect.row, native);
          }
          return;
        }
        case 'settle': {
          // A finger's lit row clears on a cancel only where the primary
          // pointer is coarse (the 'uikit' touch model); elsewhere the
          // highlight stays as before (spec:AST-094 FR19, AST-017 FR59).
          if (
            effect.clear === true &&
            optionsRef.current.touchModel === 'uikit'
          ) {
            highlight(null);
          }
          endGesture();
          if (effect.stray) {
            armStrayClick(doc);
          }
          if (effect.dismiss) {
            optionsRef.current.onDismiss?.();
          }
          return;
        }
      }
    },
    [activate, endGesture, getDocument, highlight],
  );

  const step = useCallback(
    (event: MenuPressInput<HTMLElement>, native?: PointerEvent) => {
      const result = menuPressTransition(gestureRef.current, event);
      gestureRef.current = result.gesture;
      applyEffect(result.effect, result.gesture, native);
    },
    [applyEffect],
  );
  stepRef.current = step;

  // --- Edge autoscroll -----------------------------------------------

  const getScroller = useCallback((): HTMLElement | null => {
    const {getScroller: custom, menuRef} = optionsRef.current;
    if (custom != null) {
      return custom();
    }
    const menu = menuRef.current;
    if (menu == null) {
      return null;
    }
    return menu.scrollHeight > menu.clientHeight + 1 ? menu : null;
  }, []);

  const updateAutoscroll = useCallback(
    (event: PointerEvent) => {
      if (gestureRef.current.phase !== 'tracking') {
        stopAutoscroll();
        return;
      }
      const scroller = getScroller();
      if (scroller == null) {
        stopAutoscroll();
        return;
      }
      const rect = scroller.getBoundingClientRect();
      if (rect.height <= 0) {
        stopAutoscroll();
        return;
      }
      let direction: 1 | -1 | 0 = 0;
      if (event.clientY <= rect.top + MENU_PRESS_AUTOSCROLL_ZONE_PX) {
        direction = -1;
      } else if (event.clientY >= rect.bottom - MENU_PRESS_AUTOSCROLL_ZONE_PX) {
        direction = 1;
      }
      if (direction === 0) {
        stopAutoscroll();
        return;
      }
      if (autoscrollRef.current?.direction === direction) {
        return;
      }
      stopAutoscroll();
      autoscrollRef.current = {
        scroller,
        direction,
        // The rows moved under the resting pointer: re-read the row under it.
        reread: () => {
          const last = lastPointerEventRef.current;
          if (last != null) {
            const point = resolvePoint(last);
            stepRef.current(
              {
                type: 'move',
                row: point.row,
                isInMenu: point.isInMenu,
                time: Date.now(),
              },
              last,
            );
          }
        },
      };
      autoscroll.update();
    },
    [autoscroll, getScroller, resolvePoint, stopAutoscroll],
  );

  // --- Document-level tracking ----------------------------------------------

  const attach = useCallback(
    (pointerId: number) => {
      detachRef.current?.();
      const doc = getDocument();
      const view = doc.defaultView;
      pointerIdRef.current = pointerId;

      const onMove = (event: PointerEvent) => {
        if (event.pointerId !== pointerIdRef.current) {
          return;
        }
        lastPointerEventRef.current = event;
        const gesture = gestureRef.current;
        if (gesture.phase === 'triggerPress') {
          // A finger that travels is scrolling, not holding. The tolerance is
          // the shared hook's, so it cannot drift from ContextMenu's.
          const isPending = longPressApiRef.current?.moveTo({
            x: event.clientX,
            y: event.clientY,
          });
          if (isPending === false) {
            stepRef.current({type: 'cancel'});
          }
          return;
        }
        const point = resolvePoint(event);
        stepRef.current(
          {
            type: 'move',
            row: point.row,
            isInMenu: point.isInMenu,
            time: Date.now(),
            ...handoffPosition(
              event,
              optionsRef.current.touchModel === 'uikit',
            ),
          },
          event,
        );
        updateAutoscroll(event);
      };
      const onUp = (event: PointerEvent) => {
        if (event.pointerId !== pointerIdRef.current) {
          return;
        }
        const point = resolvePoint(event);
        stepRef.current(
          {
            type: 'up',
            row: point.row,
            isInMenu: point.isInMenu,
            isOnTrigger: point.isOnTrigger,
            time: Date.now(),
            ...handoffPosition(
              event,
              optionsRef.current.touchModel === 'uikit',
            ),
          },
          event,
        );
      };
      const onCancel = (event: PointerEvent) => {
        if (event.pointerId !== pointerIdRef.current) {
          return;
        }
        stepRef.current({type: 'cancel'});
      };
      const onOtherPointerDown = (event: PointerEvent) => {
        // A second pointer ends the gesture: two fingers are a pinch or a
        // scroll, never a pick.
        if (event.pointerId !== pointerIdRef.current) {
          ignoredPointerIdRef.current = event.pointerId;
          stepRef.current({type: 'cancel'});
        }
      };
      const onBlur = () => {
        stepRef.current({type: 'cancel'});
      };

      doc.addEventListener('pointermove', onMove, true);
      doc.addEventListener('pointerup', onUp, true);
      doc.addEventListener('pointercancel', onCancel, true);
      doc.addEventListener('pointerdown', onOtherPointerDown, true);
      view?.addEventListener('blur', onBlur);
      detachRef.current = () => {
        doc.removeEventListener('pointermove', onMove, true);
        doc.removeEventListener('pointerup', onUp, true);
        doc.removeEventListener('pointercancel', onCancel, true);
        doc.removeEventListener('pointerdown', onOtherPointerDown, true);
        view?.removeEventListener('blur', onBlur);
      };
    },
    [getDocument, resolvePoint, updateAutoscroll],
  );

  // --- The held finger on the trigger ----------------------------

  // `touch-action` was decided when the finger landed; the page must not
  // scroll under a finger that is now driving a menu. Taken off when the
  // gesture ends.
  const installTouchMovePreventer = useCallback(() => {
    touchMovePreventerRef.current?.();
    const doc = getDocument();
    const prevent = (event: TouchEvent) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };
    doc.addEventListener('touchmove', prevent, {passive: false, capture: true});
    touchMovePreventerRef.current = () => {
      doc.removeEventListener('touchmove', prevent, true);
    };
  }, [getDocument]);

  // The trigger half (menuTriggerPress.ts, or nothing for a menu with no
  // trigger) drives the model through this stable context.
  const installRef = useRef(installTouchMovePreventer);
  installRef.current = installTouchMovePreventer;
  const attachRef = useRef(attach);
  attachRef.current = attach;
  const holdDetectorsRef = useRef<{
    plain: UseLongPressHandlers;
    scroller: UseLongPressHandlers;
  } | null>(null);
  const [triggerContext] = useState<MenuTriggerContext>(() => ({
    optionsRef,
    gestureRef,
    setTriggerGesture: gesture => {
      triggerGestureRef.current = gesture;
    },
    setHoldDetectors: detectors => {
      holdDetectorsRef.current = detectors;
      longPressApiRef.current =
        holdKindRef.current === 'scroller'
          ? detectors.scroller
          : detectors.plain;
    },
    startHold: (kind, at) => {
      holdKindRef.current = kind;
      const detectors = holdDetectorsRef.current;
      if (detectors == null) {
        return;
      }
      const hold = kind === 'scroller' ? detectors.scroller : detectors.plain;
      longPressApiRef.current = hold;
      hold.start(at);
    },
    setLastPointerEvent: event => {
      lastPointerEventRef.current = event;
    },
    takeIgnoredPointer: pointerId => {
      if (pointerId !== ignoredPointerIdRef.current) {
        return false;
      }
      ignoredPointerIdRef.current = null;
      return true;
    },
    installTouchMovePreventer: () => installRef.current(),
    step: (event, native) => stepRef.current(event, native),
    attach: pointerId => attachRef.current(pointerId),
  }));

  // --- Handlers ------------------------------------------------------------

  const handleMenuPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const {menuRef, isEnabled = true} = optionsRef.current;
      const menu = menuRef.current;
      if (!isEnabled || menu == null) {
        return;
      }
      if (event.pointerId === ignoredPointerIdRef.current) {
        ignoredPointerIdRef.current = null;
        return;
      }
      if (gestureRef.current.phase !== 'idle') {
        // A second pointer landed inside the menu.
        step({type: 'cancel'});
        return;
      }
      const pointerType = normalizePointerType(event.pointerType);
      if (pointerType == null) {
        return;
      }
      if (pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      if (
        pointerType !== 'mouse' &&
        optionsRef.current.touchModel === 'uikit'
      ) {
        // The selection recognizer tracks fingers (see below).
        return;
      }
      // The innermost model owns the press: a flyout is a DOM descendant of
      // its parent menu, and both would otherwise track the same pointer.
      const target = event.target as Element | null;
      if (target?.closest(MENU_PRESS_ROOT_SELECTOR) !== menu) {
        return;
      }
      if (pointerType !== 'mouse') {
        // Cancelling pointerdown suppresses the compatibility mouse events a
        // finger would otherwise fire at the row it LANDED on when it lifts —
        // the mousedown that would light the origin row a second time.
        // Scrolling is governed by touch-action and is unaffected.
        event.preventDefault();
      }
      const native = event.nativeEvent;
      attach(native.pointerId);
      lastPointerEventRef.current = native;
      const point = resolvePoint(native);
      step(
        {
          type: 'down',
          target: 'menu',
          pointerType,
          row: point.row,
          time: Date.now(),
        },
        native,
      );
    },
    [attach, resolvePoint, step],
  );

  const isTriggerClickFromPress = useCallback((): boolean => {
    return (
      triggerGestureRef.current != null &&
      triggerGestureRef.current === currentGesture()
    );
  }, []);

  const continueGesture = useCallback(
    (pointer: MenuPressContinuation) => {
      const {isEnabled = true} = optionsRef.current;
      if (!isEnabled || gestureRef.current.phase !== 'idle') {
        return;
      }
      attach(pointer.pointerId);
      // The menu opened under this pointer: the gesture is the opening press.
      // Where the primary pointer is coarse a finger's handoff counts from the
      // first position the menu sees after it opened, as the trigger's opening
      // finger's does; elsewhere the settle rule decides its release.
      gestureRef.current = {
        phase: 'open',
        pointerType: pointer.pointerType,
        openedAt: pointer.time,
      };
      if (pointer.pointerType !== 'mouse') {
        installTouchMovePreventer();
      }
    },
    [attach, installTouchMovePreventer],
  );

  // --- A finger in the menu, as UIMenu's list tracks it ('uikit') ----------

  // The shared action-group tracker: the rows' rects are read once when the
  // press begins, the highlight is focus (DEC-6), the lift runs the row as
  // its own click would. Rows of the open flyouts are part of the group.
  const trackerRef = useRef<ActionGroupTracker | null>(null);
  const releaseRef = useRef<{x: number; y: number}>({x: 0, y: 0});
  trackerRef.current ??= createActionGroupTracker(() => ({
    roots: () => {
      const menu = optionsRef.current.menuRef.current;
      if (menu == null) {
        return [];
      }
      // The whole menu tree is one group: the outermost root holds the
      // flyouts nested in it, but a menu the root renders beside itself (a
      // sub-menu's dialog in the root's surface host) is not inside it.
      const root = getOutermostRoot(menu);
      return root.contains(menu) ? [root] : [root, menu];
    },
    itemSelector: optionsRef.current.itemSelector,
    highlightExpansion: 0,
    paintsHighlight: false,
    onHighlightChange: row => highlightRef.current(row),
    onActivate: row =>
      activateRef.current(row, syntheticRelease(row, releaseRef.current)),
  }));
  useEffect(() => () => trackerRef.current?.dispose(), []);
  const highlightRef = useRef(highlight);
  highlightRef.current = highlight;
  const activateRef = useRef(activate);
  activateRef.current = activate;
  const getScrollerRef = useRef(getScroller);
  getScrollerRef.current = getScroller;

  const [selection] = useState(
    () =>
      new MenuSelectionGestureRecognizer({
        name: 'MenuSelection',
        scrolls: () => getScrollerRef.current() != null,
        // The rows' own press tracking never sees the finger; the browser's
        // click for a recognized press is withheld (the row runs at the lift).
        delaysTouchesBegan: true,
        shouldReceiveTouch: (_recognizer, touch) => {
          // The innermost menu owns the finger: a flyout tracks its own.
          const target = touch.target;
          return (
            target instanceof Element &&
            target.closest(MENU_PRESS_ROOT_SELECTOR) ===
              optionsRef.current.menuRef.current
          );
        },
      }),
  );
  const onSelection = useCallback(
    (recognizer: MenuSelectionGestureRecognizer) => {
      const tracker = trackerRef.current;
      if (tracker == null) {
        return;
      }
      switch (recognizer.state) {
        case 'began': {
          // The press begins where the finger landed, then follows it.
          const landing = recognizer.landingLocation();
          tracker.begin(landing.x, landing.y);
          const {x, y} = recognizer.location();
          if (x !== landing.x || y !== landing.y) {
            tracker.move(x, y);
          }
          break;
        }
        case 'changed': {
          const {x, y} = recognizer.location();
          tracker.move(x, y);
          break;
        }
        case 'ended': {
          const {x, y} = recognizer.location();
          if (tracker.isTracking) {
            tracker.move(x, y);
          } else {
            // A tap: the row under it highlights and acts at the lift.
            tracker.begin(x, y);
          }
          releaseRef.current = {x, y};
          // The browser's own click for this finger is withheld by the
          // gesture host; a late one (WebKit aims it at the row the finger
          // landed on) is swallowed here too, as for every tracked press.
          armStrayClick(getDocument());
          tracker.end();
          break;
        }
        case 'cancelled':
          tracker.cancel();
          if (recognizer.endedByAnotherFinger) {
            // A click the browser still reports for the first finger acts
            // on nothing (FR4, FR5).
            armStrayClick(getDocument());
          }
          break;
        case 'possible':
        case 'failed':
          break;
      }
    },
    [getDocument],
  );
  // Synchronizes with the selection recognizer (gesture system): its state
  // changes drive the action-group tracker.
  useEffect(() => selection.addListener(onSelection), [selection, onSelection]);
  const isSelectionEnabled =
    options.touchModel === 'uikit' && (options.isEnabled ?? true);
  // Synchronizes the selection recognizer's enabled flag. Turning it off
  // mid-press cancels the recognizer, whose listener cancels the tracker
  // (a consumer's onHighlight(null)).
  useIsomorphicLayoutEffect(() => {
    selection.setEnabled(isSelectionEnabled);
  }, [selection, isSelectionEnabled]);
  // Synchronizes the gesture host: the recognizer is attached to the menu
  // root only while the menu shows, so a closed menu adds no listeners to
  // the page. A menu in a popover follows the popover's beforetoggle; one
  // outside a popover is attached while it is in the document. The root is
  // re-read on every commit: a layer mounts its content after the hook's
  // first commit, and a flyout's on open.
  const selectionHostRef = useRef<{
    element: Element;
    layer: Element | null;
    detach: (() => void) | null;
    stopWatching: () => void;
  } | null>(null);
  const isMenuOpen = options.isOpen;
  useIsomorphicLayoutEffect(() => {
    const element =
      isSelectionEnabled && isMenuOpen !== false
        ? options.menuRef.current
        : null;
    if (selectionHostRef.current?.element === element) {
      return;
    }
    const previous = selectionHostRef.current;
    previous?.stopWatching();
    previous?.detach?.();
    if (element == null) {
      selectionHostRef.current = null;
      return;
    }
    const layer = element.closest('[popover]');
    const entry: NonNullable<typeof selectionHostRef.current> = {
      element,
      layer,
      detach: null,
      stopWatching: () => {},
    };
    const setAttached = (attached: boolean) => {
      if (attached && entry.detach == null) {
        // The menu declares its own touch-action (FR4).
        entry.detach = getGestureHost(element.ownerDocument).attach(
          element,
          selection,
          {manageStyle: false},
        );
      } else if (!attached && entry.detach != null) {
        entry.detach();
        entry.detach = null;
      }
    };
    if (layer == null || isMenuOpen === true) {
      // The owner says it shows (or nothing else can tell).
      setAttached(true);
    } else {
      setAttached(isShowing(element));
      entry.stopWatching = watchToggle(layer, isOpen => setAttached(isOpen));
    }
    selectionHostRef.current = entry;
  });
  // Detaches from the gesture host on unmount.
  useEffect(
    () => () => {
      selectionHostRef.current?.stopWatching();
      selectionHostRef.current?.detach?.();
      selectionHostRef.current = null;
    },
    [],
  );

  const cancel = useCallback(() => {
    // The host closed the menu under the gesture: end it with no effect of
    // its own.
    endGesture();
  }, [endGesture]);

  useEffect(() => {
    // Install the gesture counter's listeners before the first press.
    currentGesture();
    return () => {
      endGesture();
    };
  }, [endGesture]);

  const surface = useMemo<MenuSurfacePressReturn>(
    () => ({
      menuProps: {
        onPointerDown: handleMenuPointerDown,
        [MENU_PRESS_MARKER]: '',
      },
      isTriggerClickFromPress,
      cancel,
      continueGesture,
    }),
    [handleMenuPointerDown, isTriggerClickFromPress, cancel, continueGesture],
  );
  return {surface, triggerContext};
}
