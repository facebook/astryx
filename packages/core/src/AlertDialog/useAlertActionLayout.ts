// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAlertActionLayout.ts
 * @input The row element holding the alert's actions, their selector and
 *   labels, and whether the viewport is compact; the shared resize observer
 * @output Exports useAlertActionLayout and resolveAlertActionLayout: whether
 *   an alert's two actions share a row or stack
 * @position Internal hook of AlertDialog: its compact action layout
 *
 * UIKit lays an alert's two actions out in a row, Cancel on the leading side,
 * when each title fits its own half of the row on one line, and stacks them,
 * Cancel at the bottom, when one does not: per title, never the sum (measured
 * on iOS 26.2; `alertController.actions.rowShare`). Under a finger on a
 * compact viewport, AlertDialog does the same (the caller passes `isCompact`
 * only then); with a mouse it keeps its own layout.
 *
 * The decision reads layout only when something it depends on changes size:
 * the row's width (a rotation, a resize) or a label's width (a font that
 * finishes loading, a new label). It reads each label's own single-line width,
 * which the button's current width does not change, so a flip never feeds
 * back into the next decision. Before the first measurement (and on the
 * server) a compact alert stacks, as it did before it measured anything; a
 * dialog's first open is decided by the observer, which reports between
 * layout and paint, so its opening frame already paints the decision.
 *
 * SYNC: When modified, update useAlertActionLayout.test.tsx and
 * __tests__/AlertDialog.layout.interaction.browser.spec.ts
 */

import {useState, type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {alertController} from '../motion/uikit/alert';
import {observeResize} from '../utils/sharedResizeObserver';

/** How an alert's actions are laid out. */
export type AlertActionLayout = 'row' | 'stack';

export interface AlertActionMeasure {
  /** Width of the row the actions share, px. */
  readonly available: number;
  /** Gap between two actions in a row, px. */
  readonly gap: number;
  /** Width each action needs to show its label on one line, px. */
  readonly widths: ReadonlyArray<number>;
}

/**
 * UIKit's rule (`alertController.actions.rowShare`): two actions share a row
 * when each one fits its own share of it on one line, and stack otherwise;
 * three or more always stack; one fills the row.
 */
export function resolveAlertActionLayout({
  available,
  gap,
  widths,
}: AlertActionMeasure): AlertActionLayout {
  if (widths.length <= 1) {
    return 'row';
  }
  if (widths.length > 2) {
    return 'stack';
  }
  const share = (available - gap) * alertController.actions.rowShare;
  return widths.every(width => width <= share) ? 'row' : 'stack';
}

export interface AlertActionLayoutOptions {
  /** The compact layout applies (a compact viewport). */
  isCompact: boolean;
  /** Selects the actions inside the row. */
  itemSelector: string;
  /** The actions' labels; a change re-measures. */
  labels: ReadonlyArray<string>;
}

export function useAlertActionLayout(
  rowRef: RefObject<HTMLElement | null>,
  {isCompact, itemSelector, labels}: AlertActionLayoutOptions,
): AlertActionLayout {
  const [layout, setLayout] = useState<AlertActionLayout>('stack');
  const labelKey = labels.join('\u0000');

  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    if (!isCompact || row == null) {
      return;
    }
    const actions = [...row.querySelectorAll<HTMLElement>(itemSelector)];
    const measure = (): AlertActionLayout | null => {
      const available = row.clientWidth;
      // Not laid out (a closed dialog is not rendered): keep the decision.
      if (available <= 0) {
        return null;
      }
      return resolveAlertActionLayout({
        available,
        gap: gapOf(row),
        widths: actions.map(requiredWidth),
      });
    };
    const onResize = () => {
      const next = measure();
      if (next == null) {
        return;
      }
      // The observer reports after layout and before paint (the first open
      // of the dialog, a rotation, a font that finishes loading); committing
      // the decision here settles the layout in that same frame, so no frame
      // paints the layout it is about to correct (layer-runtime INV12).
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the opening frame must paint the decided layout, and the observer runs between layout and paint
      flushSync(() => {
        setLayout(next);
      });
    };
    const labelsShown = actions
      .map(labelElementOf)
      .filter((element): element is HTMLElement => element != null);
    const stops = [row, ...labelsShown].map(element =>
      observeResize(element, onResize),
    );
    const initial = measure();
    if (initial != null) {
      // eslint-disable-next-line @eslint-react/set-state-in-effect -- the layout is decided from a measurement, before the first paint
      setLayout(initial);
    }
    return () => {
      for (const stop of stops) {
        stop();
      }
    };
  }, [isCompact, itemSelector, labelKey, rowRef]);

  return isCompact ? layout : 'row';
}

/** The row's gap between two actions, px. */
function gapOf(row: HTMLElement): number {
  const style = getComputedStyle(row);
  const gap = parseFloat(style.columnGap);
  return Number.isFinite(gap) ? gap : parseFloat(style.rowGap) || 0;
}

/**
 * The element holding an action's visible label: the deepest one whose text
 * is the whole label (its text clips with an ellipsis, so its scroll width is
 * the label's full single-line width).
 */
function labelElementOf(action: HTMLElement): HTMLElement | null {
  const label = action.textContent?.trim() ?? '';
  let found: HTMLElement | null = null;
  const walk = (element: HTMLElement) => {
    for (const child of element.children) {
      if (child instanceof HTMLElement && child.textContent?.trim() === label) {
        found = child;
        walk(child);
        return;
      }
    }
  };
  walk(action);
  return found;
}

/** The width an action needs to show its label on one line, px. */
function requiredWidth(action: HTMLElement): number {
  const style = getComputedStyle(action);
  const chrome =
    (parseFloat(style.paddingLeft) || 0) +
    (parseFloat(style.paddingRight) || 0) +
    (parseFloat(style.borderLeftWidth) || 0) +
    (parseFloat(style.borderRightWidth) || 0);
  const label = labelElementOf(action);
  return (label?.scrollWidth ?? action.scrollWidth) + chrome;
}
