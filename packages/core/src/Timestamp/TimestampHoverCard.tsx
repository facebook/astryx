// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimestampHoverCard.tsx
 * @input Uses React, HoverCard, IconButton, Icon, formatted lines
 * @output Default-exports the lazily-loaded copyable hover card for Timestamp
 * @position Split out of Timestamp so the overlay (HoverCard) and the copy
 *   affordance's Icon/IconButton load only when a card is actually shown — the
 *   default, card-less Timestamp never bundles this chunk.
 *
 * Layout: a semantic `<dl>` laid out as a grid. Labelled cards use three
 *   columns — label, value, and a trailing action column for copy buttons —
 *   so the buttons align down a single column no matter how wide each value
 *   is. The action column is only added when at least one row is copyable, so
 *   a fully read-only card carries no dangling gutter. Label-less cards drop
 *   the label column and stack to whatever columns remain.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Timestamp/Timestamp.tsx (the lazy() + Suspense wrapper)
 * - /packages/core/src/Timestamp/Timestamp.doc.mjs (theming.targets)
 * - /packages/core/src/Timestamp/Timestamp.test.tsx
 */

import type {ReactNode} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {HoverCard} from '../HoverCard';
import {IconButton} from '../IconButton';
import {Icon} from '../Icon';
import {useAnnounce} from '../hooks/useAnnounce';
import {useTranslator} from '../i18n';
import {themeProps} from '../utils/themeProps';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import type {TimestampTooltipLine} from './tooltipEntries';

const styles = stylex.create({
  // The card is a definition list laid out as a grid so cells align into
  // columns across rows. `gridTemplateColumns` is set per-card (below) to add
  // or drop the label and action columns; the row/column gaps live here.
  dl: {
    display: 'grid',
    alignItems: 'center',
    columnGap: spacingVars['--spacing-4'],
    rowGap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
  },
  // Each row spans the full grid so its cells land in the shared columns.
  // `display: contents` lets the <dt>/<dd> participate directly in the grid.
  row: {
    display: 'contents',
  },
  // Label: the design system's `supporting` role — secondary colour, the
  // supporting size/leading, normal weight. This matches Timestamp's own
  // default `type` ('supporting'), so the card's labels read at the same
  // register as the component itself.
  label: {
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
  },
  // Value: the `body` role — primary colour, body size/leading, normal weight.
  value: {
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
  },
  // The trailing action cell holds the copy button (or nothing, on a
  // read-only row). It lives in its own grid column so buttons align.
  action: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

// Grid templates, selected per-card by which columns are present.
// - hasAnyLabel + hasAnyCopyable → label | value | action
// - hasAnyLabel only             → label | value
// - hasAnyCopyable only          → value | action
// - neither                      → value
const gridTemplates = stylex.create({
  labelValueAction: {gridTemplateColumns: 'auto 1fr auto'},
  labelValue: {gridTemplateColumns: 'auto 1fr'},
  valueAction: {gridTemplateColumns: '1fr auto'},
  value: {gridTemplateColumns: '1fr'},
});

/** How long the copied checkmark stays before reverting to the copy icon. */
const COPY_FEEDBACK_MS = 1500;

/**
 * One row of the hover card: an optional label, the formatted instant, and —
 * when the row is copyable and the card reserves an action column — a copy
 * button in that trailing column. When `hasActionColumn` is true but this row
 * is not copyable, an empty action cell is emitted so the columns stay aligned.
 *
 * Copy affordance: `navigator.clipboard.writeText`, an icon that flips
 * `copy` → `check` for a moment, a polite live-region announcement, and a
 * silent no-op when the clipboard rejects.
 */
function EntryRow({
  line,
  hasLabelColumn,
  hasActionColumn,
}: {
  line: TimestampTooltipLine;
  hasLabelColumn: boolean;
  hasActionColumn: boolean;
}) {
  const t = useTranslator();
  const announce = useAnnounce();
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(line.value);
      setCopied(true);
      // A swapped aria-label alone isn't reliably announced, so confirm the
      // copy via a polite live region.
      announce(t('@astryx.timestamp.copied'));
      // Restart the reset timer on every copy so a rapid re-copy isn't
      // reverted early by the previous click's timer.
      if (resetTimerRef.current != null) {
        clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = setTimeout(() => {
        resetTimerRef.current = null;
        setCopied(false);
      }, COPY_FEEDBACK_MS);
    } catch {
      // Clipboard failures leave the copied state unchanged.
    }
  }, [line.value, announce, t]);

  return (
    <div {...stylex.props(styles.row)}>
      {hasLabelColumn && (
        <dt {...stylex.props(styles.label)}>{line.label ?? ''}</dt>
      )}
      <dd {...stylex.props(styles.value)}>{line.value}</dd>
      {hasActionColumn && (
        <div {...stylex.props(styles.action)}>
          {line.isCopyable && (
            <IconButton
              variant="ghost"
              size="sm"
              icon={
                <Icon
                  icon={copied ? 'check' : 'copy'}
                  size="sm"
                  color="inherit"
                />
              }
              label={
                copied
                  ? t('@astryx.timestamp.copied')
                  : t('@astryx.timestamp.copyValue', {value: line.value})
              }
              onClick={() => {
                void handleCopy();
              }}
              {...themeProps('timestamp-copy-button')}
            />
          )}
        </div>
      )}
    </div>
  );
}

export interface TimestampHoverCardProps {
  /** The rows to render, each a labelled instant, optionally copyable. */
  lines: ReadonlyArray<TimestampTooltipLine>;
  /** Accessible name for the card. */
  label: string;
  /** The anchor the card is attached to (the `<time>` element). */
  children: ReactNode;
}

function gridTemplateFor(
  hasLabelColumn: boolean,
  hasActionColumn: boolean,
): stylex.StyleXStyles {
  if (hasLabelColumn && hasActionColumn) {
    return gridTemplates.labelValueAction;
  }
  if (hasLabelColumn) {
    return gridTemplates.labelValue;
  }
  if (hasActionColumn) {
    return gridTemplates.valueAction;
  }
  return gridTemplates.value;
}

/**
 * The copyable hover card for Timestamp. Renders a semantic `<dl>` as a grid:
 * an optional label column, the value, and — when any row is copyable — a
 * trailing action column carrying that row's copy button, so buttons align
 * down one column. With a single default line this is a one-row card carrying
 * the full absolute time, copyable. Opens on hover and on keyboard focus (the
 * anchor's tab stop), with a dashed-underline affordance signalling it is
 * interactive.
 */
export default function TimestampHoverCard({
  lines,
  label,
  children,
}: TimestampHoverCardProps): ReactNode {
  // A label column is only reserved when some row is labelled; otherwise the
  // value sits flush at the card's leading edge. An action column is only
  // reserved when some row is copyable (option B), so a fully read-only card
  // has no trailing gutter.
  const hasLabelColumn = lines.some(
    line => line.label != null && line.label !== '',
  );
  const hasActionColumn = lines.some(line => line.isCopyable);

  const cardContent = (
    <dl
      {...stylex.props(
        styles.dl,
        gridTemplateFor(hasLabelColumn, hasActionColumn),
      )}>
      {lines.map((line, index) => (
        <EntryRow
          // eslint-disable-next-line @eslint-react/no-array-index-key -- rows are fixed positional slots and two entries may legitimately be identical
          key={index}
          line={line}
          hasLabelColumn={hasLabelColumn}
          hasActionColumn={hasActionColumn}
        />
      ))}
    </dl>
  );

  return (
    <HoverCard
      content={cardContent}
      placement="above"
      focusTrigger="always"
      hasHoverIndication
      label={label}>
      {children}
    </HoverCard>
  );
}

TimestampHoverCard.displayName = 'TimestampHoverCard';
