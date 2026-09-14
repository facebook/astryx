// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableBulkActionsToolbar.tsx
 * @input React, StyleX, Button, theme tokens
 * @output Exports TableBulkActionsToolbar + config/action types
 * @position Presentation-only toolbar rendered by useTableSelection (via
 *   transformScrollWrapper.beforeTable) when a bulkActions config is supplied.
 *   Apps do not construct it directly.
 *
 * Shows a selection count, optional "select all N matching" link, optional
 * extra content, and the consumer-provided action buttons whenever rows are
 * selected. Renders in the gap above the table (inside the scroll wrapper).
 * It stays mounted through an exit transition so it can fade/slide out when
 * the selection clears, then unmounts.
 */

import {type ReactNode, useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '../../../theme/tokens.stylex';
import {Button, type ButtonVariant} from '../../../Button';

// Duration (ms) the toolbar stays mounted after the selection clears so the
// exit transition can play before the node is removed.
const EXIT_DURATION_MS = 200;

/** A single bulk action rendered as a button in the selection toolbar. */
export interface TableBulkAction {
  /** Button label. Also used as the button's accessible name. */
  label: string;
  /** Invoked with the current selected keys when the action is clicked. */
  onClick: (selectedKeys: Set<string>) => void;
  /** Button variant. @default 'secondary' */
  variant?: ButtonVariant;
  /** Disable the action button. */
  disabled?: boolean;
}

/**
 * Optional bulk-selection toolbar config on useTableSelection. When present, a
 * toolbar appears above the table (via transformScrollWrapper.beforeTable) while
 * rows are selected. Omit it entirely (the default) for the prior selection
 * behavior with no toolbar.
 */
export interface TableBulkActionsConfig {
  /** The currently-selected row keys. Drives the count and is passed to actions. */
  selectedKeys: Set<string>;
  /** The bulk action buttons to render in the toolbar. */
  actions: TableBulkAction[];
  /**
   * Custom label renderer. Receives the selected count. Defaults to
   * `"N selected"`.
   */
  renderLabel?: (count: number) => ReactNode;
  /**
   * Extra content rendered between the label and the action buttons, e.g. a
   * note that some matching rows are hidden by filters. Receives the count.
   */
  extraContent?: (count: number) => ReactNode;
  /**
   * Optional "select all N matching" affordance for selecting across
   * pages/filters. When provided and more matches exist than are selected, the
   * toolbar shows a link that invokes `onSelectAllMatching`.
   */
  selectAllMatching?: {
    totalMatchingCount: number;
    isSelectAllMatching: boolean;
    onSelectAllMatching: () => void;
  };
}

const styles = stylex.create({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    marginBlockEnd: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    // Opaque base plus an accent tint layered on top, so the surface reads
    // solid even though the accent-muted token is translucent.
    backgroundColor: colorVars['--color-background-card'],
    backgroundImage: `linear-gradient(${colorVars['--color-accent-muted']}, ${colorVars['--color-accent-muted']})`,
    transitionProperty: 'opacity, transform',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  entered: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  exiting: {
    opacity: 0,
    transform: 'translateY(-4px)',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  link: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    color: colorVars['--color-text-accent'],
    textDecorationLine: 'underline',
    font: 'inherit',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    marginInlineStart: 'auto',
  },
});

/**
 * Animated toolbar shown above a table when rows are selected, holding bulk
 * actions. Rendered by useTableSelection when a bulkActions config is supplied.
 */
export function TableBulkActionsToolbar({
  config,
}: {
  config: TableBulkActionsConfig;
}) {
  const {selectedKeys, actions, renderLabel, extraContent, selectAllMatching} =
    config;
  const isSelectAllMatching = selectAllMatching?.isSelectAllMatching ?? false;
  const count = isSelectAllMatching
    ? (selectAllMatching?.totalMatchingCount ?? selectedKeys.size)
    : selectedKeys.size;
  const isActive = count > 0;

  const [isMounted, setIsMounted] = useState(isActive);
  const [isExiting, setIsExiting] = useState(false);

  // Adjust presence during render: mount when a selection appears, start the
  // exit when it clears, cancel a pending exit if selection returns.
  if (isActive && !isMounted) {
    setIsMounted(true);
  }
  if (isActive && isExiting) {
    setIsExiting(false);
  }
  if (!isActive && isMounted && !isExiting) {
    setIsExiting(true);
  }

  useEffect(() => {
    if (!isExiting) {
      return;
    }
    const timer = setTimeout(() => {
      setIsMounted(false);
      setIsExiting(false);
    }, EXIT_DURATION_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isExiting]);

  if (!isMounted) {
    return null;
  }

  const label = renderLabel ? renderLabel(count) : `${count} selected`;

  const showSelectAllLink =
    selectAllMatching != null &&
    !isSelectAllMatching &&
    selectAllMatching.totalMatchingCount > selectedKeys.size;

  return (
    <div
      {...stylex.props(
        styles.toolbar,
        isExiting ? styles.exiting : styles.entered,
      )}
      role="toolbar"
      aria-live="polite"
      aria-atomic="true">
      <span {...stylex.props(styles.label)}>
        {label}
        {showSelectAllLink ? (
          <button
            type="button"
            {...stylex.props(styles.link)}
            onClick={selectAllMatching.onSelectAllMatching}>
            {`Select all ${selectAllMatching.totalMatchingCount} matching`}
          </button>
        ) : null}
      </span>
      {extraContent?.(count) ?? null}
      <span {...stylex.props(styles.actions)}>
        {actions.map(action => (
          <Button
            key={action.label}
            label={action.label}
            size="sm"
            variant={action.variant ?? 'secondary'}
            isDisabled={action.disabled}
            onClick={() => action.onClick(selectedKeys)}
          />
        ))}
      </span>
    </div>
  );
}
