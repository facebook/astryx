// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListUpdateMotion.ts
 * @input A List's element, whether it animates its changes, the touch
 *   presentation (utils/touchPresentation.ts), the row moves of
 *   utils/rowMotion.ts and the table spring (motion/uikit/list.ts), resolved
 *   under the list's theme for the fades timed on it (resolveMotion)
 * @output `useListUpdateMotion`: after every commit that inserts, removes or
 *   reorders rows, the rows that stay slide from where they were to where
 *   they are, and inserted rows fade in once the rows crossing them have
 *   cleared, the way a UIKit table animates its updates; a row crossing rows
 *   that move the other way carries `TRAVELLING_ATTRIBUTE` for its slide
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
 * fades in on the same spring's clock (UIKit's `.fade` row animation). A
 * UIKit cell is opaque: a cell sliding over an inserted one hides it, and a
 * moved cell passes over its neighbours. Rows here have no background, so a
 * new row shows nothing until the rows crossing its band have carried their
 * labels half a row past its own, then fades in, arriving with them; and a
 * row sliding across rows that move the other way (the less common way, up
 * on a tie) rides above them for its slide with the list's surface behind it
 * (List/ListItem.tsx paints it). A removed row leaves with
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
import type {MotionCurve} from '../motion/animator';
import {resolveMotion} from '../motion/resolveMotion';
import {solveSpring, toSpring, type SpringCurve} from '../motion/spring';
import {list} from '../motion/uikit/list';
import {
  contentBelow,
  motionNow,
  motionOf,
  playRow,
  presentation,
  releaseMotion,
  springHome,
} from './rowMotion';
import {observeResize} from './sharedResizeObserver';
import {useMotionPresentation} from './touchPresentation';

const SPRING = list.update.tableSpring;

/** Moves under half a pixel are layout noise, not updates. */
const MIN_MOVE_PX = 0.5;

/**
 * Written on a row that slides across rows moving the other way, for the
 * length of its slide: it rides above them with the list's surface behind it
 * (List/ListItem.tsx), as a UIKit cell, opaque and on top, passes over its
 * neighbours. Rows here have no background of their own.
 */
export const TRAVELLING_ATTRIBUTE = 'data-astryx-travelling';

/** One row's slide in a commit: where its box was and is, inside the list. */
interface Slide {
  readonly row: HTMLElement;
  readonly from: number;
  readonly to: number;
  readonly height: number;
}

/**
 * The progress of the update spring (0 → 1) at which a row that just
 * appeared at `top` may start to fade in: once every row sliding across its
 * band has carried its label more than half a row past the new row's label,
 * so the two labels never overlap. (A UIKit cell sliding over an inserted
 * one hides it with its opaque background; rows here have none.)
 */
function clearedAt(
  top: number,
  height: number,
  slides: ReadonlyArray<Slide>,
): number {
  const center = top + height / 2;
  let cleared = 0;
  for (const slide of slides) {
    const distance = slide.to - slide.from;
    const start = slide.from + slide.height / 2;
    // Label centers half a row apart: the labels no longer overlap.
    const apart = (height + slide.height) / 4;
    const [enters, leaves] =
      distance > 0
        ? [
            (center - apart - start) / distance,
            (center + apart - start) / distance,
          ]
        : [
            (start - center - apart) / -distance,
            (start - center + apart) / -distance,
          ];
    if (enters < 1 && leaves > 0) {
      cleared = Math.max(cleared, Math.min(1, leaves));
    }
  }
  return cleared;
}

/**
 * A new row's fade on the update spring's clock: it holds `from` until the
 * spring's progress reaches `after` (the rows crossing its band have cleared
 * it), then follows the progress to 1, arriving with the rows around it.
 */
function fadeIn(
  from: number,
  progress: SpringCurve,
  duration: number,
  after: number,
): MotionCurve {
  // Always leave the fade a tenth of the way to run.
  const begin = Math.min(after, 0.9);
  const at = (t: number) => {
    if (t >= duration) {
      return 1;
    }
    const p = progress.value(Math.max(0, t));
    return (
      from + (1 - from) * Math.min(1, Math.max(0, (p - begin) / (1 - begin)))
    );
  };
  return {
    duration,
    at,
    velocity: t => {
      const step = 1e-3;
      const t0 = Math.max(0, t - step);
      return (at(t + step) - at(t0)) / (t + step - t0);
    },
  };
}

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
    const slides: Slide[] = [];
    const entering: HTMLElement[] = [];
    for (const row of rows) {
      const now = places.get(row) ?? 0;
      const was = before.get(row);
      if (was == null) {
        entering.push(row);
      } else if (Math.abs(was - now) >= MIN_MOVE_PX) {
        slides.push({row, from: was, to: now, height: row.offsetHeight});
      }
    }
    // Rows sliding both ways cross each other: the rows moving the less
    // common way (up, on a tie) ride above the rest for their slide.
    const up = slides.filter(slide => slide.to < slide.from);
    const down = slides.filter(slide => slide.to > slide.from);
    const travelling = new Set(
      up.length > 0 && down.length > 0
        ? up.length <= down.length
          ? up
          : down
        : [],
    );
    for (const slide of slides) {
      const {row} = slide;
      const rides = travelling.has(slide);
      if (rides) {
        row.setAttribute(TRAVELLING_ATTRIBUTE, '');
      }
      void springHome(row, 'y', slide.from - slide.to, SPRING, at).then(
        arrived => {
          if (arrived) {
            releaseMotion(row, 'translate');
          }
          if (rides && motionOf(row, 'y') == null) {
            row.removeAttribute(TRAVELLING_ATTRIBUTE);
          }
        },
      );
    }
    if (entering.length > 0) {
      // The spring the slides run under this list's theme: new rows time
      // their fade on its progress.
      const progress = solveSpring(toSpring(resolveMotion(element, SPRING)), {
        from: 0,
        to: 1,
      });
      const duration = progress.settleTime(0.001);
      for (const row of entering) {
        // New: from the opacity it has (0 when new), once the rows crossing
        // its band have cleared it.
        const from = presentation(row, 'opacity', at);
        const start = from >= 1 ? 0 : from;
        const after = clearedAt(places.get(row) ?? 0, row.offsetHeight, slides);
        // From rest it starts with the slides, when the browser commits
        // them; a fade already running continues from the frame on screen.
        void playRow(
          row,
          'opacity',
          fadeIn(start, progress, duration, after),
          SPRING,
          motionOf(row, 'opacity') == null ? undefined : at,
        ).finished.then(arrived => {
          if (arrived) {
            releaseMotion(row, 'opacity');
          }
        });
      }
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
