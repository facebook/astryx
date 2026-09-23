// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stickyTiers.stylex.ts
 * @input Nothing; a closed set of compile-time constants
 * @output Local stacking tiers shared by the Table plugins that pin cells
 * @position Single owner for sticky paint order inside the Table scroll wrapper
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/plugins/stickyColumns/useTableStickyColumns.tsx
 * - /packages/core/src/Table/plugins/stickyHeader/useTableStickyHeader.tsx
 * - /packages/core/src/Table/plugins/groupedRows/useTableGroupedRows.tsx
 *
 * A `.stylex.ts` file because `stylex.create` only inlines a constant that
 * reaches it through `defineVars`/`defineConsts` from one of these files; a
 * plain `export const` fails the build. `defineConsts`, not `defineVars`, so
 * these emit no CSS custom property: paint order inside Table is internal, not
 * a knob a theme should be able to reach in and reorder.
 */

import * as stylex from '@stylexjs/stylex';

/**
 * Paint order for everything Table pins inside its own scroll wrapper.
 *
 * These are *local* ranks, not a page-wide band (`spec:AST-027` FR4): the
 * scroll wrapper isolates itself, so the largest number here still paints below
 * unrelated page chrome. They live in one file because the ordering is only
 * correct as a set — a plugin that picks its own number in isolation is how a
 * pinned column ends up painting over a pinned heading.
 *
 * Reading order is bottom to top. Each tier is one step above the thing it must
 * cover, and no two things that can occupy the same pixels share a tier:
 *
 * - `bodyCell` — a column pinned on the inline axis, scrolling under
 *   everything pinned on the block axis.
 * - `groupHeading` — a group heading pinned while its section is on screen.
 *   Above a pinned column so the column cannot paint over the heading it is
 *   travelling under; below the header row, which it comes to rest beneath.
 * - `headerRow` — the header row pinned to the top of the scroll wrapper.
 * - `headerCorner` — a header cell that is pinned on both axes at once. It is
 *   the intersection of the two runs, so it has to clear both.
 */
export const stickyTiers = stylex.defineConsts({
  bodyCell: '1',
  groupHeading: '2',
  headerRow: '3',
  headerCorner: '4',
});

/**
 * The same tiers as numbers, for the plugins that write `z-index` as an inline
 * style rather than through `stylex.create`. They do that because the value has
 * to stay authoritative no matter which plugin composes after it, and because
 * the corner resolves as `Math.max` of whatever two plugins each want.
 */
export const STICKY_TIER = {
  BODY_CELL: Number(stickyTiers.bodyCell),
  GROUP_HEADING: Number(stickyTiers.groupHeading),
  HEADER_ROW: Number(stickyTiers.headerRow),
  HEADER_CORNER: Number(stickyTiers.headerCorner),
} as const;
