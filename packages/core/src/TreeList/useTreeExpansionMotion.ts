// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTreeExpansionMotion.ts
 * @input A tree row's expanded state, the touch presentation
 *   (utils/touchPresentation.ts), the motion foundation's animator and the
 *   outline spring from the UIKit constants table (motion/uikit/list.ts)
 * @output `useTreeExpansionMotion`: whether a row renders its children, the
 *   ref its group attaches, and the expand and collapse played the way a UIKit
 *   outline list plays them on a touch screen
 * @position TreeList internals; TreeListItem calls it for every row with
 *   children
 *
 * UIKit's reference (iOS 26.2, a UICollectionView list with outline
 * disclosure): on expand, the children slide down out from under the parent
 * as one block, inside a clip that grows with them; the rows below move down
 * with them; the disclosure chevron turns 90°; all on one critically damped
 * spring (`list.update.outlineSpring`), with no fade. Collapse runs the same
 * motion back: the children slide up under the parent and leave when it ends.
 *
 * HOW IT RUNS, compositor only. The group keeps its final layout; it clips its
 * own box for the length of the motion, so its top edge (the parent row's
 * bottom) is the clip's edge, and its children translate as one block from
 * the group's height above it. Every row after the group in the tree
 * translates by the same amount, so the rows below always meet the block's
 * bottom edge: the clip never has to move. The chevron turns by an additive
 * `rotate` over its final CSS transform. All of it is `translate` and
 * `rotate` played by the animator on the compositor, retargeted from the
 * value on screen when the row is toggled again mid-motion. A collapse keeps
 * the children rendered until the block has slid away; the commit that
 * removes them shifts the rows below back by the same height, so nothing
 * jumps. Page content below the tree moves the same way (utils/rowMotion.ts
 * `contentBelow`: in-flow content after the tree up to its scroll container,
 * never an element another owner already translates), unless the tree is
 * told to keep it still (`followingContent: 'stays'`).
 *
 * With a mouse (the theme's presentation) nothing moves: the children appear
 * and leave at once, as before. Leaving children are inert while they slide
 * away: focus, arrow keys and assistive technology skip them.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TreeList/TreeListItem.tsx
 * - /packages/core/src/TreeList/__tests__/TreeListExpand.interaction.browser.spec.ts
 */

import {useCallback, useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {list} from '../motion/uikit/list';
import {
  animatorFor,
  contentBelow,
  motionNow,
  releaseMotion,
  springHome,
  springTo,
} from '../utils/rowMotion';
import {useMotionPresentation} from '../utils/touchPresentation';

const SPRING = list.update.outlineSpring;
/** The chevron turns a quarter turn between collapsed and expanded. */
const QUARTER_TURN = 90;

/** Every row after `group` in its tree, at each level up to the tree. */
function rowsAfter(group: HTMLElement): HTMLElement[] {
  const rows: HTMLElement[] = [];
  const tree = group.closest('[role="tree"]');
  let item = group.parentElement?.closest('li') ?? null;
  while (item != null && tree?.contains(item) === true) {
    for (
      let next = item.nextElementSibling;
      next != null;
      next = next.nextElementSibling
    ) {
      if (next instanceof HTMLElement) {
        rows.push(next);
      }
    }
    item = item.parentElement?.closest('li') ?? null;
  }
  return rows;
}

export interface TreeExpansionMotion {
  /** Render the children: expanded, or still sliding away. */
  readonly showsChildren: boolean;
  /** For the children's group (`ul[role="group"]`). */
  readonly groupRef: (element: HTMLUListElement | null) => void;
}

/** The row's own chevron glyph (`data-tree-chevron`), beside its group. */
function chevronOf(group: HTMLElement): HTMLElement | null {
  return (
    group.parentElement?.querySelector<HTMLElement>(
      ':scope > :not([role="group"]) [data-tree-chevron]',
    ) ?? null
  );
}

export function useTreeExpansionMotion(
  isExpanded: boolean,
  followingContent: 'moves' | 'stays' = 'moves',
): TreeExpansionMotion {
  const animates = useMotionPresentation() === 'uikit';
  const [shown, setShown] = useState(isExpanded);
  if (isExpanded && !shown) {
    setShown(true);
  }
  if (!isExpanded && shown && !animates) {
    setShown(false);
  }

  const groupElementRef = useRef<HTMLUListElement | null>(null);
  const previousRef = useRef({isExpanded, shown});
  /** The motion in flight; a newer one makes an older one's ending moot. */
  const generationRef = useRef(0);
  /** A motion is running: a toggle now retargets it instead of restarting. */
  const inFlightRef = useRef(false);
  /** The rows the motion moves and the height they move by. */
  const movedRef = useRef<{rows: HTMLElement[]; height: number}>({
    rows: [],
    height: 0,
  });

  useIsomorphicLayoutEffect(() => {
    const before = previousRef.current;
    previousRef.current = {isExpanded, shown};

    // The commit that removed the children moved the rows below up by their
    // height: move them back down by it, invisibly, and let them rest.
    if (before.shown && !shown) {
      const {rows, height} = movedRef.current;
      const at = motionNow();
      for (const row of rows) {
        const animator = animatorFor(row);
        animator.set({y: animator.get('y', at) + height});
        releaseMotion(row, 'translate');
      }
      movedRef.current = {rows: [], height: 0};
      inFlightRef.current = false;
      return;
    }
    if (before.isExpanded === isExpanded || !animates) {
      return;
    }
    const element = groupElementRef.current;
    if (element == null) {
      return;
    }
    const at = motionNow();
    const mine = ++generationRef.current;
    const height = element.offsetHeight;
    const children = Array.from(element.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    const justMounted = !before.shown;
    // The rows after the group in the tree, and the page content below the
    // tree (unless the app keeps it still); kept as they are while a motion
    // runs, so a toggle mid-motion retargets the same elements.
    const tree = element.closest<HTMLElement>('[role="tree"]');
    const rows =
      justMounted || !inFlightRef.current
        ? [
            ...rowsAfter(element),
            ...(followingContent === 'moves' && tree != null
              ? contentBelow(tree)
              : []),
          ]
        : movedRef.current.rows;
    movedRef.current = {rows, height};
    inFlightRef.current = true;
    // The clip: the group's own box, whose top edge is the parent row's
    // bottom, for the length of the motion.
    element.style.overflow = 'clip';

    const glyph = chevronOf(element);
    if (glyph != null) {
      // The class switch just turned the glyph's CSS transform a quarter
      // turn; start the additive turn from where it was and spring it home.
      const sign = getComputedStyle(glyph).direction === 'rtl' ? -1 : 1;
      void springHome(
        glyph,
        'rotate',
        (isExpanded ? -QUARTER_TURN : QUARTER_TURN) * sign,
        SPRING,
        at,
      ).then(arrived => {
        if (arrived && generationRef.current === mine) {
          releaseMotion(glyph, 'rotate');
        }
      });
    }

    if (isExpanded) {
      // Out from under the parent: the block starts its own height up, the
      // rows below start where they were before the children took space.
      const block = children.map(async child =>
        justMounted
          ? springHome(child, 'y', -height, SPRING, at)
          : springTo(child, 0, SPRING, at),
      );
      for (const row of rows) {
        void (justMounted
          ? springHome(row, 'y', -height, SPRING, at)
          : springTo(row, 0, SPRING, at));
      }
      void Promise.all(block).then(results => {
        if (generationRef.current !== mine || results.some(done => !done)) {
          return;
        }
        element.style.removeProperty('overflow');
        for (const child of children) {
          releaseMotion(child, 'translate');
        }
        for (const row of rows) {
          releaseMotion(row, 'translate');
        }
        inFlightRef.current = false;
      });
      return;
    }

    // Back under the parent; the rows below follow the block's bottom edge.
    const block = children.map(async child =>
      springTo(child, -height, SPRING, at),
    );
    for (const row of rows) {
      void springTo(row, -height, SPRING, at);
    }
    void Promise.all(block).then(results => {
      if (generationRef.current !== mine || results.some(done => !done)) {
        return;
      }
      for (const child of children) {
        releaseMotion(child, 'translate');
      }
      element.style.removeProperty('overflow');
      setShown(false);
    });
  }, [isExpanded, shown, animates, followingContent]);

  const groupRef = useCallback((element: HTMLUListElement | null) => {
    groupElementRef.current = element;
  }, []);
  return {showsChildren: shown, groupRef};
}
