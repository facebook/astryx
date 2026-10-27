// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTabBarLens.ts
 * @input The TabBar's capsule element, its item count, the selected index
 *   and whether a finger drives the bar; core's compositor animator
 *   (`@astryxdesign/core/motion`), the UIKit tab-bar table and
 *   tabBarModel.ts
 * @output Exports useTabBarLens: under a finger, the lens's slide on UIKit's
 *   spring, the refs TabBar puts on the lens's body and its copy of the
 *   items, and whether that copy is drawn (only while the lens travels)
 * @position Part of TabBar's touch layer (TabBarTouch.ts)
 *
 * Under a finger the lens's resting place is CSS (it jumps to the new item
 * in this frame); the body inside it starts where the lens was on screen and
 * springs to rest (`tabBar.lensTravel`), moving as it was. While it travels,
 * the selected look rides inside it: a copy of the items, counter-moving so
 * it stays over them, so an item half under the lens is half tinted. Once
 * the lens rests, the copy goes and the selected tab draws its own look
 * again. Under a mouse this hook writes nothing and the copy never mounts:
 * TabBar's CSS slides the lens. Under Reduce Motion the animator cross-fades
 * the move (design:reduced-motion) and nothing travels, so no copy mounts.
 *
 * SYNC: When modified, update TabBar.tsx and
 * __tests__/TabBar.interaction.browser.spec.ts.
 */

import {useLayoutEffect, useRef, useState, type RefObject} from 'react';
import {isRtlElement} from '@astryxdesign/core/internal/touch';
import {
  registerTabBarTable,
  tabBar,
  useAnimator,
} from '@astryxdesign/core/internal/motion';
import {itemCenters} from './tabBarModel';

export interface UseTabBarLensOptions {
  readonly capsuleRef: RefObject<HTMLDivElement | null>;
  readonly count: number;
  readonly selectedIndex: number;
  /** A finger drives the bar (the touch presentation: a coarse pointer). */
  readonly isTouch: boolean;
}

export interface TabBarLens {
  /** The lens's body: its offset from the resting place. */
  readonly body: (element: HTMLElement | null) => void;
  /** The selected copy of the items inside it: counter-moves. */
  readonly copy: (element: HTMLElement | null) => void;
  /**
   * The copy is drawn: the lens is travelling under a finger. At rest the
   * selected tab draws its own look and the copy is not mounted.
   */
  readonly isCopyShown: boolean;
}

export function useTabBarLens({
  capsuleRef,
  count,
  selectedIndex,
  isTouch,
}: UseTabBarLensOptions): TabBarLens {
  // The table's springs become motion roles before this hook's first
  // animation.
  if (isTouch) {
    registerTabBarTable();
  }
  const {ref: bodyRef, animator: body} = useAnimator();
  const {ref: copyRef, animator: copy} = useAnimator();
  // A new selection under a finger starts a slide: the copy mounts in the
  // same commit (adjusted during render, so the frame that moves the lens
  // already draws it) and goes once the slide rests.
  const [isCopyShown, setIsCopyShown] = useState(false);
  const [seenIndex, setSeenIndex] = useState(selectedIndex);
  if (seenIndex !== selectedIndex) {
    setSeenIndex(selectedIndex);
    if (
      isTouch &&
      seenIndex >= 0 &&
      seenIndex < count &&
      selectedIndex >= 0 &&
      body.reducedMotion({}) === 'off'
    ) {
      setIsCopyShown(true);
    }
  }
  const slideRef = useRef(0);
  const previousIndexRef = useRef(selectedIndex);
  useLayoutEffect(() => {
    const from = previousIndexRef.current;
    previousIndexRef.current = selectedIndex;
    const capsule = capsuleRef.current;
    if (
      !isTouch ||
      capsule == null ||
      from === selectedIndex ||
      from < 0 ||
      selectedIndex < 0 ||
      from >= count
    ) {
      return;
    }
    const isRtl = isRtlElement(capsule);
    const centers = itemCenters(capsule.offsetWidth, count, isRtl);
    const now = performance.now();
    const offset = body.get('x', now) + centers[from] - centers[selectedIndex];
    const velocity = body.getVelocity('x', now);
    body.set({x: offset});
    copy.set({x: -offset});
    // From rest, both curves start when the browser commits the frame (with
    // the lens's jump to its new place); a lens already moving continues
    // from now, on one clock for both.
    const options = velocity === 0 ? {} : {at: now};
    body.animate(
      {x: 0},
      {spring: tabBar.lensTravel, velocity: {x: velocity}},
      options,
    );
    copy.animate(
      {x: 0},
      {spring: tabBar.lensTravel, velocity: {x: -velocity}},
      options,
    );
    // The copy goes once this slide, or the one that interrupts it, rests.
    const slide = ++slideRef.current;
    void body.atRest(['x']).then(() => {
      if (slideRef.current === slide) {
        setIsCopyShown(false);
      }
    });
  }, [selectedIndex, count, isTouch, capsuleRef, body, copy]);
  return {body: bodyRef, copy: copyRef, isCopyShown};
}
