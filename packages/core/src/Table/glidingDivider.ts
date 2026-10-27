// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file glidingDivider.ts
 * @input Table rows a row glide moves (Web Animations on the `<tr>`), their
 *   computed borders, StyleX
 * @output Exports `glidingDividerStyles` (a row's stand-in divider while it
 *   glides), `markGlidingRows` (marks the moving rows for that glide and
 *   carries each row's own border onto the stand-in) and `collapsedBottom`
 * @position Table internals. With collapsed borders the table paints every
 *   border at its cell's static place, so a row that moves leaves its divider
 *   behind. For the glide only, the cells' borders go transparent (their width
 *   stays, so nothing reflows) and the row's ::after draws the same divider,
 *   which moves with the row. A pinned cell draws its own over it
 *   (plugins/stickyColumns).
 *
 * SYNC: When modified, update TableCell.tsx, plugins/rowExpansion and
 *   plugins/stickyColumns.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {tableRowMarker} from './table.stylex';

/** On a row while a glide moves it. */
export const GLIDING_ATTRIBUTE = 'data-astryx-row-gliding';
const GLIDING = '[data-astryx-row-gliding]';

/** A row's own divider, carried for the glide (or a pinned cell's). */
export const APP_DIVIDER_WIDTH = '--_table-row-divider-app-width';
export const APP_DIVIDER_STYLE = '--_table-row-divider-app-style';
export const APP_DIVIDER_COLOR = '--_table-row-divider-app-color';

export const glidingDividerStyles = stylex.create({
  /** On every cell with a row divider: it goes transparent while the row moves. */
  cell: {
    borderBottomColor: {
      default: colorVars['--color-border'],
      [stylex.when.ancestor(GLIDING, tableRowMarker)]: 'transparent',
    },
  },
  /**
   * On every row: while it moves, its ::after draws the divider across the
   * row's bottom edge, where the collapsed border sits, and moves with it. A
   * cell's ::before or ::after is clipped by the cell's own overflow; the
   * row's is not. The row's motion (a `translate`) makes it the line's
   * containing block, and `position: relative` keeps it so.
   */
  row: {
    position: {
      default: null,
      [GLIDING]: 'relative',
    },
    '::after': {
      content: {
        default: null,
        [GLIDING]: '""',
      },
      position: 'absolute',
      insetInline: 0,
      bottom: 0,
      height: 0,
      borderBottomWidth: `var(${APP_DIVIDER_WIDTH}, 0px)`,
      borderBottomStyle: `var(${APP_DIVIDER_STYLE}, solid)`,
      borderBottomColor: `var(${APP_DIVIDER_COLOR}, ${colorVars['--color-border']})`,
      pointerEvents: 'none',
    },
  },
});

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

export interface BottomEdge {
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
export function collapsedBottom(cell: Element): BottomEdge {
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

/** The batch that marked a row last: only that batch unmarks it. */
const markedBy = new WeakMap<Element, symbol>();

/**
 * A row's own bottom border, for its stand-in while it moves; null for a row
 * already carrying one. Read where the glide reads the layout (`animate`'s
 * `beforeMove`), before anything starts moving.
 */
export function rowEdge(row: Element): BottomEdge | null {
  if (row.hasAttribute(GLIDING_ATTRIBUTE) || row.lastElementChild == null) {
    return null;
  }
  return collapsedBottom(row.lastElementChild);
}

/**
 * Marks the rows a glide is moving around `changed`, and `entering` (a row
 * playing its entrance, with that entrance), so their cells draw a divider
 * that moves with them; unmarks them in one batch when that motion ends. A
 * glide moves a contiguous run of rows next to the change and stops near the
 * visible part, so this walks out from the changed row each way and stops at
 * still rows: it never visits the rest of a long table. It asks the motion
 * module which rows glide and takes the borders read before the glide
 * started (`edges`), so it reads nothing from the layout: it only writes.
 * Resolves when the motion has ended.
 */
export async function markGlidingRows(
  changed: HTMLElement,
  edges: ReadonlyMap<Element, BottomEdge>,
  entering: {row: HTMLElement; animation: Animation} | null,
  glideOf: (element: Element) => Animation | null,
): Promise<void> {
  const rows = new Map<HTMLElement, Animation | null>();
  const glide = glideOf(changed);
  if (glide != null) {
    rows.set(changed, glide);
  }
  for (const step of [
    'nextElementSibling',
    'previousElementSibling',
  ] as const) {
    let row = changed[step];
    // The changed row's own panel enters rather than glides: look past it.
    let stillInARow = 0;
    while (row instanceof HTMLElement && stillInARow < 2) {
      const animation = glideOf(row);
      if (animation != null) {
        rows.set(row, animation);
        stillInARow = 0;
      } else {
        stillInARow += 1;
      }
      row = row[step];
    }
  }
  if (entering != null) {
    rows.set(entering.row, entering.animation);
  }
  if (rows.size === 0) {
    return;
  }
  const batch = Symbol('glide');
  for (const row of rows.keys()) {
    const edge = edges.get(row);
    if (edge != null && !row.hasAttribute(GLIDING_ATTRIBUTE)) {
      row.style.setProperty(APP_DIVIDER_WIDTH, `${edge.width}px`);
      row.style.setProperty(APP_DIVIDER_STYLE, edge.style);
      row.style.setProperty(APP_DIVIDER_COLOR, edge.color);
      row.setAttribute(GLIDING_ATTRIBUTE, '');
    }
    markedBy.set(row, batch);
  }
  await Promise.all(
    [...rows.values()].map(async animation => {
      await animation?.finished.catch(() => undefined);
    }),
  );
  // Writes only, and only for rows no later glide has taken over.
  for (const row of rows.keys()) {
    if (markedBy.get(row) !== batch) {
      continue;
    }
    markedBy.delete(row);
    row.removeAttribute(GLIDING_ATTRIBUTE);
    row.style.removeProperty(APP_DIVIDER_WIDTH);
    row.style.removeProperty(APP_DIVIDER_STYLE);
    row.style.removeProperty(APP_DIVIDER_COLOR);
  }
}
