// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTableStickyColumns.tsx
 * @input React, StyleX, theme tokens, Table types
 * @output Exports useTableStickyColumns hook and UseTableStickyColumnsConfig type
 * @position Sticky-columns plugin; consumed by Table via plugins prop
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/Table.doc.mjs (sticky-columns documentation)
 * - /packages/core/src/Table/index.ts (exports)
 */

import {useCallback, useMemo, useRef, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../../../theme/tokens.stylex';
import type {
  TableColumn,
  TablePlugin,
  HeaderCellRenderProps,
  BodyCellRenderProps,
  ScrollWrapperRenderProps,
} from '../../types';
import {DEFAULT_MIN_COLUMN_WIDTH} from '../../columnUtils';

// =============================================================================
// Config
// =============================================================================

/**
 * Config for {@link useTableStickyColumns}. Provide at least one of
 * `startKeys` / `endKeys` to pin columns.
 *
 * @remarks Every field is optional by design, so `useTableStickyColumns({})`
 * compiles and is an intentional no-op that pins nothing — the hook returns a
 * plugin that passes every cell through untouched. This lets callers compute
 * the config conditionally (e.g. `endKeys: enabled ? ['notes'] : undefined`)
 * without branching on whether to install the plugin at all.
 */
export interface UseTableStickyColumnsConfig {
  /**
   * Column keys pinned to the START (inline-start / left in LTR) edge — the
   * contiguous run from the first column through the last listed key.
   */
  startKeys?: string[];
  /**
   * Column keys pinned to the END (inline-end / right in LTR) edge — the
   * contiguous run from the first listed key through the last column.
   */
  endKeys?: string[];
}

// =============================================================================
// Width helpers
// =============================================================================

/**
 * Resolve a column's pixel width for cumulative offset math. Mirrors the
 * resize plugin's fallback so offsets line up with rendered widths:
 * pixel columns use their value; proportional columns use their declared
 * minWidth (or the default); unknown widths use the default.
 */
function getColumnWidth(col: TableColumn<Record<string, unknown>>): number {
  const w = col.width;
  if (!w) {
    return DEFAULT_MIN_COLUMN_WIDTH;
  }
  if (w.type === 'pixel') {
    return w.value;
  }
  // proportional
  return w.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
}

/**
 * Columns pinned to the START edge → cumulative inline offset (px). The pinned
 * block is the contiguous run from column 0 through the last key in `startKeys`
 * (inclusive of any synthetic columns before it). `null` if none / no context.
 */
function computeStartOffsets(
  columns: ReadonlyArray<TableColumn<Record<string, unknown>>> | undefined,
  startKeys: string[],
): Map<string, number> | null {
  if (!columns || columns.length === 0 || startKeys.length === 0) {
    return null;
  }
  let lastStickyIndex = -1;
  for (let i = 0; i < columns.length; i++) {
    if (startKeys.includes(columns[i].key)) {
      lastStickyIndex = i;
    }
  }
  if (lastStickyIndex === -1) {
    return null;
  }
  const offsets = new Map<string, number>();
  let cumulative = 0;
  for (let i = 0; i <= lastStickyIndex; i++) {
    offsets.set(columns[i].key, cumulative);
    cumulative += getColumnWidth(columns[i]);
  }
  return offsets;
}

/**
 * Mirror of {@link computeStartOffsets} for the END edge — contiguous run from
 * the first key in `endKeys` through the last column, offsets accumulating from
 * the end (last column = 0). `null` if none.
 */
function computeEndOffsets(
  columns: ReadonlyArray<TableColumn<Record<string, unknown>>> | undefined,
  endKeys: string[],
): Map<string, number> | null {
  if (!columns || columns.length === 0 || endKeys.length === 0) {
    return null;
  }
  let firstStickyIndex = -1;
  for (let i = 0; i < columns.length; i++) {
    if (endKeys.includes(columns[i].key)) {
      firstStickyIndex = i;
      break;
    }
  }
  if (firstStickyIndex === -1) {
    return null;
  }
  const offsets = new Map<string, number>();
  let cumulative = 0;
  for (let i = columns.length - 1; i >= firstStickyIndex; i--) {
    offsets.set(columns[i].key, cumulative);
    cumulative += getColumnWidth(columns[i]);
  }
  return offsets;
}

type StickySide = {edge: 'start' | 'end'; offset: number};

/**
 * Resolve how a single column should be pinned given the start/end configs and
 * the full column list. A key (mis)configured on both edges resolves to start.
 * Returns `null` for columns that should not be pinned.
 */
function resolveStickySide(
  columns: ReadonlyArray<TableColumn<Record<string, unknown>>> | undefined,
  columnKey: string,
  startKeys: string[],
  endKeys: string[],
): StickySide | null {
  const startOffsets = computeStartOffsets(columns, startKeys);
  if (startOffsets?.has(columnKey)) {
    return {edge: 'start', offset: startOffsets.get(columnKey) ?? 0};
  }
  const endOffsets = computeEndOffsets(columns, endKeys);
  if (endOffsets?.has(columnKey)) {
    return {edge: 'end', offset: endOffsets.get(columnKey) ?? 0};
  }
  return null;
}

// =============================================================================
// Styles
// =============================================================================

// Scroll-state CSS variables set on the scroll container by the layout ref;
// the cell ::after shadows read them so each edge's shadow only shows when
// content is hidden behind it. (A variable, not stylex.when.ancestor, because
// StyleX ancestor selectors are pseudo-class only — not scroll state.)
const SHADOW_VAR_START = '--table-sticky-shadow-start';
const SHADOW_VAR_END = '--table-sticky-shadow-end';

const stickyStyles = stylex.create({
  cell: {
    position: 'sticky',
    // Opaque base (overridable; defaults to the card token, the common
    // container) so scrolled content doesn't show through the pinned column.
    backgroundColor: `var(--table-sticky-background, ${colorVars['--color-background-card']})`,
    // Replay the row's overlay on a ::before layer (above the base, below text)
    // so the pinned column mirrors the row's striping/hover exactly via
    // --table-row-overlay. Transitions background-COLOR (not background-image)
    // so hover stays smooth at rest, not just when GPU-promoted while scrolled.
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      pointerEvents: 'none',
      backgroundColor: 'var(--table-row-overlay, transparent)',
      transitionProperty: 'background-color',
      transitionDuration: durationVars['--duration-fast'],
      transitionTimingFunction: easeVars['--ease-standard'],
    },
    // padding-box keeps the base off the cell's collapsed divider border.
    backgroundClip: 'padding-box',
    // Sticky cells need visible overflow so the shadow ::after can bleed out.
    overflow: 'visible',
  },
  headerCell: {
    // Header cells stack above body cells; both stack above non-sticky cells.
    zIndex: 3,
  },
  bodyCell: {
    zIndex: 1,
  },
});

// Soft drop shadow over the scrolling region (matches the EPS sticky treatment).
// border-collapse tables don't paint box-shadow on cells in Chromium, so it's a
// ::after gradient strip just past the pinned edge (visible thanks to the cell's
// overflow: visible). Opacity is gated by the scroll-state variable above.
const SHADOW_WIDTH = '6px';
// --color-shadow is only ~10% alpha (too faint here); use a slightly stronger soft tint.
const SHADOW_TINT = 'light-dark(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.32))';
const shadowStyles = stylex.create({
  // start-pinned: shadow falls to the right (inline-end), over scrolled content
  start: {
    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineEnd: 0,
      width: SHADOW_WIDTH,
      transform: 'translateX(100%)',
      pointerEvents: 'none',
      transition: 'opacity 150ms ease',
      opacity: `var(${SHADOW_VAR_START}, 0)`,
      backgroundImage: `linear-gradient(to right, ${SHADOW_TINT}, transparent)`,
    },
  },
  // end-pinned: shadow falls to the left (inline-start), over scrolled content
  end: {
    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineStart: 0,
      width: SHADOW_WIDTH,
      transform: 'translateX(-100%)',
      pointerEvents: 'none',
      transition: 'opacity 150ms ease',
      opacity: `var(${SHADOW_VAR_END}, 0)`,
      backgroundImage: `linear-gradient(to left, ${SHADOW_TINT}, transparent)`,
    },
  },
});

// Stable empty default so an unset start/end doesn't allocate a fresh array
// (and bust the memo) on every render.
const EMPTY: string[] = [];

// =============================================================================
// Hook
// =============================================================================

export function useTableStickyColumns<T extends Record<string, unknown>>(
  config: UseTableStickyColumnsConfig,
): TablePlugin<T> {
  const {startKeys, endKeys} = config;
  const start = startKeys ?? EMPTY;
  const end = endKeys ?? EMPTY;

  const hasStart = start.length > 0;
  const hasEnd = end.length > 0;

  // Live snapshot of the resolved config, read inside the (memoized) transforms
  // and the scroll-shadow callback. Keeping these in a ref lets the plugin memo
  // be computed once (deps: only the stable scroll-shadow callback) while never
  // reading stale config — consumers typically pass fresh array literals each
  // render, so we never want array identity in the deps.
  const stateRef = useRef({start, end, hasStart, hasEnd});
  stateRef.current = {start, end, hasStart, hasEnd};

  // Scroll-aware shadows: toggle CSS variables on the scroll container so each
  // edge's shadow only paints when there is hidden, horizontally-scrolled
  // content behind that edge. Implemented with a callback ref + scroll/resize
  // listeners (synchronizing with the DOM) rather than React state, so
  // scrolling never triggers re-renders.
  const detachRef = useRef<(() => void) | null>(null);
  const attachScrollShadow = useCallback((el: HTMLDivElement | null) => {
    detachRef.current?.();
    detachRef.current = null;
    if (!el) {
      return;
    }
    const update = () => {
      const {hasStart: hs, hasEnd: he} = stateRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const hasOverflow = maxScroll > 1;
      if (hs) {
        el.style.setProperty(
          SHADOW_VAR_START,
          hasOverflow && el.scrollLeft > 1 ? '1' : '0',
        );
      }
      if (he) {
        el.style.setProperty(
          SHADOW_VAR_END,
          hasOverflow && el.scrollLeft < maxScroll - 1 ? '1' : '0',
        );
      }
    };
    el.addEventListener('scroll', update, {passive: true});
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    resizeObserver?.observe(el);
    update();
    detachRef.current = () => {
      el.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
    };
  }, []);

  return useMemo(
    (): TablePlugin<T> => ({
      transformHeaderCell(
        props: HeaderCellRenderProps,
        column: TableColumn<T>,
      ): HeaderCellRenderProps {
        const {start: s, end: e} = stateRef.current;
        const side = resolveStickySide(props.columns, column.key, s, e);
        if (!side) {
          return props;
        }
        // position/inline-offset are runtime values → set via inline style so
        // they are authoritative regardless of plugin composition order (the
        // resize plugin also writes inline style on header cells).
        const offsetStyle: CSSProperties =
          side.edge === 'start'
            ? {insetInlineStart: `${side.offset}px`}
            : {insetInlineEnd: `${side.offset}px`};
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            style: {...props.htmlProps.style, ...offsetStyle},
          },
          xstyle: [
            ...props.xstyle,
            stickyStyles.cell,
            stickyStyles.headerCell,
            side.edge === 'start' ? shadowStyles.start : shadowStyles.end,
          ],
        };
      },

      transformBodyCell(
        props: BodyCellRenderProps,
        column: TableColumn<T>,
      ): BodyCellRenderProps {
        const {start: s, end: e} = stateRef.current;
        const side = resolveStickySide(props.columns, column.key, s, e);
        if (!side) {
          return props;
        }
        const offsetStyle: CSSProperties =
          side.edge === 'start'
            ? {insetInlineStart: `${side.offset}px`}
            : {insetInlineEnd: `${side.offset}px`};
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            style: {...props.htmlProps.style, ...offsetStyle},
          },
          xstyle: [
            ...props.xstyle,
            stickyStyles.cell,
            stickyStyles.bodyCell,
            side.edge === 'start' ? shadowStyles.start : shadowStyles.end,
          ],
        };
      },

      transformScrollWrapper(
        props: ScrollWrapperRenderProps,
      ): ScrollWrapperRenderProps {
        // No pinned edges → nothing to gate; leave the wrapper untouched.
        if (!stateRef.current.hasStart && !stateRef.current.hasEnd) {
          return props;
        }
        // Compose with any ref a prior plugin (e.g. virtualization) set on the
        // scroll container.
        const existingRef = props.htmlProps.ref;
        const mergedRef = (node: HTMLDivElement | null) => {
          attachScrollShadow(node);
          if (typeof existingRef === 'function') {
            existingRef(node);
          } else if (existingRef != null) {
            // RefObject — assign through its writable `.current`.
            existingRef.current = node;
          }
        };
        return {
          ...props,
          htmlProps: {...props.htmlProps, ref: mergedRef},
        };
      },
    }),
    // The returned plugin's transforms read live config from `stateRef` and
    // `attachScrollShadow` is stable (empty deps), so the plugin object can be
    // computed once and reused across renders.
    [attachScrollShadow],
  );
}
