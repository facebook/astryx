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
 * selected. The default fixed layout renders as a full-bleed band in flow.
 * The floating layout renders in a zero-height anchor 16px above the table, so
 * showing it does not shift the table. Both layouts place bulk actions at the
 * logical start and count/clear-selection controls at the logical end. The
 * toolbar stays mounted through an exit transition before unmounting.
 */

import {type ReactNode, useEffect, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '../../../theme/tokens.stylex';
import {Button, type ButtonVariant} from '../../../Button';

// Duration (ms) the toolbar stays mounted after the selection clears so the
// exit transition can play before the node is removed.
const EXIT_DURATION_MS = 200;

export type TableBulkActionsLayout = 'fixed' | 'floating';

/** A single bulk action rendered as a button in the selection toolbar. */
export interface TableBulkAction {
  /** Button label. Also used as the button's accessible name. */
  label: string;
  /** Invoked with the current selected keys when the action is clicked. */
  onClick: (selectedKeys: Set<string>) => void;
  /** Button variant. @default 'ghost' */
  variant?: ButtonVariant;
  /** Disable the action button. */
  disabled?: boolean;
}

/**
 * Optional bulk-selection toolbar config on useTableSelection. `fixed` is the
 * default in-flow full-bleed layout; `floating` renders above the table without
 * shifting it. Omit the config entirely for the prior selection behaviour with
 * no toolbar.
 */
export interface TableBulkActionsConfig {
  /** The currently-selected row keys. Drives the count and is passed to actions. */
  selectedKeys: Set<string>;
  /** The bulk action buttons to render in the toolbar. */
  actions: TableBulkAction[];
  /**
   * `fixed` renders in flow as a full-bleed band. `floating` renders above the
   * table without shifting it.
   * @default 'fixed'
   */
  layout?: TableBulkActionsLayout;
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
  /**
   * Optional trailing control that clears the current selection. The consumer
   * supplies the localized label because selection ownership stays external.
   */
  clearSelection?: {
    label: string;
    onClick: () => void;
  };
}

const styles = stylex.create({
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-3'],
    minHeight: 48,
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    // Opaque base plus an accent tint layered on top, so the full-bleed band
    // reads as a section without adding a competing border or container.
    backgroundColor: colorVars['--color-background-card'],
    backgroundImage: `linear-gradient(${colorVars['--color-accent-muted']}, ${colorVars['--color-accent-muted']})`,
    transitionProperty: 'opacity, transform',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-out',
  },
  floatingAnchor: {
    position: 'relative',
    height: 0,
    zIndex: 20,
  },
  floating: {
    position: 'absolute',
    insetInline: 0,
    bottom: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: shadowVars['--shadow-med'],
  },
  entered: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  exiting: {
    opacity: 0,
    transform: 'translateY(-4px)',
  },
  leading: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    minWidth: 0,
  },
  trailing: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    marginInlineStart: 'auto',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    color: colorVars['--color-text-primary'],
  },
  separator: {
    color: colorVars['--color-text-secondary'],
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
  const {
    selectedKeys,
    actions,
    renderLabel,
    extraContent,
    selectAllMatching,
    clearSelection,
    layout = 'fixed',
  } = config;
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

  const toolbar = (
    <div
      {...stylex.props(
        styles.toolbar,
        layout === 'floating' && styles.floating,
        isExiting ? styles.exiting : styles.entered,
      )}
      data-layout={layout}
      role="toolbar"
      aria-live="polite"
      aria-atomic="true">
      <div {...stylex.props(styles.leading)}>
        {actions.map(action => (
          <Button
            key={action.label}
            label={action.label}
            size="sm"
            variant={action.variant ?? 'ghost'}
            isDisabled={action.disabled}
            onClick={() => action.onClick(selectedKeys)}
          />
        ))}
        {extraContent?.(count) ?? null}
      </div>
      <div {...stylex.props(styles.trailing)}>
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
        {clearSelection ? (
          <>
            <span aria-hidden="true" {...stylex.props(styles.separator)}>
              •
            </span>
            <Button
              label={clearSelection.label}
              size="sm"
              variant="ghost"
              onClick={clearSelection.onClick}
            />
          </>
        ) : null}
      </div>
    </div>
  );

  if (layout === 'floating') {
    return (
      <div
        {...stylex.props(styles.floatingAnchor)}
        data-floating-bulk-actions="true">
        {toolbar}
      </div>
    );
  }

  return toolbar;
}
