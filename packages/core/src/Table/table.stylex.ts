/**
 * @file table.stylex.ts
 * @input StyleX, theme tokens
 * @output Shared table styles used by XDSTableCell and XDSTableHeaderCell
 * @position Utility styles; consumed by cell components
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Table/XDSTableCell.tsx
 * - /packages/core/src/Table/XDSTableHeaderCell.tsx
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';

/**
 * Overflow truncation for table cells.
 *
 * Applied at the <td>/<th> level as a CSS safety net. For data-driven
 * tables, the default renderer also adds a title attribute so truncated
 * text is accessible on hover. For the full XDS tooltip experience,
 * use renderCell with <XDSText maxLines={1}>.
 */
export const overflowStyles = stylex.create({
  cell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '0',
  },
});

/**
 * Container edge compensation for table cells.
 *
 * When a table is inside a Card, Section, or Layout area, the table
 * element applies negative inline margins to bleed edge-to-edge
 * (see XDSTable.tsx containerBleed style). These styles ensure the
 * first and last columns' outer padding aligns with the container's
 * content inset, with a minimum of --spacing-2 (8px).
 *
 * Uses `max()` so that even in small-padding containers the table
 * cells always have at least 8px of breathing room.
 *
 * When no container is present (--container-padding-inline is unset/0px),
 * these resolve to 8px — matching the compact density default and
 * providing a sensible standalone baseline.
 */
export const containerEdgeStyles = stylex.create({
  cell: {
    paddingInlineStart: {
      default: null,
      ':first-child': `max(var(--container-padding-inline, 0px), ${spacingVars['--spacing-2']})`,
    },
    paddingInlineEnd: {
      default: null,
      ':last-child': `max(var(--container-padding-inline, 0px), ${spacingVars['--spacing-2']})`,
    },
  },
});
