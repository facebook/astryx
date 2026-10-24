// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListUpdateMotion.ts
 * @input A List's element, whether it animates its changes, the touch
 *   presentation (utils/touchPresentation.ts), the row moves of
 *   utils/rowMotion.ts and the table spring (motion/uikit/list.ts)
 * @output `useListUpdateMotion`: after every commit that inserts, removes or
 *   reorders rows, the rows that stay slide from where they were to where
 *   they are, and inserted rows fade in, the way a UIKit table animates its
 *   updates
 * @position Internal interaction utility for any list root whose direct
 *   children are its rows; List calls it with `hasAnimatedChanges`
 *
 * UIKit's reference (iOS 26.2): a table's insert, delete, move and reload
 * animations and its batch updates all run on one critically damped spring
 * (`list.update.tableSpring`, response 0.3 s). After a delete the rows below
 * start where they were and slide up into the gap; after a swipe-to-delete
 * the swiped row is already off screen and only the rows below move.
 *
 * HOW IT RUNS, compositor only. After each commit the rows' layout positions
 * are read once (`offsetTop` inside the list, which ignores transforms) and
 * compared with the previous commit's (read again whenever the list's box
 * resizes in between, so a layout change no commit made never leaves them
 * stale): a row that moved is put back with an
 * inverse `translate` in the same frame and springs home; a row that is new
 * fades in on the same spring (UIKit's `.fade` row animation: rows here
 * have no opaque background to slide from under). A removed row leaves with
 * its commit; nothing is ever written on it. A row moved again mid-motion
 * keeps its velocity, and its curve: a layout shift never changes a running
 * motion's spring (a reorder's drop settles on its own), so the table spring
 * applies to rows at rest. Page content below the list moves by the list's
 * change in height on the same spring (utils/rowMotion.ts `contentBelow`),
 * unless the list is told to keep it still.
 *
 * It runs in the iOS idiom only (useMotionPresentation: a finger on WebKit
 * for iOS). With an Android finger (Android's list animations are its own)
 * or a mouse (the theme's presentation) nothing moves. A list root that
 * carries `data-astryx-reordering` (a drag session in progress) is left to
 * the reorder: its rows' places are remembered, nothing is moved.
 *
 * SYNC: When modified, update List/List.tsx and
 * List/__tests__/ListUpdates.interaction.browser.spec.ts.
 */

import {useRef, type RefObject} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {list} from '../motion/uikit/list';
import {
  contentBelow,
  motionNow,
  presentation,
  releaseMotion,
  springHome,
} from '../utils/rowMotion';
import {observeResize} from '../utils/sharedResizeObserver';
import {useMotionPresentation} from '../utils/touchPresentation';

const SPRING = list.update.tableSpring;

/** Moves under half a pixel are layout noise, not updates. */
const MIN_MOVE_PX = 0.5;

function rowsOf(element: HTMLElement): HTMLElement[] {
  return Array.from(element.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
}

/** The rows, each row's layout position inside the list, the list's height. */
function readLayout(element: HTMLElement): {
  rows: HTMLElement[];
  places: WeakMap<HTMLElement, number>;
  height: number;
} {
  const rows = rowsOf(element);
  const places = new WeakMap<HTMLElement, number>();
  for (const row of rows) {
    // Inside the list: content above it changing size moves no row.
    const base = row.offsetParent === element ? 0 : element.offsetTop;
    places.set(row, row.offsetTop - base);
  }
  return {rows, places, height: element.offsetHeight};
}

export function useListUpdateMotion(
  listRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  followingContent: 'moves' | 'stays' = 'moves',
): void {
  const animates = useMotionPresentation() === 'uikit' && enabled;
  /**
   * Each row's layout position after the previous commit, or after the last
   * resize of the list since.
   */
  const placesRef = useRef<WeakMap<HTMLElement, number> | null>(null);
  /** The list's layout height, kept the same way. */
  const heightRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const element = listRef.current;
    if (element == null) {
      return;
    }
    const {rows, places, height} = readLayout(element);
    const before = placesRef.current;
    placesRef.current = places;
    const grew = height - heightRef.current;
    heightRef.current = height;
    // The first commit, motion off, or a reorder session that owns the rows:
    // remember where rows are, move nothing.
    if (
      before == null ||
      !animates ||
      element.hasAttribute('data-astryx-reordering')
    ) {
      return;
    }
    const at = motionNow();
    for (const row of rows) {
      const now = places.get(row) ?? 0;
      const was = before.get(row);
      if (was == null) {
        // New: fade in where it lands, from the opacity it has (0 when new).
        const from = presentation(row, 'opacity', at);
        const start = from >= 1 ? 0 : from;
        void springHome(row, 'opacity', start - 1, SPRING, at).then(arrived => {
          if (arrived) {
            releaseMotion(row, 'opacity');
          }
        });
        continue;
      }
      const moved = was - now;
      if (Math.abs(moved) < MIN_MOVE_PX) {
        continue;
      }
      void springHome(row, 'y', moved, SPRING, at).then(arrived => {
        if (arrived) {
          releaseMotion(row, 'translate');
        }
      });
    }
    // What layout moved below the list moves back and comes along.
    if (followingContent === 'moves' && Math.abs(grew) >= MIN_MOVE_PX) {
      for (const below of contentBelow(element)) {
        void springHome(below, 'y', -grew, SPRING, at).then(arrived => {
          if (arrived) {
            releaseMotion(below, 'translate');
          }
        });
      }
    }
  });

  // Layout that changes with no commit (a web font arriving, a rotation that
  // rewraps rows, a stylesheet or theme changing row heights, a row resizing
  // itself) would leave the places above stale, and the next update would
  // start its rows from where they no longer were: read them again whenever
  // the list's box changes size.
  useIsomorphicLayoutEffect(() => {
    const element = listRef.current;
    if (element == null) {
      return;
    }
    return observeResize(element, () => {
      if (placesRef.current == null) {
        return;
      }
      const {places, height} = readLayout(element);
      placesRef.current = places;
      heightRef.current = height;
    });
  }, [listRef]);
}
