// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTreeExpansionMotion.ts
 * @input A tree row's expanded state, the touch presentation
 *   (utils/touchPresentation.ts), the motion foundation's animator and the
 *   outline spring from the UIKit constants table (motion/uikit/list.ts)
 * @output `useTreeExpansionMotion`: whether a row renders its children, the
 *   ref its group attaches, and the expand and collapse played the way a UIKit
 *   outline list plays them, under any finger (useTouchPresentation: a
 *   coarse primary pointer, iOS and Android alike); with a mouse the
 *   children come and go in one frame, as before
 * @position TreeList internals; TreeListItem calls it for every row with
 *   children
 *
 * UIKit's reference (iOS 26.2, a UICollectionView list with outline
 * disclosure): on expand, the children slide down out from under the parent
 * as one block; the disclosure chevron turns 90°; both on one critically
 * damped spring (`list.update.outlineSpring`, an internal constant), with no
 * fade. Collapse runs the same motion back: the children slide up under the
 * parent and leave when it ends.
 *
 * HOW IT RUNS, compositor only. The group keeps its final layout; it clips its
 * own box for the length of the motion, so its top edge (the parent row's
 * bottom) is the clip's edge, and its children translate as one block from
 * the group's height above it. The chevron turns by an additive `rotate`
 * over its final CSS transform. Both are played by the animator on the
 * compositor, retargeted from the value on screen when the row is toggled
 * again mid-motion, and each releases its inline value when its own spring
 * arrives. A collapse keeps the children rendered until the block has slid
 * away, then the commit removes them.
 *
 * Nothing outside the group moves: with no animated layout handle, the rows
 * after the group and the content after the tree take their new places at
 * once, by layout, at the commit that inserts or removes the group
 * (`spec:AST-105` FR2; `spec:AST-094` FR5 forbids animating layout). An
 * unmount mid-motion leaves nothing moved.
 *
 * Under reduced motion nothing travels (`design:reduced-motion`): every part
 * takes the animator's own Reduced Motion handling, so the children fade in
 * where they land and fade out where they are, and the chevron cross-fades
 * into place.
 *
 * One touch model: an Android finger gets the same motion as an iOS one.
 * With a mouse (the theme's presentation) nothing moves: the children appear
 * and leave at once, as before. Leaving children are inert while they slide
 * away: focus, arrow keys and assistive technology skip them.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TreeList/TreeListItem.tsx
 * - /packages/core/src/TreeList/__tests__/TreeListExpand.interaction.browser.spec.ts
 */

import {useCallback, useRef, useState} from 'react';
import {isRtlElement} from '../hooks/isRtlElement';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {list} from '../motion/uikit/list';
import {
  animatorFor,
  motionNow,
  releaseMotion,
  springHome,
  springTo,
} from '../utils/rowMotion';
import {useTouchPresentation} from '../utils/touchPresentation';

const SPRING = list.update.outlineSpring;
/** The chevron turns a quarter turn between collapsed and expanded. */
const QUARTER_TURN = 90;

/**
 * When `element`'s `y` comes within half a pixel of `target` on its running
 * curve (document timeline, ms), sampled every 4 ms from `from`; null when it
 * does not within 3 s.
 */
function clipTime(
  element: HTMLElement,
  target: number,
  from: number,
): number | null {
  const animator = animatorFor(element);
  for (let time = from; time <= from + 3000; time += 4) {
    if (Math.abs(animator.get('y', time) - target) <= 0.5) {
      return time;
    }
  }
  return null;
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
  {isEnabled = true}: {isEnabled?: boolean} = {},
): TreeExpansionMotion {
  // Off while the tree holds an animated-layout handle: the handle then
  // plays the group's motion under every pointer (`component:TreeList` FR8).
  const animates = useTouchPresentation().isTouch && isEnabled;
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
  /** The collapse's removal, timed for the frame its block is clipped. */
  const leaveTimerRef = useRef<number | null>(null);
  // External system (`architecture:react-component-runtime` INV3): the shared
  // motion animators (utils/rowMotion.ts) of the group's rows and of the
  // chevron. A toggle starts them and a toggle mid-motion retargets them;
  // the commit that removes the children takes the group's rows with it.
  useIsomorphicLayoutEffect(() => {
    const before = previousRef.current;
    previousRef.current = {isExpanded, shown};

    if (before.shown && !shown) {
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
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    const height = element.offsetHeight;
    const children = Array.from(element.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    const justMounted = !before.shown;
    // The clip: the group's own box, whose top edge is the parent row's
    // bottom, for the length of the motion.
    element.style.overflow = 'clip';

    const glyph = chevronOf(element);
    if (glyph != null) {
      // The class switch just turned the glyph's CSS transform a quarter
      // turn; start the additive turn from where it was and spring it home.
      const sign = isRtlElement(glyph) ? -1 : 1;
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

    // Each element is released from its own motion's arrival: by then this
    // module no longer tracks it, so its inline `translate` clears.
    const releaseOnArrival = (target: HTMLElement) => (arrived: boolean) => {
      if (arrived && generationRef.current === mine) {
        releaseMotion(target, 'translate');
      }
    };
    if (isExpanded) {
      // Out from under the parent: the block starts its own height up.
      // Under reduced motion the children fade in where they land.
      const block = children.map(async child => {
        const arrived = await (justMounted
          ? springHome(child, 'y', -height, SPRING, at, 'entrance')
          : springTo(child, 0, SPRING, at, 'entrance'));
        releaseOnArrival(child)(arrived);
        return arrived;
      });
      void Promise.all(block).then(results => {
        if (generationRef.current !== mine || results.some(done => !done)) {
          return;
        }
        element.style.removeProperty('overflow');
      });
      return;
    }

    // Back under the parent. Under reduced motion the children fade out
    // where they are.
    const block = children.map(async child =>
      springTo(child, -height, SPRING, at, 'exit'),
    );
    // The group leaves the frame its block is fully clipped (within half a
    // pixel of the group's height above its top edge), not when the spring
    // settles: nothing of it shows from then on, so the rows below take
    // their places at once with no empty band (`spec:AST-105` FR2). Under
    // reduced motion the block fades where it is, and the group leaves when
    // the fade ends.
    const lead = children[0];
    const clippedAt =
      lead != null && animatorFor(lead).reducedMotion() === 'off'
        ? clipTime(lead, -height, at)
        : null;
    if (clippedAt != null) {
      leaveTimerRef.current = window.setTimeout(
        () => {
          leaveTimerRef.current = null;
          if (generationRef.current === mine) {
            setShown(false);
          }
        },
        Math.max(0, clippedAt - motionNow()),
      );
      return;
    }
    void Promise.all(block).then(results => {
      if (generationRef.current !== mine || results.some(done => !done)) {
        return;
      }
      // The children sit a group's height up, hidden by the clip, until the
      // commit that removes them takes the group away with them: dropping
      // the clip first would show them over the parent row for a frame.
      setShown(false);
    });
  }, [isExpanded, shown, animates]);

  // External system (`architecture:react-component-runtime` INV3): the
  // group's clip, which the effect above sets on an element this row renders.
  // An unmount mid-motion clears it and makes any pending arrival moot.
  useIsomorphicLayoutEffect(
    () => () => {
      generationRef.current += 1;
      if (leaveTimerRef.current != null) {
        window.clearTimeout(leaveTimerRef.current);
      }
      groupElementRef.current?.style.removeProperty('overflow');
    },
    [],
  );

  const groupRef = useCallback((element: HTMLUListElement | null) => {
    groupElementRef.current = element;
  }, []);
  return {showsChildren: shown, groupRef};
}
