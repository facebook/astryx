// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListItem.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens
 * @output Exports ListItem component, ListItemProps type
 * @position Core implementation; consumed by List, index.ts, tested by List.test.tsx
 *
 * Composes Item for the shared start content + label + description + end content layout
 * and the invisible button/anchor interactive pattern.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/List.doc.mjs
 * - /packages/core/src/List/List.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 * - /packages/cli/templates/blocks/components/List/ (showcase blocks)
 */

import {use, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {ListContext} from './ListContext';
import {mergeProps} from '../utils';
import {Item} from '../Item';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export interface ListItemProps extends BaseProps<HTMLLIElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Primary text label for the item.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich content (no truncation constraints —
   * child components control their own text behavior).
   */
  label: ReactNode;

  /**
   * Secondary description below the label.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich/multi-line content (no wrapping constraints
   * applied — child components control their own text behavior).
   */
  description?: ReactNode;

  /**
   * Content rendered before the item (icon, avatar, checkbox).
   * Uses start/end naming for RTL support.
   */
  startContent?: ReactNode;

  /**
   * Content rendered after the item (badge, action button, chevron).
   */
  endContent?: ReactNode;

  /**
   * Click handler for interactive items.
   * Automatically enables hover/press styles when provided.
   */
  onClick?: (e: React.MouseEvent) => void;

  /**
   * URL for link items. Renders an invisible anchor element.
   * Automatically enables hover/press styles when provided.
   */
  href?: string;

  /**
   * Link target (e.g., '_blank'). Only used with href.
   */
  target?: string;

  /**
   * Link relationship. Automatically includes noopener noreferrer when
   * target is "_blank".
   */
  rel?: string;

  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the item is currently selected.
   * @default false
   */
  isSelected?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  withCounter: {
    counterIncrement: 'astryx-list',
  },
  withDivider: {
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
    ':last-child': {
      borderBlockEnd: 'none',
    },
  },
});

// =============================================================================
// Marker styles — custom-rendered markers instead of native list-style-type.
// Uses CSS counters for numbers (same pattern as WWW Astryx).
// =============================================================================

const MARKER_DOT_SIZE = 6;

const markerStyles = stylex.create({
  container: {
    alignSelf: 'baseline',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: spacingVars['--spacing-4'],
    marginTop: `calc((1em * ${typeScaleVars['--text-body-leading']} - ${MARKER_DOT_SIZE}px) / 2)`,
  },
  dot: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    borderRadius: '50%',
    backgroundColor: colorVars['--color-text-primary'],
  },
  circle: {
    width: MARKER_DOT_SIZE,
    height: MARKER_DOT_SIZE,
    borderRadius: '50%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
  },
  number: {
    alignSelf: 'baseline',
    flexShrink: 0,
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    width: spacingVars['--spacing-4'],
    '::before': {
      content: 'counter(astryx-list) "."',
    },
  },
});

const embeddedStyles = stylex.create({
  noRadius: {
    borderRadius: 0,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A list item component for use within List.
 *
 * Renders structured content with label, description, start/end content areas.
 * When `onClick` is provided, uses the invisible button pattern for accessibility.
 * When `href` is provided, uses an invisible anchor pattern.
 *
 * @example
 * ```
 * <ListItem label="Settings" description="Manage your preferences" />
 * <ListItem label="Profile" onClick={() => navigate('/profile')} />
 * <ListItem label="Docs" href="/docs" target="_blank" rel="noreferrer" />
 * ```
 */
export function ListItem({
  label,
  description,
  startContent,
  endContent,
  onClick,
  href,
  target,
  rel,
  isDisabled = false,
  isSelected = false,
  xstyle,
  className,
  style,
  ref,
  ...restProps
}: ListItemProps) {
  const ctx = use(ListContext);
  const density = ctx?.density ?? 'balanced';
  const hasDividers = ctx?.hasDividers ?? false;
  const listStyle = ctx?.listStyle ?? 'none';
  const hasMarkers = listStyle !== 'none';

  const marker =
    listStyle === 'disc' ? (
      <span {...stylex.props(markerStyles.container)}>
        <span {...stylex.props(markerStyles.dot)} />
      </span>
    ) : listStyle === 'circle' ? (
      <span {...stylex.props(markerStyles.container)}>
        <span {...stylex.props(markerStyles.circle)} />
      </span>
    ) : listStyle === 'decimal' ? (
      <span {...stylex.props(markerStyles.number)} />
    ) : null;

  return (
    <Item
      as="li"
      ref={ref}
      marker={marker}
      startContent={startContent}
      label={label}
      description={description}
      endContent={endContent}
      onClick={onClick}
      href={href}
      target={target as '_blank' | '_self'}
      rel={rel}
      isDisabled={isDisabled}
      isSelected={isSelected}
      density={density}
      xstyle={[
        hasMarkers && styles.withCounter,
        hasDividers && styles.withDivider,
        hasDividers && embeddedStyles.noRadius,
        xstyle,
      ]}
      {...mergeProps(themeProps('list-item'), {className, style})}
      {...restProps}
    />
  );
}

ListItem.displayName = 'ListItem';
