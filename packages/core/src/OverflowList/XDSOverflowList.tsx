'use client';

/**
 * @file XDSOverflowList.tsx
 * @input Uses React, StyleX, useOverflow hook
 * @output Exports XDSOverflowList component and XDSOverflowListProps type
 * @position Core implementation; consumed by index.ts
 *
 * Renders a horizontal list of items, hiding those that don't fit in the
 * available width and optionally showing an overflow indicator.
 * Uses a hidden measurement container to avoid flickering.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/OverflowList/index.ts (exports if types change)
 */


import {type ReactNode, type ReactElement, Children} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import type {SpacingStep} from '../utils/types';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useOverflow} from '../hooks/useOverflow';
import {spacingVars} from '../theme/tokens.stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },
  fillParent: {
    width: '100%',
  },
  measureContainer: {
    position: 'absolute',
    visibility: 'hidden',
    height: 0,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  measureIndicator: {
    display: 'inline-flex',
  },
});

const gapStyles = stylex.create({
  0: {gap: spacingVars['--spacing-0']},
  0.5: {gap: spacingVars['--spacing-0-5']},
  1: {gap: spacingVars['--spacing-1']},
  1.5: {gap: spacingVars['--spacing-1-5']},
  2: {gap: spacingVars['--spacing-2']},
  3: {gap: spacingVars['--spacing-3']},
  4: {gap: spacingVars['--spacing-4']},
  5: {gap: spacingVars['--spacing-5']},
  6: {gap: spacingVars['--spacing-6']},
  8: {gap: spacingVars['--spacing-8']},
  10: {gap: spacingVars['--spacing-10']},
});

/**
 * Maps spacing token steps to pixel values for overflow calculations.
 */
const spacingToPx: Record<SpacingStep, number> = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
};

export interface XDSOverflowItem {
  /** The React element for this item */
  child: ReactElement;
  /** The index of this item in the original children list */
  index: number;
}

export interface XDSOverflowListProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the visible container element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * The items to render. Each child should be a single element.
   */
  children: ReactNode;

  /**
   * Gap between items as a spacing token step.
   * Accepts: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10
   * @default 2
   */
  gap?: SpacingStep;

  /**
   * Minimum number of items to always show.
   * @default 0
   */
  minVisibleItems?: number;

  /**
   * Which end to collapse items from.
   * @default 'end'
   */
  collapseFrom?: 'start' | 'end';

  /**
   * Which element to observe for overflow calculations.
   * - `'observeSelf'`: uses the container's own width (default)
   * - `'observeParent'`: observes the parent element's content width
   *   for overflow calculations. This keeps the overflow list
   *   content-sized while still detecting available space for
   *   grow-back. Siblings that don't fit can wrap and be clipped by
   *   the parent's overflow.
   * @default 'observeSelf'
   */
  behavior?: 'observeParent' | 'observeSelf';

  /**
   * Render function for the overflow indicator. Receives the list of
   * items that are not visible, each with its original index. Only called
   * when there are overflowing items.
   *
   * The indicator is automatically measured in a hidden container to
   * reserve the correct amount of space.
   *
   * @example
   * ```
   * const labels = ['Save', 'Edit', 'Share'];
   * <XDSOverflowList
   *   overflowRenderer={(overflowItems) => (
   *     <XDSDropdownMenu
   *       button={{label: `+${overflowItems.length}`, variant: 'ghost'}}
   *       items={overflowItems.map(({index}) => ({ label: labels[index] }))}
   *     />
   *   )}>
   *   {labels.map(l => <XDSButton key={l} label={l} />)}
   * </XDSOverflowList>
   * ```
   */
  overflowRenderer?: (overflowItems: XDSOverflowItem[]) => ReactNode;
}

/**
 * A horizontal list that hides items that don't fit and shows an overflow indicator.
 *
 * Uses a hidden measurement container to determine which items fit without
 * causing visual flickering. The overflow indicator is also measured
 * automatically so no manual width value is needed.
 *
 * @example
 * ```
 * <XDSOverflowList
 *   gap={2}
 *   overflowRenderer={(items) => (
 *     <XDSButton label={`+${items.length} more`} variant="ghost" />
 *   )}>
 *   <XDSButton label="Action 1" />
 *   <XDSButton label="Action 2" />
 *   <XDSButton label="Action 3" />
 *   <XDSButton label="Action 4" />
 * </XDSOverflowList>
 * ```
 */
export function XDSOverflowList({
  children,
  gap = 2,
  minVisibleItems = 0,
  collapseFrom = 'end',
  behavior = 'observeSelf',
  overflowRenderer,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSOverflowListProps) {
  const childArray = Children.toArray(children) as ReactElement[];
  const itemCount = childArray.length;

  const gapPx = spacingToPx[gap];

  const observeParent = behavior === 'observeParent';

  const {containerRef, measureRef, visibleCount, hasOverflow} = useOverflow(
    itemCount,
    {
      gap: gapPx,
      minVisibleItems,
      collapseFrom,
      behavior,
    },
  );

  const allItems: XDSOverflowItem[] = childArray.map((child, index) => ({
    child,
    index,
  }));

  let visibleItems: XDSOverflowItem[];
  let overflowItems: XDSOverflowItem[];

  if (collapseFrom === 'end') {
    visibleItems = allItems.slice(0, visibleCount);
    overflowItems = allItems.slice(visibleCount);
  } else {
    visibleItems = allItems.slice(itemCount - visibleCount);
    overflowItems = allItems.slice(0, itemCount - visibleCount);
  }

  // Render a placeholder for measurement — uses all items as overflow
  // so the indicator renders at its maximum possible width.
  const measureIndicator = overflowRenderer?.(allItems);

  return (
    <>
      {/* Hidden measurement container */}
      <div
        ref={measureRef}
        aria-hidden="true"
        inert
        {...stylex.props(styles.measureContainer, gapStyles[gap])}>
        {childArray}
        {measureIndicator != null && (
          <div {...stylex.props(styles.measureIndicator)}>
            {measureIndicator}
          </div>
        )}
      </div>

      {/* Visible container */}
      <div
        ref={el => {
          containerRef(el);
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }
        }}
        {...mergeProps(
          xdsClassName('overflow-list'),
          stylex.props(
            styles.container,
            gapStyles[gap],
            observeParent && hasOverflow && styles.fillParent,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {collapseFrom === 'start' &&
          hasOverflow &&
          overflowRenderer?.(overflowItems)}
        {visibleItems.map(({child}) => child)}
        {collapseFrom === 'end' &&
          hasOverflow &&
          overflowRenderer?.(overflowItems)}
      </div>
    </>
  );
}

XDSOverflowList.displayName = 'XDSOverflowList';
