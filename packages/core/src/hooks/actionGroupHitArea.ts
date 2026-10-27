// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file actionGroupHitArea.ts
 * @input A group of sibling actions tracked by useActionGroupTracking, and the
 *   shared touch hit area (utils/hitArea.ts)
 * @output Exports resolveGroupHitTarget, isGroupLaidOut, useActionGroupHitArea
 *   and actionGroupHitAreaStyles: the 44 px touch target of an action group
 *   (`family:action-groups` FR5)
 * @position Internal (not exported from the hooks entry): consumed by the
 *   groups that track a held pointer across their buttons (ButtonGroup)
 *
 * Under a coarse primary pointer an action group's buttons reach a 44 px
 * target without growing: the group carries an invisible hit layer that
 * extends past its edges, stopping at half the gap to whatever sits outside it
 * (utils/hitArea.ts measures and writes the insets), so a finger just past a
 * small button still lands on the group; its tracker then picks the nearest
 * button, and adjacent buttons split at their shared edge. Under a fine
 * pointer there is no layer and only a button's own box counts.
 *
 * SYNC: When modified, update ButtonGroup/ButtonGroupTracking.test.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {useEffect, type RefObject} from 'react';
import {isCoarsePointer} from '../utils/coarsePointer';
import {resolveHitTarget, watchHitArea, writeHitInsets} from '../utils/hitArea';
import type {ActionGroupTarget} from './actionGroupTracker';

/**
 * The action a pointer at (x, y) is on, from the enabled actions measured
 * when the press began: the nearest action whose target, grown toward 44 px,
 * holds the point under a coarse primary pointer; only an action's own box
 * under a fine one. A `resolveTarget` for useActionGroupTracking.
 */
export function resolveGroupHitTarget(
  x: number,
  y: number,
  targets: ReadonlyArray<ActionGroupTarget>,
): HTMLElement | null {
  // An action with no box (not laid out) is under no pointer.
  const laidOut = targets.filter(
    target => target.right > target.left && target.bottom > target.top,
  );
  if (laidOut.length === 0) {
    return null;
  }
  if (isCoarsePointer(laidOut[0].element.ownerDocument.defaultView)) {
    const index = resolveHitTarget(x, y, laidOut);
    return index === -1 ? null : laidOut[index].element;
  }
  for (const target of laidOut) {
    if (
      x >= target.left &&
      x <= target.right &&
      y >= target.top &&
      y <= target.bottom
    ) {
      return target.element;
    }
  }
  return null;
}

/**
 * Whether the group has a box to press: a group that is not laid out (no
 * layout engine, or not rendered) tracks nothing, so its buttons keep their
 * own clicks. A `shouldTrack` for useActionGroupTracking, read once as a
 * press begins.
 */
export function isGroupLaidOut(group: Element | null): boolean {
  if (group == null) {
    return false;
  }
  const box = group.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}

/**
 * Keeps the group's hit-layer insets live while it tracks; hitArea.ts
 * measures only where the primary pointer is coarse, and writes 0 elsewhere.
 */
export function useActionGroupHitArea(
  ref: RefObject<HTMLElement | null>,
  isEnabled: boolean,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!isEnabled || element == null) {
      return undefined;
    }
    return watchHitArea(element, insets => writeHitInsets(element, insets));
  }, [ref, isEnabled]);
}

export const actionGroupHitAreaStyles = stylex.create({
  /**
   * The group's invisible hit layer: under the buttons, in the group's own
   * stacking context, present only under a coarse pointer. The custom
   * property names are hitArea.ts's HIT_INSET_PROPERTIES.
   */
  hitArea: {
    position: {default: null, '@media (pointer: coarse)': 'relative'},
    isolation: {default: null, '@media (pointer: coarse)': 'isolate'},
    '::after': {
      content: {default: null, '@media (pointer: coarse)': '""'},
      position: 'absolute',
      // Physical sides, as hitArea.ts measures them in client pixels.
      inset:
        'calc(var(--astryx-hit-inset-top, 0px) * -1) calc(var(--astryx-hit-inset-right, 0px) * -1) calc(var(--astryx-hit-inset-bottom, 0px) * -1) calc(var(--astryx-hit-inset-left, 0px) * -1)',
      zIndex: -1,
    },
  },
});
