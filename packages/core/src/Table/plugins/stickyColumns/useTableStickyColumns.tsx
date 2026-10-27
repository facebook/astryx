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

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../../../theme/tokens.stylex';
import type {
  TableColumn,
  TablePlugin,
  HeaderCellRenderProps,
  BodyCellRenderProps,
  ScrollWrapperRenderProps,
} from '../../types';
import {resolveColumnFloorWidths} from '../../columnUtils';

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

// Pinned offsets only matter while the table overflows, and an overflowing
// table renders at its minimum width. Offsets therefore accumulate the widths
// Table layout gives each column at that width (resolveColumnFloorWidths), so a
// pinned block stays contiguous for pixel, proportional, and width-less mixes.

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
  const widths = resolveColumnFloorWidths(columns);
  const offsets = new Map<string, number>();
  let cumulative = 0;
  for (let i = 0; i <= lastStickyIndex; i++) {
    offsets.set(columns[i].key, cumulative);
    cumulative += widths.get(columns[i].key) ?? 0;
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
  const widths = resolveColumnFloorWidths(columns);
  const offsets = new Map<string, number>();
  let cumulative = 0;
  for (let i = columns.length - 1; i >= firstStickyIndex; i--) {
    offsets.set(columns[i].key, cumulative);
    cumulative += widths.get(columns[i].key) ?? 0;
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

// A pinned cell draws its own row divider. With collapsed borders the table
// paints every border at its cell's static place: a sticky cell moves, its
// border does not, so without this the line under a pinned column would be
// whichever scrolled cell's border passes beneath it, and missing where that
// cell has none. The cell's ::before (already the row overlay's layer) extends
// over the cell's border area, covers whatever the table painted there with
// the pinned base, and draws the divider with the cell's own border tokens
// (TableCell.tsx); a border an app or a theme sets on the cell or row directly
// is read after each commit and on resize (syncPinnedDividers).
const PINNED_ATTRIBUTE = 'data-astryx-table-pinned';
/** Spread into a pinned cell's props: the attribute the divider sync finds. */
const PINNED_PROPS: Record<string, string> = {[PINNED_ATTRIBUTE]: ''};
const PINNED_DIVIDER_WIDTH = '--_table-row-divider-app-width';
const PINNED_DIVIDER_STYLE = '--_table-row-divider-app-style';
const PINNED_DIVIDER_COLOR = '--_table-row-divider-app-color';
const PINNED_BASE = `var(--table-sticky-background, ${colorVars['--color-background-card']})`;
const DIVIDER_WIDTH = `var(${PINNED_DIVIDER_WIDTH}, var(--_table-row-divider-width, 0px))`;

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
      // The divider: the layer reaches the bottom of the cell's border area,
      // paints the pinned base there (hiding the table's static border and any
      // scrolled cell's border), then the divider over it.
      marginBottom: `calc(-1 * ${DIVIDER_WIDTH})`,
      borderBottomWidth: DIVIDER_WIDTH,
      borderBottomStyle: `var(${PINNED_DIVIDER_STYLE}, solid)`,
      borderBottomColor: `var(${PINNED_DIVIDER_COLOR}, ${colorVars['--color-border']})`,
      backgroundImage: `linear-gradient(${PINNED_BASE}, ${PINNED_BASE})`,
      backgroundSize: `100% ${DIVIDER_WIDTH}`,
      backgroundPosition: 'bottom',
      backgroundRepeat: 'no-repeat',
      backgroundOrigin: 'border-box',
      backgroundClip: 'border-box',
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

// Soft drop shadow over the scrolling region (a standard sticky-column shadow treatment).
// border-collapse tables don't paint box-shadow on cells in Chromium, so it's a
// ::after gradient strip just past the pinned edge (visible thanks to the cell's
// overflow: visible). Opacity is gated by the scroll-state variable above.
const SHADOW_WIDTH = '6px';
const SHADOW_TINT = colorVars['--color-shadow'];
const shadowStyles = stylex.create({
  // start-pinned: shadow falls toward inline-end (over scrolled content).
  // insetInlineEnd anchors the strip to the column's inline-end edge; the strip
  // must then be nudged one full width OUTWARD (past that edge) into the
  // scrolled region. Outward is +X under LTR (inline-end = right) but −X under
  // RTL (inline-end = left), and the fade must run from the pinned edge toward
  // content in each direction — hence both transform and gradient flip on dir.
  start: {
    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineEnd: 0,
      width: SHADOW_WIDTH,
      transform: {
        default: 'translateX(100%)',
        ':is([dir="rtl"] *)': 'translateX(-100%)',
      },
      pointerEvents: 'none',
      transition: 'opacity 150ms ease',
      opacity: `var(${SHADOW_VAR_START}, 0)`,
      backgroundImage: {
        default: `linear-gradient(to right, ${SHADOW_TINT}, transparent)`,
        ':is([dir="rtl"] *)': `linear-gradient(to left, ${SHADOW_TINT}, transparent)`,
      },
    },
  },
  // end-pinned: shadow falls toward inline-start (over scrolled content).
  // insetInlineStart anchors the strip to the column's inline-start edge; the
  // strip is nudged one full width OUTWARD into content — −X under LTR
  // (inline-start = left) but +X under RTL (inline-start = right) — with the
  // gradient fading from the pinned edge toward content in each direction.
  end: {
    '::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      insetInlineStart: 0,
      width: SHADOW_WIDTH,
      transform: {
        default: 'translateX(-100%)',
        ':is([dir="rtl"] *)': 'translateX(100%)',
      },
      pointerEvents: 'none',
      transition: 'opacity 150ms ease',
      opacity: `var(${SHADOW_VAR_END}, 0)`,
      backgroundImage: {
        default: `linear-gradient(to left, ${SHADOW_TINT}, transparent)`,
        ':is([dir="rtl"] *)': `linear-gradient(to right, ${SHADOW_TINT}, transparent)`,
      },
    },
  },
});

// =============================================================================
// Pinned dividers: app overrides
// =============================================================================

/** Border styles by collapsed-border precedence, weakest first (CSS 2.1). */
const STYLE_RANK = [
  'inset',
  'groove',
  'outset',
  'ridge',
  'dotted',
  'dashed',
  'solid',
  'double',
];

interface BottomEdge {
  width: number;
  style: string;
  color: string;
}

function bottomEdge(element: Element): BottomEdge {
  const style = getComputedStyle(element);
  return {
    width: parseFloat(style.borderBottomWidth) || 0,
    style: style.borderBottomStyle,
    color: style.borderBottomColor,
  };
}

/**
 * The bottom border the table paints for a cell: the cell's own, or its row's
 * where an app styles the row and the row's wins the collapse (wider, then
 * the stronger style; the cell wins a tie).
 */
function collapsedBottom(cell: Element): BottomEdge {
  const own = bottomEdge(cell);
  const row = cell.parentElement;
  if (row == null) {
    return own;
  }
  const other = bottomEdge(row);
  if (own.style === 'hidden' || other.style === 'hidden') {
    return {width: 0, style: 'none', color: own.color};
  }
  const drawn = (edge: BottomEdge) => edge.style !== 'none' && edge.width > 0;
  if (!drawn(other)) {
    return own;
  }
  if (!drawn(own) || other.width > own.width) {
    return other;
  }
  if (other.width < own.width) {
    return own;
  }
  return STYLE_RANK.indexOf(other.style) > STYLE_RANK.indexOf(own.style)
    ? other
    : own;
}

/**
 * Where an app styles a cell's or row's `border-bottom` directly, past the
 * custom properties, the pinned divider takes the border the table paints.
 * Read after each commit and on resize, never on scroll. Every read comes
 * before any write, so the style is computed once for all pinned cells, and a
 * cell is written only when what it carries changes.
 */
function syncPinnedDividers(root: HTMLElement): void {
  const changes: [HTMLElement, string[]][] = [];
  for (const cell of root.querySelectorAll<HTMLElement>(
    `[${PINNED_ATTRIBUTE}]`,
  )) {
    const want = collapsedBottom(cell);
    const value = [`${want.width}px`, want.style, want.color];
    const carried = cell.style.getPropertyValue(PINNED_DIVIDER_WIDTH);
    if (carried !== '') {
      // It carries a border already: keep it while it is still the one.
      const same =
        carried === value[0] &&
        cell.style.getPropertyValue(PINNED_DIVIDER_STYLE) === value[1] &&
        cell.style.getPropertyValue(PINNED_DIVIDER_COLOR) === value[2];
      if (!same) {
        changes.push([cell, value]);
      }
      continue;
    }
    // It draws its tokens: carry the border only where the table paints
    // another.
    const drawn = getComputedStyle(cell, '::before');
    const matches =
      want.width === (parseFloat(drawn.borderBottomWidth) || 0) &&
      (want.width === 0 ||
        (want.style === drawn.borderBottomStyle &&
          want.color === drawn.borderBottomColor));
    if (!matches) {
      changes.push([cell, value]);
    }
  }
  for (const [cell, [width, style, color]] of changes) {
    cell.style.setProperty(PINNED_DIVIDER_WIDTH, width);
    cell.style.setProperty(PINNED_DIVIDER_STYLE, style);
    cell.style.setProperty(PINNED_DIVIDER_COLOR, color);
  }
}

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
  // Re-reads the edge shadows and the pinned dividers; set while attached.
  const refreshRef = useRef<(() => void) | null>(null);
  // The scroll container's merged ref, kept while the inner ref is the same.
  const mergedScrollWrapperRef = useRef<{
    inner: ScrollWrapperRenderProps['htmlProps']['ref'] | null;
    merged: (node: HTMLDivElement | null) => void;
  } | null>(null);
  const attachScrollShadow = useCallback((el: HTMLDivElement | null) => {
    detachRef.current?.();
    detachRef.current = null;
    refreshRef.current = null;
    if (!el) {
      return;
    }
    const update = () => {
      const {hasStart: hs, hasEnd: he} = stateRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const hasOverflow = maxScroll > 1;
      // RTL-safe scroll position. Spec-compliant browsers report a NEGATIVE
      // scrollLeft under RTL (0 at the inline-start edge, decreasing toward the
      // inline-end edge), so a raw `scrollLeft > 1` start test would never fire
      // and the end test would be wrong-signed. Math.abs collapses both
      // conventions to a distance-from-inline-start, matching the repo's own
      // useScrollOverflow (overflowStart/overflowEnd use Math.abs, tolerance 1).
      // No-op under LTR where scrollLeft is already >= 0.
      const pos = Math.abs(el.scrollLeft);
      if (hs) {
        el.style.setProperty(
          SHADOW_VAR_START,
          hasOverflow && pos > 1 ? '1' : '0',
        );
      }
      if (he) {
        el.style.setProperty(
          SHADOW_VAR_END,
          hasOverflow && pos < maxScroll - 1 ? '1' : '0',
        );
      }
    };
    const resize = () => {
      update();
      syncPinnedDividers(el);
    };
    el.addEventListener('scroll', update, {passive: true});
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(el);
    // The table too: columns added or widened change what scrolls without
    // resizing the wrapper.
    const table = el.querySelector('table');
    if (table != null) {
      resizeObserver?.observe(table);
    }
    resize();
    refreshRef.current = resize;
    detachRef.current = () => {
      el.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
    };
  }, []);

  // After each commit: a border that changed with the render (a row
  // highlighted on click) reaches the pinned divider, and the edge shadows
  // follow content that changed without a resize.
  useLayoutEffect(() => {
    refreshRef.current?.();
  });

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
        //
        // `position` belongs inline for the same reason, and used not to be:
        // it was left to `stickyStyles.cell`, which put it in the same xstyle
        // array the resize plugin appends `position: relative` to for its
        // handle's containing block. Whichever plugin was appended later won,
        // so a pinned column silently stopped pinning depending on the order
        // the caller happened to write `plugins={{ ... }}`. Inline wins over
        // both, which makes the composition order-independent instead of
        // buying a lucky order from the plugin sequence.
        const offsetStyle: CSSProperties =
          side.edge === 'start'
            ? {position: 'sticky', insetInlineStart: `${side.offset}px`}
            : {position: 'sticky', insetInlineEnd: `${side.offset}px`};
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            ...PINNED_PROPS,
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
            ...PINNED_PROPS,
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
        // scroll container. One merged ref per inner ref, so React does not
        // re-attach it on every render: the scroll listeners, the resize
        // observer and the pinned dividers' read (syncPinnedDividers, on
        // mount and on resize) run once, not once per render.
        const existingRef = props.htmlProps.ref ?? null;
        const cached = mergedScrollWrapperRef.current;
        const mergedRef =
          cached != null && cached.inner === existingRef
            ? cached.merged
            : (node: HTMLDivElement | null) => {
                attachScrollShadow(node);
                if (typeof existingRef === 'function') {
                  existingRef(node);
                } else if (existingRef != null) {
                  // RefObject — assign through its writable `.current`.
                  existingRef.current = node;
                }
              };
        mergedScrollWrapperRef.current = {
          inner: existingRef,
          merged: mergedRef,
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
