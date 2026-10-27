// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuDrillInMotion.ts
 * @input The menu's box (the popover frame that paints it) and its
 *   role="menu" list, the parent's rows and the shown view's card that
 *   useMenuDrillIn lays out, the motion animator, the sub-menu springs
 *   (`springs.subMenuOpen`, `springs.subMenuBack`, internal motion roles)
 *   and UIMenu's sub-menu values from the UIKit constants table
 * @output Exports createMenuDrillInMotion and MenuDrillInMotion: UIMenu's
 *   in-place sub-menu, played around DropdownMenu's drill-in (push and pop of
 *   a view as a card), and the attributes it sets while it plays
 * @position Touch presentation of DropdownMenu's drilled-in sub-menus, in its
 *   touch module (DropdownMenuTouch.ts); driven by useMenuDrillIn (capture
 *   before the view changes, play after)
 *
 * UIMenu on a phone opens a sub-menu in place (iOS 26.2, `menu.*`): a card
 * laid over the parent's rows from the tapped row grows down to fit the
 * sub-menu, the menu's box with it, on `springs.subMenuOpen`; its rows are
 * revealed by the card's bottom edge, never faded or slid. The parent's rows
 * recede under it (to `menu.submenuParentOpacity`, scaled to
 * `menu.submenuParentScale` about their center), and never vanish. The
 * header stays on the row and becomes the header in place, its title set in
 * semibold, while its chevron turns from ahead to down on
 * `menu.submenuHeaderSpring`; the title's text is drawn once (INV7), so its
 * weight changes at once where UIMenu cross-fades two labels. Back reverses
 * it on `springs.subMenuBack` and
 * `menu.submenuHeaderBackSpring`. The two box springs are internal motion roles
 * (`spec:AST-094` FR4, FR34).
 *
 * The parent's rows are the live ones (useMenuDrillIn keeps them, receded,
 * inert and hidden from assistive technology, under the card): nothing copies
 * them. What moves is drawn without adding elements:
 *
 * - the menu's box grows on its own pseudo-elements: its paint steps aside
 *   (`MENU_BOX_MOTION_ATTRIBUTE`) for its fixed corner cap (its own
 *   background, cut to the cap), a middle that scales and a moving cap that
 *   travels, each casting the box's shadow on its outer sides only;
 * - the card is revealed by its own box as a window: it moves up by the
 *   height still to reveal while its view moves down by the same, so the view
 *   stands still and its bottom edge uncovers it (a clip that only moves).
 *
 * The pop plays the leaving card itself: useMenuDrillIn keeps its view
 * rendered (inert, hidden from assistive technology, out of the menu's flow)
 * until `play`'s `done` runs at the end, so nothing copies it
 * (architecture:component-style-authoring INV7). Everything that moves is a
 * transform or an opacity: nothing runs on the main thread per frame. Under
 * Reduce Motion the animator's policy applies.
 *
 * SYNC: When modified, update menuDrillInMotion.test.ts, useMenuDrillIn.tsx
 * and DropdownMenu.tsx (the box's pseudo-element styles)
 */

import {
  createAnimator,
  type Animator,
  type AnimatorOptions,
  type MotionHandle,
} from '../motion/animator';
import type {SpringDescription} from '../motion/spring';
import {menu} from '../motion/uikit/menu';
import {springs} from '../motion/uikit/springs';
import {isRtlElement} from '../hooks/isRtlElement';

/**
 * Set on the menu's box while it grows or shrinks: `top` or `bottom`, the
 * edge that stays. Its pseudo-elements draw it then (DropdownMenu.tsx).
 */
export const MENU_BOX_MOTION_ATTRIBUTE = 'data-astryx-menu-box-motion';

const PARENT_SELECTOR = '[data-astryx-menu-parent]';
const CARD_SELECTOR = '[data-astryx-menu-card]';
const HEADER_SELECTOR = '[data-astryx-menu-submenu-header]';
const TITLE_SELECTOR = '[data-astryx-menu-submenu-title]';
const CHEVRON_SELECTOR = '[data-astryx-menu-submenu-chevron]';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const boxOf = (element: Element): Box => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
};

interface Captured {
  kind: 'push' | 'pop';
  /**
   * The push leaves the root's rows, or the pop returns to them: only then
   * do the parent's rows recede or come back, and only a pop to the root
   * plays its card out (a deeper level shows in the same card).
   */
  atRoot: boolean;
  /** The menu's box before the change. */
  box: Box;
  /** Push: where the tapped row's title stood (the header's starts there). */
  rowTitleTop: number | null;
  /**
   * The parent's rows as they stood under the card: on a pop the view has
   * changed by `play`, and the wrapper no longer carries its card marker.
   */
  parent: HTMLElement | null;
  /** Pop: the leaving card (it stays rendered until `done`), and its parts. */
  leaving: {
    card: HTMLElement;
    view: HTMLElement | null;
    chevron: HTMLElement | null;
    height: number;
    revealed: number;
  } | null;
}

export interface MenuDrillInMotion {
  /**
   * Read the layout before the view changes: `push` as a sub-menu opens from
   * `row`, `pop` as it goes back to it.
   */
  capture(kind: 'push' | 'pop', row: HTMLElement | null, atRoot: boolean): void;
  /**
   * Play from the captured layout once the view has changed. `done` runs
   * once it has settled, or at once when there is nothing to play, or when
   * it is reset.
   */
  play(done?: () => void): void;
  /** Stop and remove everything at once (the menu closes, or unmounts). */
  reset(): void;
  dispose(): void;
}

export interface MenuDrillInElements {
  /** The popover: the menu's box, with its background and shadow. */
  surface: HTMLElement | null;
  /** The role="menu" element holding the rows and the drilled-in views. */
  list: HTMLElement | null;
}

/**
 * The element that paints the menu's box (its background, radius and
 * shadow): the popover itself, or the frame inside it that holds the list.
 */
function paintOf(surface: HTMLElement, list: HTMLElement): HTMLElement {
  for (
    let element: HTMLElement | null = list;
    element != null && element !== surface.parentElement;
    element = element.parentElement
  ) {
    const style = getComputedStyle(element);
    // A computed colour with a zero alpha, in any notation, paints nothing.
    const painted =
      style.backgroundColor !== '' &&
      style.backgroundColor !== 'transparent' &&
      !/[,/]\s*0\)$/.test(style.backgroundColor);
    const shadowed = !['', 'none'].includes(style.boxShadow);
    if (painted || shadowed) {
      return element;
    }
  }
  return surface;
}

/**
 * The view a card shows: every level portals into the one card, and a level
 * under a deeper one stays in it, hidden, so the shown view is the last child
 * that is not hidden.
 */
function shownViewOf(card: HTMLElement): HTMLElement | null {
  for (
    let child = card.lastElementChild;
    child != null;
    child = child.previousElementSibling
  ) {
    if (child instanceof HTMLElement && !child.hidden) {
      return child;
    }
  }
  return null;
}

/** The title of a header row, where its text sits. */
const titleOf = (row: Element | null): HTMLElement | null =>
  row?.querySelector<HTMLElement>(TITLE_SELECTOR) ??
  row?.querySelector<HTMLElement>('[data-astryx-item-label]') ??
  null;

/**
 * Create the motion. `getElements` is read on each call, so a component can
 * pass refs that are filled after the menu mounts.
 */
export function createMenuDrillInMotion(
  getElements: () => MenuDrillInElements,
  options: Pick<AnimatorOptions, 'now' | 'requestFrame'> = {},
): MenuDrillInMotion {
  let captured: Captured | null = null;
  // The caller's `done` for the transition in flight.
  let pendingDone: (() => void) | null = null;
  // Everything the transition in flight set, undone at its end.
  let transition: {
    animators: Animator[];
    /** Inline values it overrode, restored at its end. */
    saved: {element: HTMLElement; property: string; value: string}[];
    attributes: {element: HTMLElement; name: string}[];
    handles: MotionHandle[];
  } | null = null;

  const animator = (element: HTMLElement, pseudoElement?: string): Animator => {
    const created = createAnimator(element, {...options, pseudoElement});
    transition?.animators.push(created);
    return created;
  };
  const override = (element: HTMLElement, property: string, value: string) => {
    transition?.saved.push({
      element,
      property,
      value: element.style.getPropertyValue(property),
    });
    element.style.setProperty(property, value);
  };
  const mark = (element: HTMLElement, name: string, value = '') => {
    element.setAttribute(name, value);
    transition?.attributes.push({element, name});
  };

  const finish = () => {
    const done = pendingDone;
    pendingDone = null;
    done?.();
  };

  const endTransition = () => {
    const ending = transition;
    transition = null;
    if (ending == null) {
      finish();
      return;
    }
    for (const created of ending.animators) {
      created.dispose();
    }
    for (const {element, property, value} of ending.saved.reverse()) {
      if (value === '') {
        element.style.removeProperty(property);
      } else {
        element.style.setProperty(property, value);
      }
    }
    for (const {element, name} of ending.attributes) {
      element.removeAttribute(name);
    }
    finish();
  };

  /**
   * Draw the menu's box from `from` to `to` (its box now) on its own
   * pseudo-elements, moving the edge it is not anchored by.
   */
  const playBox = (
    paint: HTMLElement,
    from: Box,
    to: Box,
    spring: SpringDescription,
    at: number | undefined,
  ) => {
    if (Math.abs(from.height - to.height) < 0.5) {
      return;
    }
    const radius = Math.min(
      parseFloat(getComputedStyle(paint).borderTopLeftRadius) || 0,
      to.height / 2,
      from.height / 2,
    );
    const keepsBottom =
      Math.abs(from.top + from.height - (to.top + to.height)) <=
      Math.abs(from.top - to.top);
    const middleTo = Math.max(to.height - 2 * radius, 1);
    const middleFrom = Math.max(from.height - 2 * radius, 0);
    const shift = keepsBottom
      ? from.top - to.top
      : from.top + from.height - (to.top + to.height);
    override(paint, '--_menu-box-radius', `${radius}px`);
    mark(paint, MENU_BOX_MOTION_ATTRIBUTE, keepsBottom ? 'bottom' : 'top');
    const middle = animator(paint, '::after');
    middle.set({scaleY: middleFrom / middleTo});
    const edge = animator(paint, '::before');
    edge.set({y: shift});
    transition?.handles.push(
      middle.animate({scaleY: 1}, {spring}, {at}),
      edge.animate({y: 0}, {spring}, {at}),
    );
  };

  /**
   * Reveal `card`'s view by the card's bottom edge from `from` px to its full
   * height (or hide it back to `to` px): the card moves up by what is still
   * covered while its view moves down by the same, so the view stands still.
   */
  const playReveal = (
    card: HTMLElement,
    view: HTMLElement,
    height: number,
    from: number,
    to: number,
    spring: SpringDescription,
    at: number | undefined,
  ) => {
    override(card, 'overflow', 'clip');
    const window = animator(card);
    const content = animator(view);
    window.set({y: from - height});
    content.set({y: height - from});
    transition?.handles.push(
      window.animate({y: to - height}, {spring}, {at}),
      content.animate({y: height - to}, {spring}, {at}),
    );
  };

  /** The chevron turns from ahead (right, or left in RTL) to down, or back. */
  const playChevron = (
    chevron: HTMLElement | null,
    toDown: boolean,
    spring: SpringDescription,
    at: number | undefined,
  ) => {
    if (chevron == null) {
      return;
    }
    // At rest it points down (90°); ahead is right (0°), or left in RTL.
    const ahead = isRtlElement(chevron) ? 180 : 0;
    const turn = animator(chevron);
    turn.set({rotate: toDown ? ahead : 90});
    transition?.handles.push(
      turn.animate({rotate: toDown ? 90 : ahead}, {spring}, {at}),
    );
  };

  /** The parent's rows recede (`toReceded`) or come back. */
  const playParent = (
    parent: HTMLElement | null,
    toReceded: boolean,
    spring: SpringDescription,
    at: number | undefined,
  ) => {
    if (parent == null) {
      return;
    }
    if (!toReceded) {
      // Back: the parent's wrapper owns no box at rest; while it comes back
      // it keeps the box it had under the card.
      override(parent, 'display', 'flex');
      override(parent, 'flex-direction', 'column');
      override(parent, 'gap', 'inherit');
      override(parent, 'transform-origin', '50% 50%');
    }
    const opacity = menu.submenuParentOpacity;
    const scale = menu.submenuParentScale;
    // The receded rest is the wrapper's own style (useMenuDrillIn); the
    // animator plays toward it, and its inline values match it.
    const rows = animator(parent);
    rows.set(toReceded ? {opacity: 1, scale: 1} : {opacity, scale});
    transition?.handles.push(
      rows.animate(
        toReceded ? {opacity, scale} : {opacity: 1, scale: 1},
        {spring},
        {at},
      ),
    );
  };

  const settle = () => {
    const current = transition;
    if (current == null) {
      return;
    }
    void Promise.all(current.handles.map(async handle => handle.finished)).then(
      () => {
        if (transition === current) {
          endTransition();
        }
      },
    );
  };

  const capture: MenuDrillInMotion['capture'] = (kind, row, atRoot) => {
    const {surface, list} = getElements();
    captured = null;
    endTransition();
    if (surface == null || list == null) {
      return;
    }
    const paint = paintOf(surface, list);
    captured = {
      kind,
      atRoot,
      box: boxOf(paint),
      rowTitleTop: null,
      parent: list.querySelector<HTMLElement>(PARENT_SELECTOR),
      leaving: null,
    };
    if (kind === 'push') {
      const rowTitle = titleOf(row);
      captured.rowTitleTop = rowTitle == null ? null : boxOf(rowTitle).top;
      return;
    }
    // Pop to the root: the card itself plays out (its view stays rendered
    // until done). A deeper pop shows the level under it in the same card.
    if (!atRoot) {
      return;
    }
    const card = list.querySelector<HTMLElement>(CARD_SELECTOR);
    if (card == null) {
      return;
    }
    const cardBox = boxOf(card);
    if (cardBox.height <= 0) {
      return;
    }
    const view = shownViewOf(card);
    const header = view?.querySelector<HTMLElement>(HEADER_SELECTOR) ?? null;
    const headerBox = header == null ? null : boxOf(header);
    captured.leaving = {
      card,
      view,
      chevron: header?.querySelector<HTMLElement>(CHEVRON_SELECTOR) ?? null,
      height: cardBox.height,
      // The card hides back up into its header, as it came.
      revealed:
        headerBox == null ? 0 : headerBox.top + headerBox.height - cardBox.top,
    };
  };

  const play: MenuDrillInMotion['play'] = done => {
    const {surface, list} = getElements();
    const from = captured;
    captured = null;
    pendingDone = done ?? null;
    if (from == null || surface == null || list == null) {
      finish();
      return;
    }
    const paint = paintOf(surface, list);
    transition = {
      animators: [],
      saved: [],
      attributes: [],
      handles: [],
    };
    // One clock for every curve: the window and its view cancel exactly.
    const at = (options.now ?? (() => performance.now()))();
    const parent =
      from.kind === 'pop'
        ? from.parent
        : list.querySelector<HTMLElement>(PARENT_SELECTOR);
    if (from.kind === 'push') {
      const card = list.querySelector<HTMLElement>(CARD_SELECTOR);
      // The level that just showed, and its own header.
      const view = card == null ? null : shownViewOf(card);
      const header = view?.querySelector<HTMLElement>(HEADER_SELECTOR) ?? null;
      const spring = springs.subMenuOpen;
      playBox(paint, from.box, boxOf(paint), spring, at);
      if (from.atRoot) {
        playParent(parent, true, spring, at);
      }
      if (card != null && view != null) {
        const cardBox = boxOf(card);
        const headerBox = header == null ? null : boxOf(header);
        const revealed =
          headerBox == null
            ? 0
            : headerBox.top + headerBox.height - cardBox.top;
        playReveal(
          card,
          view,
          cardBox.height,
          revealed,
          cardBox.height,
          spring,
          at,
        );
      }
      const title = titleOf(header);
      if (title != null && from.rowTitleTop != null) {
        // The title stays on the row: it starts where the row's stood.
        const ride = animator(title);
        ride.set({y: from.rowTitleTop - boxOf(title).top});
        transition.handles.push(ride.animate({y: 0}, {spring}, {at}));
      }
      const quick = menu.submenuHeaderSpring;
      playChevron(
        header?.querySelector<HTMLElement>(CHEVRON_SELECTOR) ?? null,
        true,
        quick,
        at,
      );
    } else {
      const spring = springs.subMenuBack;
      playBox(paint, from.box, boxOf(paint), spring, at);
      if (from.atRoot) {
        playParent(parent, false, spring, at);
      }
      const leaving = from.leaving;
      if (leaving != null) {
        if (leaving.view != null) {
          playReveal(
            leaving.card,
            leaving.view,
            leaving.height,
            leaving.height,
            leaving.revealed,
            spring,
            at,
          );
        }
        const slow = menu.submenuHeaderBackSpring;
        playChevron(leaving.chevron, false, slow, at);
      }
    }
    settle();
  };

  return {
    capture,
    play,
    reset() {
      captured = null;
      endTransition();
    },
    dispose() {
      captured = null;
      endTransition();
    },
  };
}
