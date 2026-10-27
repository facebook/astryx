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
 *   behind. For the glide only, the moving row's cells are marked: their
 *   borders go transparent (their width stays, so nothing reflows) and one of
 *   them draws the same divider across the whole row in its ::after, which
 *   moves with the row. A pinned cell draws its own over it
 *   (plugins/stickyColumns).
 *
 * SYNC: When modified, update TableCell.tsx, plugins/rowExpansion and
 *   plugins/stickyColumns.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

/** On a row while a glide moves it. */
export const GLIDING_ATTRIBUTE = 'data-astryx-row-gliding';
const GLIDING = '[data-astryx-row-gliding]';
/**
 * On each cell of a moving row; `line` on the one that draws the row's
 * divider. On the cells themselves, so a table nested in a moving row keeps
 * its own dividers.
 */
const CELL_ATTRIBUTE = 'data-astryx-cell-gliding';
const CELL_GLIDING = '[data-astryx-cell-gliding]';
const CELL_LINE = '[data-astryx-cell-gliding="line"]';

/** On a pinned (sticky) cell: plugins/stickyColumns. */
const PINNED_ATTRIBUTE = 'data-astryx-table-pinned';

/** A row's own divider, carried for the glide (or a pinned cell's). */
export const APP_DIVIDER_WIDTH = '--_table-row-divider-app-width';
export const APP_DIVIDER_STYLE = '--_table-row-divider-app-style';
export const APP_DIVIDER_COLOR = '--_table-row-divider-app-color';

export const glidingDividerStyles = stylex.create({
  /**
   * On every cell with a row divider: it goes transparent while the row
   * moves, and the row's line cell draws the divider across the row's bottom
   * edge, where the collapsed border sits. The line is positioned against the
   * row (the cell is not positioned), so the cell's own overflow does not clip
   * it, and it is a box inside a cell, not a box in the row, so the table's
   * column widths do not change.
   */
  cell: {
    borderBottomColor: {
      default: colorVars['--color-border'],
      [CELL_GLIDING]: 'transparent',
    },
    // Every declaration only on the line cell: a pinned cell's own ::after
    // (its scroll shadow) stays untouched.
    '::after': {
      content: {default: null, [CELL_LINE]: '""'},
      position: {default: null, [CELL_LINE]: 'absolute'},
      insetInline: {default: null, [CELL_LINE]: 0},
      bottom: {default: null, [CELL_LINE]: 0},
      height: {default: null, [CELL_LINE]: 0},
      borderBottomWidth: {
        default: null,
        [CELL_LINE]: `var(${APP_DIVIDER_WIDTH}, 0px)`,
      },
      borderBottomStyle: {
        default: null,
        [CELL_LINE]: `var(${APP_DIVIDER_STYLE}, solid)`,
      },
      borderBottomColor: {
        default: null,
        [CELL_LINE]: `var(${APP_DIVIDER_COLOR}, ${colorVars['--color-border']})`,
      },
      pointerEvents: {default: null, [CELL_LINE]: 'none'},
    },
  },
  /**
   * After `cell` on a detail panel's cell: its divider color is the one its
   * row hands down (plugins/rowExpansion).
   */
  panelCell: {
    borderBottomColor: {
      default: `var(--_table-panel-divider-color, ${colorVars['--color-border']})`,
      [CELL_GLIDING]: 'transparent',
    },
  },
  /**
   * On every row: while it moves it is the line's containing block. Its
   * motion (a `translate`) makes it one; `position: relative` keeps it so
   * for a panel playing in, which does not move.
   */
  row: {
    position: {
      default: null,
      [GLIDING]: 'relative',
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

function edgeOf(element: Element | null, side: 'Bottom' | 'Top'): BottomEdge {
  if (element == null) {
    return {width: 0, style: 'none', color: ''};
  }
  const style = getComputedStyle(element);
  return {
    width:
      parseFloat(
        style.getPropertyValue(`border-${side.toLowerCase()}-width`),
      ) || 0,
    style: style.getPropertyValue(`border-${side.toLowerCase()}-style`),
    color: style.getPropertyValue(`border-${side.toLowerCase()}-color`),
  };
}

/**
 * The border the table paints under a cell, by the collapsing rules (CSS 2.1
 * 17.6.2.1): of the cell's own bottom, the cell's below it (top), its row's
 * bottom and the next row's top, `hidden` wins, then the wider, then the
 * stronger style; a tie goes to a cell over a row, and to the upper one.
 * `isOwn` says the cell's own border won. Shared with plugins/stickyColumns.
 */
export function collapsedBottom(cell: HTMLTableCellElement): BottomEdge & {
  isOwn: boolean;
} {
  const row = cell.parentElement;
  const nextRow = row?.nextElementSibling ?? null;
  const nextCell = nextRow?.children[cell.cellIndex] ?? null;
  // In tie order.
  const candidates = [
    edgeOf(cell, 'Bottom'),
    edgeOf(nextCell, 'Top'),
    edgeOf(row, 'Bottom'),
    edgeOf(nextRow, 'Top'),
  ];
  const own = candidates[0];
  if (candidates.some(edge => edge.style === 'hidden')) {
    return {
      width: 0,
      style: 'none',
      color: own.color,
      isOwn: own.style === 'hidden',
    };
  }
  const strength = (edge: BottomEdge) =>
    edge.style === 'none' || edge.width === 0
      ? [-1, -1]
      : [edge.width, STYLE_RANK.indexOf(edge.style)];
  let winner = own;
  for (const edge of candidates.slice(1)) {
    const [width, rank] = strength(edge);
    const [bestWidth, bestRank] = strength(winner);
    if (width > bestWidth || (width === bestWidth && rank > bestRank)) {
      winner = edge;
    }
  }
  return {...winner, isOwn: winner === own};
}

/** The batch that marked a row last: only that batch unmarks it. */
const markedBy = new WeakMap<Element, symbol>();

/**
 * The divider a detail panel takes from its row: the color and style of the
 * row's cells (a theme's `table-cell` styling or an app's own, which never
 * reach the panel's cell), at the panel's own width unless the row's own
 * border wins the collapse (an app styling the `<tr>`), as custom property
 * values for the panel's cell. Every value is written, `initial` where the
 * panel keeps its own, so a panel nested in another never inherits that
 * one's. Read once per commit.
 */
export function panelDividerFor(row: Element): {
  width: string;
  style: string;
  color: string;
} | null {
  const rowCell = row.lastElementChild;
  if (rowCell == null) {
    return null;
  }
  const rowStyle = getComputedStyle(row);
  const rowWidth = parseFloat(rowStyle.borderBottomWidth) || 0;
  if (rowStyle.borderBottomStyle !== 'none' && rowWidth > 0) {
    return {
      width: `${rowWidth}px`,
      style: rowStyle.borderBottomStyle,
      color: rowStyle.borderBottomColor,
    };
  }
  const cellStyle = getComputedStyle(rowCell);
  return {
    width: 'initial',
    style: cellStyle.borderBottomStyle,
    color: cellStyle.borderBottomColor,
  };
}

/**
 * A row's own bottom border, for its stand-in while it moves; null for a row
 * already carrying one. Read where the glide reads the layout (`animate`'s
 * `beforeMove`), before anything starts moving.
 */
export function rowEdge(row: Element): BottomEdge | null {
  if (row.hasAttribute(GLIDING_ATTRIBUTE) || row.lastElementChild == null) {
    return null;
  }
  return collapsedBottom(row.lastElementChild as HTMLTableCellElement);
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
      // The first cell that scrolls with the row draws the line; a pinned
      // cell is positioned (the line would be its width) and draws its own.
      let hasLine = false;
      for (const cell of row.children) {
        const isLine: boolean =
          !hasLine && !cell.hasAttribute(PINNED_ATTRIBUTE);
        cell.setAttribute(CELL_ATTRIBUTE, isLine ? 'line' : '');
        hasLine ||= isLine;
      }
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
    for (const cell of row.children) {
      cell.removeAttribute(CELL_ATTRIBUTE);
    }
    row.style.removeProperty(APP_DIVIDER_WIDTH);
    row.style.removeProperty(APP_DIVIDER_STYLE);
    row.style.removeProperty(APP_DIVIDER_COLOR);
  }
}
