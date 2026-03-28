/**
 * @file table.stylex.ts
 * @input StyleX, theme tokens
 * @output Shared table styles used by XDSTableCell and XDSTableHeaderCell
 * @position Utility styles; consumed by cell components
 */

import * as stylex from '@stylexjs/stylex';

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
