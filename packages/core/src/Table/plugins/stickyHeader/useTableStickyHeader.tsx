// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableStickyHeader.tsx
 * @input React, StyleX, theme tokens, Table types
 * @output Exports useTableStickyHeader hook and UseTableStickyHeaderConfig type
 * @position Sticky-header plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (sticky-header documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, useRef, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../../../theme/tokens.stylex';
import type {
  TablePlugin,
  HeaderCellRenderProps,
  ScrollWrapperRenderProps,
} from '../../types';

/**
 * The pinned header's height, published on the scroll container.
 *
 * Anything else pinning inside the same scrollport has to start below the
 * header or it will be drawn over it, and the height is not knowable ahead of
 * time — it moves with density, with wrapped headings, and with whatever a
 * column puts in its `header`. Publishing it as a variable is what lets
 * `useTableGroupedRows` clear the header without the two plugins referring to
 * each other, the same way they already share `--table-sticky-background`.
 */
const HEADER_HEIGHT_VAR = '--table-sticky-header-height';

// =============================================================================
// Config
// =============================================================================

/**
 * Config for {@link useTableStickyHeader}.
 *
 * @remarks Every field is optional, so `useTableStickyHeader({})` compiles. It
 * is not a no-op: pinning the header is the whole point of installing the
 * plugin, and the height is what the caller may or may not need to state.
 */
export interface UseTableStickyHeaderConfig {
  /**
   * Height cap for the table's scroll container, e.g. `480` or `'60vh'`.
   *
   * The header pins to the scrollport that the table itself owns, so the table
   * needs one. Without a cap the scroll container grows to fit its rows and
   * never scrolls, which leaves the surrounding page to scroll instead — and a
   * header cannot pin to a scrollport it is not inside.
   *
   * Omit this only when an ancestor already bounds the table's height (a
   * `Layout` pane, a flex child with `min-height: 0`), in which case the
   * container is already a scrollport and capping it again would fight that.
   */
  maxHeight?: number | string;
}

// =============================================================================
// Styles
// =============================================================================

const stickyHeaderStyles = stylex.create({
  scrollWrapper: {
    // The wrapper only declares overflow-x. That already computes overflow-y to
    // `auto` (a non-visible value on one axis forces the other), but the
    // computed value is not the point — declaring it states the intent, and the
    // wrapper is only a vertical scrollport once something bounds its height.
    overflowY: 'auto',
  },
  headerCell: {
    position: 'sticky',
    insetBlockStart: 0,
    // Header cells are transparent by default, so rows would show through the
    // pinned row as they pass under it. Shares `--table-sticky-background` with
    // useTableStickyColumns so a table using both keeps one opaque surface
    // across the header and the pinned column, including the corner where they
    // meet, and one override changes all of it.
    backgroundColor: `var(--table-sticky-background, ${colorVars['--color-background-card']})`,
    // padding-box keeps the base off the cell's collapsed divider border.
    backgroundClip: 'padding-box',
    // Above unpinned body cells, and above the body cells that
    // useTableStickyColumns pins at 1. Deliberately below the 3 that plugin
    // gives its own header cells: where a pinned column crosses the pinned
    // header, that corner has to win on both axes, and letting the higher value
    // stand is what keeps it there.
    zIndex: 2,
  },
});

// =============================================================================
// Hook
// =============================================================================

/**
 * Pins the header row to the top of the table's scroll container, so column
 * headings stay readable while the body scrolls.
 *
 * Composes with `useTableStickyColumns`: install both to pin a column and the
 * header at once. The z-index values are chosen so the corner cell — pinned on
 * both axes — stays above both runs regardless of the order the plugins are
 * listed in.
 *
 * @example
 * ```
 * const stickyHeader = useTableStickyHeader({maxHeight: 480});
 *
 * <Table data={rows} columns={columns} plugins={[stickyHeader]} />
 * ```
 */
export function useTableStickyHeader<T extends Record<string, unknown>>(
  config: UseTableStickyHeaderConfig = {},
): TablePlugin<T> {
  const {maxHeight} = config;

  // Measured against the DOM rather than held in state: the height is only
  // ever read back out as a CSS variable, so putting it through React would
  // re-render the whole table on every resize to produce the same paint.
  const detachRef = useRef<(() => void) | null>(null);
  const publishHeaderHeight = useCallback((el: HTMLDivElement | null) => {
    detachRef.current?.();
    detachRef.current = null;
    if (el == null) {
      return;
    }
    // Refs attach depth-first, so the table is already in the DOM here.
    const head = el.querySelector('thead');
    if (head == null) {
      return;
    }
    const update = () => {
      el.style.setProperty(
        HEADER_HEIGHT_VAR,
        `${head.getBoundingClientRect().height}px`,
      );
    };
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    resizeObserver?.observe(head);
    update();
    detachRef.current = () => resizeObserver?.disconnect();
  }, []);

  return useMemo<TablePlugin<T>>(
    () => ({
      transformScrollWrapper(
        props: ScrollWrapperRenderProps,
      ): ScrollWrapperRenderProps {
        // A runtime value, so inline style rather than a dynamic StyleX rule:
        // it has to be authoritative no matter which plugins compose after it.
        const heightStyle: CSSProperties =
          maxHeight == null
            ? {}
            : {
                maxHeight:
                  typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
              };
        // Compose with any ref a prior plugin set on the same element, the
        // way useTableStickyColumns does for its scroll shadows.
        const existingRef = props.htmlProps.ref;
        const mergedRef = (node: HTMLDivElement | null) => {
          publishHeaderHeight(node);
          if (typeof existingRef === 'function') {
            existingRef(node);
          } else if (existingRef != null) {
            existingRef.current = node;
          }
        };

        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            ref: mergedRef,
            style: {...props.htmlProps.style, ...heightStyle},
          },
          xstyle: [...props.xstyle, stickyHeaderStyles.scrollWrapper],
        };
      },

      transformHeaderCell(props: HeaderCellRenderProps): HeaderCellRenderProps {
        return {
          ...props,
          xstyle: [...props.xstyle, stickyHeaderStyles.headerCell],
        };
      },
    }),
    [maxHeight, publishHeaderHeight],
  );
}
