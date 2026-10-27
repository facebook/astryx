// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSiblingActionTracking.ts
 * @input A ref to the element holding a row of sibling Buttons, and whether
 *   tracking is on
 * @output Exports useSiblingActionTracking and SIBLING_ACTION_SELECTOR
 * @position Internal hook (not exported from the hooks entry) for the
 *   members of family:action-groups whose group is a plain row of Buttons:
 *   Toolbar's buttons and the action rows of Banner and Toast. It only
 *   configures useActionGroupTracking, the one driver of actionGroupTracker.
 *
 * A row of sibling actions tracks a held pointer as one group
 * (family:action-groups FR1–FR3): the enabled action under the pointer is lit
 * as soon as it lands, the highlight follows it across the row, and the lift
 * runs the action under it, through that action's own click, or nothing
 * outside the row. Every web pointer is tracked, mouse and pen as well as a
 * finger (FR5); keyboard and assistive-technology activation never reach the
 * recognizer and are unchanged.
 *
 * - The actions are the row's Buttons and ToggleButtons, by their stable
 *   classes, so a field in the row (a toolbar's TextInput, NumberInput or
 *   Selector) is skipped along with its own inner buttons (clear, steppers,
 *   the Selector's trigger).
 * - A press that starts on a field, or inside a popover the row opened, is
 *   left alone: the field keeps its caret and selection, the popover its own
 *   press.
 * - Only a row of two or more actions tracks (family:action-groups adoption
 *   table); a single action keeps the browser's own click.
 * - Under a coarse pointer each action's hit area grows toward 44px (FR5),
 *   each side capped at half the gap to its neighbour so no area takes from
 *   another (utils/hitArea.ts). Nothing changes visually, and a fine pointer
 *   keeps the actions' own bounds.
 *
 * SYNC: When modified, update useSiblingActionTracking.test.tsx
 */

import type {RefObject} from 'react';
import {stableClassName} from '../naming';
import {COARSE_POINTER_QUERY} from '../utils/coarsePointer';
import {resolveHitTarget} from '../utils/hitArea';
import type {ActionGroupTarget} from './actionGroupTracker';
import {useActionGroupTracking} from './useActionGroupTracking';
import {useMediaQuery} from './useMediaQuery';

const BUTTON = `.${stableClassName('button')}`;
const TOGGLE_BUTTON = `.${stableClassName('toggle-button')}`;

/**
 * The row's actions: its Buttons and ToggleButtons, by their stable classes,
 * but not those in a popover the row opened (`:scope` is the row).
 */
export const SIBLING_ACTION_SELECTOR = `${BUTTON}:not(:scope [popover] *), ${TOGGLE_BUTTON}:not(:scope [popover] *)`;

/** A press that starts here belongs to a field or a popover, not the row. */
const NOT_THE_ROW =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"], [popover]';

/**
 * Which action a coarse pointer's point is on: each action's hit area grows
 * toward 44 px, each side capped at half the gap to its neighbour, so no area
 * takes from another (utils/hitArea.ts, family:action-groups FR5).
 */
function coarseTarget(
  x: number,
  y: number,
  actions: ReadonlyArray<ActionGroupTarget>,
): HTMLElement | null {
  return actions[resolveHitTarget(x, y, actions)]?.element ?? null;
}

export interface SiblingActionTrackingOptions {
  /** Off, nothing is attached. @default true */
  isEnabled?: boolean;
  /**
   * Let the gesture host write the hold's permanent styles on the row (no
   * text selection or callout for any pointer). Pass false when the row
   * holds a field, so a mouse can still select its text. @default true
   */
  manageStyle?: boolean;
  /**
   * Read when a press begins: when true, the press is taken but lights and
   * runs nothing (a disabled group). @default never
   */
  isInert?: () => boolean;
}

/**
 * Track a held pointer across the row of sibling actions behind `ref`.
 */
export function useSiblingActionTracking(
  ref: RefObject<HTMLElement | null>,
  {
    isEnabled = true,
    manageStyle = true,
    isInert,
  }: SiblingActionTrackingOptions = {},
): void {
  const isCoarse = useMediaQuery(COARSE_POINTER_QUERY);
  useActionGroupTracking(ref, {
    itemSelector: SIBLING_ACTION_SELECTOR,
    // A plain row has no measured onset or margin: the action lands lit.
    highlightOnsetMs: 0,
    highlightExpansion: 0,
    // A fine pointer keeps the actions' own bounds.
    resolveTarget: isCoarse ? coarseTarget : undefined,
    pointerTypes: ['touch', 'pen', 'mouse'],
    shouldTrack: target => shouldTrackRow(ref.current, target),
    isInert,
    isEnabled,
    manageStyle,
  });
}

/** Whether a press on `target` starts tracking the row in `root`. */
function shouldTrackRow(root: HTMLElement | null, target: unknown): boolean {
  if (root == null) {
    return false;
  }
  const owner =
    typeof Element !== 'undefined' && target instanceof Element
      ? target.closest(NOT_THE_ROW)
      : null;
  // A field or popover around the whole row (a toolbar in a popover) is not
  // one the press started on.
  if (owner != null && root.contains(owner)) {
    return false;
  }
  return root.querySelectorAll(SIBLING_ACTION_SELECTOR).length >= 2;
}
