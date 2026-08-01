// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TimestampHoverCard.tsx
 * @input Uses React, HoverCard, IconButton, Icon, formatted tooltip lines
 * @output Default-exports the lazily-loaded copyable hover card for Timestamp
 * @position Split out of Timestamp so the overlay (HoverCard) and the copy
 *   affordance's Icon/IconButton load only when a card is actually shown — the
 *   default, card-less Timestamp never bundles this chunk.
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
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import type {TimestampTooltipLine} from './tooltipEntries';

const styles = stylex.create({
  // Copyable hover card: one row per line, each pairing the labelled instant
  // with a copy button. A grid gives the label / value / button columns a
  // shared, content-sized rhythm across rows.
  cardRows: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    columnGap: spacingVars['--spacing-2'],
    rowGap: spacingVars['--spacing-1'],
    marginBlock: 0,
    marginInline: 0,
  },
  cardLabel: {
    // The card renders on --color-background-surface (not the inverted
    // tooltip palette), so set explicit text colors instead of inheriting an
    // ambient one that fails contrast against the surface.
    color: colorVars['--color-text-secondary'],
    marginBlock: 0,
    marginInline: 0,
    paddingInlineEnd: {
      default: 0,
      ':not(:empty)': spacingVars['--spacing-1'],
    },
  },
  cardValue: {
    color: colorVars['--color-text-primary'],
    marginBlock: 0,
    marginInline: 0,
    whiteSpace: 'nowrap',
  },
});

/** How long the copied checkmark stays before reverting to the copy icon. */
const COPY_FEEDBACK_MS = 1500;

/**
 * One copyable row of the hover card: the labelled instant plus an IconButton
 * that writes that line's value to the clipboard.
 *
 * Copy affordance: `navigator.clipboard.writeText`, an icon that flips
 * `copy` → `check` for a moment, a polite live-region announcement, and a
 * silent no-op when the clipboard rejects.
 */
function CopyableEntryRow({line}: {line: TimestampTooltipLine}) {
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
    <>
      <dt {...stylex.props(styles.cardLabel)}>{line.label ?? ''}</dt>
      <dd {...stylex.props(styles.cardValue)}>{line.value}</dd>
      <IconButton
        variant="ghost"
        size="sm"
        icon={
          <Icon icon={copied ? 'check' : 'copy'} size="sm" color="inherit" />
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
    </>
  );
}

export interface TimestampHoverCardProps {
  /** The rows to render, each a labelled instant with its own copy button. */
  lines: ReadonlyArray<TimestampTooltipLine>;
  /** Accessible name for the card. */
  label: string;
  /** The anchor the card is attached to (the `<time>` element). */
  children: ReactNode;
}

/**
 * The copyable hover card for Timestamp. Each line becomes a labelled row with
 * its own copy button; with a single default line this is a one-row card
 * carrying the full absolute time, itself copyable. Opens on hover and on
 * keyboard focus (the anchor's tab stop), with a dashed-underline affordance
 * signalling it is interactive.
 */
export default function TimestampHoverCard({
  lines,
  label,
  children,
}: TimestampHoverCardProps): ReactNode {
  const cardContent = (
    <dl {...stylex.props(styles.cardRows)}>
      {lines.map((line, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key -- rows are fixed positional slots and two entries may legitimately be identical
        <CopyableEntryRow key={index} line={line} />
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
