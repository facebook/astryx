// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useMenuDrillIn.tsx
 * @input React, StyleX, the shared SSR-safe media-query check
 * @output Exports useMenuDrillIn — the view stack a menu root keeps so its
 *   sub-menus can drill in, with an optional transition played around each
 *   push and pop (MenuDrillInTransition) — and the coarse-pointer query.
 * @position Internal; mounted by DropdownMenu and ContextMenu, read by
 *   DropdownMenuSubMenu through DropdownMenuContext.
 *
 * On a phone a flyout beside a phone-width menu has no room, so a sub-menu
 * row opens its own rows and a Back row in the same menu box. The root owns
 * the stack: `wrapContent` renders the root's rows inside a wrapper, followed
 * by the host element the shown view portals its rows into. The sub-menu row
 * stays mounted while its view shows, so its rows stay live and Back can
 * return focus to it without bookkeeping. Whether a finger drove the menu is
 * decided once, when it opens, so a menu never changes shape under a pointer.
 *
 * As a card (`isCard`, UIMenu's in-place sub-menu, iOS 26.2): the shown view
 * is a card laid over the parent's rows from the row it opened from, and the
 * parent's rows stay, receded (`menu.submenuParentOpacity`, scaled to
 * `menu.submenuParentScale`), inert and hidden from assistive technology,
 * under it: the list stacks the two in one grid cell (`cardStack`), so the
 * menu's box grows to hold the card. Otherwise a shown view replaces the
 * parent's rows, which hide.
 */

import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
  useEffect,
  useRef,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import * as stylex from '@stylexjs/stylex';
import type {DropdownMenuDrillIn} from './DropdownMenuContext';
import {useCompactDefinition} from '../utils/touchPresentation';
import {menu} from '../motion/uikit/menu';

/**
 * The same compact-touch condition the root presentation uses to decide the
 * bottom sheet (the active theme's, spec:AST-012 FR9), so
 * one component carries one meaning of "adaptive". A bare `(pointer: coarse)`
 * would disagree with it on a large touch tablet: the menu would stay an
 * anchored popover while its sub-menus replaced rows in place, a combination
 * nobody designed.
 */
function matchesCompactTouch(query: string): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(query).matches
  );
}

const styles = stylex.create({
  // The wrappers add no box of their own, so the menu's flex gap still runs
  // between the rows exactly as it does without them.
  tree: {
    display: 'contents',
  },
  treeHidden: {
    display: 'none',
  },
  // UIMenu's parent rows under an open sub-menu's card: still laid out as
  // the menu lays them out, receded, in the card's cell. The rest is the
  // individual `scale` property, the one the drill-in motion animates, so
  // its value replaces the rest rather than multiplying it.
  receded: (opacity: number, scale: number) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 'inherit',
    gridArea: '1 / 1',
    opacity,
    scale: `${scale}`,
    transformOrigin: '50% 50%',
  }),
  // The host is the card's cell: laid over the parent's rows, from the row
  // the view opened from down.
  card: (top: number) => ({
    display: 'flex',
    flexDirection: 'column',
    gridArea: '1 / 1',
    alignSelf: 'start',
    marginTop: top,
    position: 'relative',
    zIndex: 1,
  }),
  // The card going back: where it stood, out of the menu's flow, so the menu
  // lays out its parent's rows alone while the card plays out over them.
  cardLeaving: (top: number) => ({
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top,
    insetInlineStart: 0,
    insetInlineEnd: 0,
    zIndex: 1,
  }),
});

/**
 * Where `row` stands in its menu's content box (the top of the cell the card
 * shares with the parent's rows), in px from that box's top.
 */
function offsetInMenu(row: HTMLElement): number {
  const list = row.closest<HTMLElement>('[role="menu"]');
  if (list == null) {
    return 0;
  }
  const style = getComputedStyle(list);
  return (
    row.getBoundingClientRect().top -
    list.getBoundingClientRect().top -
    list.clientTop -
    (parseFloat(style.paddingTop) || 0) +
    list.scrollTop
  );
}

/**
 * What animates a view's change (menuDrillInMotion.ts): `capture` reads the
 * layout before the stack changes, `play` runs once the new view shows, and
 * `reset` drops everything when the menu closes.
 */
export interface MenuDrillInTransition {
  /**
   * Read the layout before the stack changes. `atRoot`: the push leaves the
   * root's rows, or the pop returns to them (only then do they recede or
   * come back).
   */
  capture(kind: 'push' | 'pop', row: HTMLElement | null, atRoot: boolean): void;
  /** `done` runs once the transition has settled, or has been reset. */
  play(done?: () => void): void;
  reset(): void;
}

export interface UseMenuDrillInReturn {
  /** The context value for `DropdownMenuContext.drillIn`. */
  drillIn: DropdownMenuDrillIn;
  /** Whether a view is shown in place of (or as a card over) the root's rows. */
  isDrilled: boolean;
  /**
   * Whether the shown view is a card over the root's rows: the menu then
   * stacks the two in one cell (`isCard` menus, a view without a header or
   * footer).
   */
  isCardShown: boolean;
  /**
   * Whether a card is going back over the root's rows (out of the menu's
   * flow, positioned in it): the menu is its containing block meanwhile.
   */
  isCardLeaving: boolean;
  /**
   * Wrap the root's rows: hidden while a view shows, followed by the host the
   * view renders into.
   */
  wrapContent: (content: ReactNode) => ReactNode;
}

/**
 * The drill-in view stack for a menu root.
 *
 * @param isOpen - whether the menu is open; the pointer kind is sampled when it
 *   opens and the stack empties when it closes.
 * @param transition - animates each push and pop (UIMenu's in-place
 *   sub-menu); optional.
 */
export function useMenuDrillIn(
  isOpen: boolean,
  transition?: MenuDrillInTransition | null,
  {isCard = false}: {isCard?: boolean} = {},
): UseMenuDrillInReturn {
  const compactTouchQuery = useCompactDefinition().coarsePointerQuery;
  const [isCompactTouch, setIsCompactTouch] = useState(false);
  const [viewStack, setViewStack] = useState<ReadonlyArray<string>>([]);
  // As a card: where the shown view's card starts (the row it opened from);
  // null when the view is no card (it renders beside the menu).
  const [cardTop, setCardTop] = useState<number | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  // The view going back as a card, and where its card stood in the menu.
  const [leaving, setLeaving] = useState<{viewId: string; top: number} | null>(
    null,
  );
  const leavingRef = useRef(leaving);
  leavingRef.current = leaving;
  // Derived from the open transition during render (the documented pattern
  // for state that follows a prop): the pointer kind is sampled as the menu
  // opens, and closing forgets the drilled view so the next open starts at
  // the root.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setIsCompactTouch(matchesCompactTouch(compactTouchQuery));
    } else {
      if (viewStack.length > 0) {
        setViewStack([]);
      }
      if (leaving != null) {
        setLeaving(null);
      }
    }
  }
  const transitionRef = useRef(transition);
  transitionRef.current = transition;
  // A closed menu keeps nothing of a view's motion.
  useEffect(() => {
    if (!isOpen) {
      transitionRef.current?.reset();
    }
  }, [isOpen]);
  // The new view shows: play from the layout captured before the change. A
  // card going back stays until its motion is done.
  useIsomorphicLayoutEffect(() => {
    const going = leavingRef.current;
    transitionRef.current?.play(
      going == null
        ? undefined
        : () =>
            setLeaving(current =>
              current?.viewId === going.viewId ? null : current,
            ),
    );
  }, [viewStack]);

  const viewStackRef = useRef(viewStack);
  viewStackRef.current = viewStack;
  const push = useCallback<DropdownMenuDrillIn['push']>(
    (viewId, row, {isCard: asCard = true} = {}) => {
      if (viewStackRef.current.includes(viewId)) {
        return;
      }
      // Read the layout as it stands, before the view replaces it.
      transitionRef.current?.capture(
        'push',
        row ?? null,
        viewStackRef.current.length === 0,
      );
      if (viewStackRef.current.length === 0) {
        // The first view's card starts at its row; a deeper one keeps the cell.
        setCardTop(!asCard ? null : row == null ? 0 : offsetInMenu(row));
      }
      setViewStack(stack =>
        stack.includes(viewId) ? stack : [...stack, viewId],
      );
    },
    [],
  );
  const isCardShownRef = useRef(false);
  const pop = useCallback(
    (row?: HTMLElement | null) => {
      const stack = viewStackRef.current;
      if (stack.length === 0) {
        return;
      }
      transitionRef.current?.capture('pop', row ?? null, stack.length === 1);
      // The card plays out where it stands, so the view stays rendered until
      // the motion is done (architecture:component-style-authoring INV7: no
      // copy of it).
      if (
        transitionRef.current != null &&
        isCardShownRef.current &&
        stack.length === 1 &&
        host != null
      ) {
        setLeaving({viewId: stack[0], top: host.offsetTop});
      }
      setViewStack(current =>
        current.length === 0 ? current : current.slice(0, -1),
      );
    },
    [host],
  );

  const leavingId = leaving?.viewId ?? null;
  const drillIn = useMemo<DropdownMenuDrillIn>(
    () => ({
      isCompactTouch,
      viewStack,
      isCard,
      host,
      leaving: leavingId,
      push,
      pop,
    }),
    [isCompactTouch, viewStack, isCard, host, leavingId, push, pop],
  );

  const isDrilled = viewStack.length > 0;

  // The wrappers render always, not only once a view shows: a tree that
  // changed shape at push time would remount the sub-menu row, and with it the
  // view id it just pushed. They own no box (`display: contents`), so the
  // menu's layout is unchanged.
  const leavingTop = leaving?.top ?? null;
  const isCardShownNow = isDrilled && isCard && cardTop != null;
  isCardShownRef.current = isCardShownNow;
  const wrapContent = useCallback(
    (content: ReactNode): ReactNode => {
      const isCardShown = isDrilled && isCard && cardTop != null;
      return (
        <>
          <div
            hidden={isDrilled && !isCardShown}
            inert={isDrilled}
            aria-hidden={isCardShown || undefined}
            data-astryx-menu-parent={isCardShown ? '' : undefined}
            {...stylex.props(
              styles.tree,
              isDrilled &&
                (isCardShown
                  ? styles.receded(
                      menu.submenuParentOpacity,
                      menu.submenuParentScale,
                    )
                  : styles.treeHidden),
            )}>
            {content}
          </div>
          <div
            ref={setHost}
            data-astryx-menu-card={isCardShown ? '' : undefined}
            {...stylex.props(
              styles.tree,
              isCardShown
                ? styles.card(cardTop ?? 0)
                : leavingTop != null && styles.cardLeaving(leavingTop),
            )}
          />
        </>
      );
    },
    [isDrilled, isCard, cardTop, leavingTop],
  );

  return {
    drillIn,
    isDrilled,
    isCardShown: isCardShownNow,
    isCardLeaving: leaving != null,
    wrapContent,
  };
}
