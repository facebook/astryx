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
 * Each density variant uses its own paddingInline as the fallback,
 * so standalone tables (where --container-padding-inline is unset)
 * keep their normal density-based cell padding unchanged.
 */
export const containerEdgeStyles = stylex.create({
  compact: {
    paddingInlineStart: {
      default: null,
      ':first-child': `max(var(--container-padding-inline, ${spacingVars['--spacing-2']}), ${spacingVars['--spacing-2']})`,
    },
    paddingInlineEnd: {
      default: null,
      ':last-child': `max(var(--container-padding-inline, ${spacingVars['--spacing-2']}), ${spacingVars['--spacing-2']})`,
    },
  },
  balanced: {
    paddingInlineStart: {
      default: null,
      ':first-child': `max(var(--container-padding-inline, ${spacingVars['--spacing-3']}), ${spacingVars['--spacing-2']})`,
    },
    paddingInlineEnd: {
      default: null,
      ':last-child': `max(var(--container-padding-inline, ${spacingVars['--spacing-3']}), ${spacingVars['--spacing-2']})`,
    },
  },
  spacious: {
    paddingInlineStart: {
      default: null,
      ':first-child': `max(var(--container-padding-inline, ${spacingVars['--spacing-4']}), ${spacingVars['--spacing-2']})`,
    },
    paddingInlineEnd: {
      default: null,
      ':last-child': `max(var(--container-padding-inline, ${spacingVars['--spacing-4']}), ${spacingVars['--spacing-2']})`,
    },
  },
});
