// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file List.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, ListContext
 * @output Exports List component, ListProps, ListDensity, ListStyle types
 * @position Core implementation; consumed by index.ts, tested by List.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/List.doc.mjs
 * - /packages/core/src/List/List.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 * - /packages/cli/templates/blocks/components/List/ (showcase blocks)
 */

import {useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {
  ListContext,
  type ListDensity,
  type ListMarkerStyle,
} from './ListContext';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export {
  type ListDensity,
  type ListMarkerStyle as ListStyle,
} from './ListContext';

export interface ListProps extends BaseProps<
  HTMLUListElement | HTMLOListElement
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLUListElement | HTMLOListElement>;
  /**
   * List items. Should be ListItem components.
   */
  children: ReactNode;

  /**
   * Spacing density for list items.
   * - 'compact': Tighter spacing for dense UIs
   * - 'balanced': Standard spacing
   * - 'spacious': Extra spacing for readability
   * @default 'balanced'
   */
  density?: ListDensity;

  /**
   * Whether to show dividers between list items.
   * @default false
   */
  hasDividers?: boolean;

  /**
   * Header content rendered above the list.
   * Semantically associated via aria-labelledby.
   */
  header?: ReactNode;

  /**
   * List marker style.
   * When 'decimal', renders an `<ol>`. Otherwise renders a `<ul>`.
   * @default 'none'
   */
  listStyle?: ListMarkerStyle;

  /**
   * Starting number for ordered lists (listStyle='decimal').
   * Sets the CSS counter to begin at this value.
   * @default 1
   */
  start?: number;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  list: {
    margin: 0,
    paddingInlineStart: 0,
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  withDividers: {
    gap: 0,
  },
  withCounter: {
    counterReset: 'astryx-list',
  },
  header: {
    marginBottom: spacingVars['--spacing-2'],
  },
});

const dynamicStyles = stylex.create({
  counterStart: (value: number) => ({
    counterReset: `astryx-list ${value}`,
  }),
});

// =============================================================================
// Component
// =============================================================================

/**
 * A vertical list component for rendering collections of items.
 *
 * Renders semantic `<ul>` or `<ol>` elements with configurable density,
 * dividers, marker styles, and an optional header.
 *
 * @example
 * ```
 * <List>
 *   <ListItem label="Notifications" description="Manage your alerts" />
 *   <ListItem label="Privacy" description="Control your data" />
 * </List>
 * <List listStyle="decimal" density="compact">
 *   <ListItem label="First step" />
 *   <ListItem label="Second step" />
 * </List>
 * ```
 */
export function List({
  children,
  density = 'balanced',
  hasDividers = false,
  header,
  listStyle = 'none',
  start,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: ListProps) {
  const headerId = useId();
  const isOrdered = listStyle === 'decimal';
  const Tag = isOrdered ? 'ol' : 'ul';

  const contextValue = useMemo(
    () => ({density, hasDividers, listStyle}),
    [density, hasDividers, listStyle],
  );

  const listElement = (
    <Tag
      ref={ref as React.Ref<HTMLUListElement & HTMLOListElement>}
      data-testid={testId}
      aria-labelledby={header != null ? headerId : undefined}
      {...(isOrdered && start != null && start !== 1 ? {start} : {})}
      {...(listStyle === 'none' && !isOrdered ? {role: 'list'} : {})}
      {...mergeProps(
        themeProps('list', {density, listStyle}),
        stylex.props(
          styles.list,
          hasDividers && styles.withDividers,
          listStyle !== 'none' &&
            (start != null && start !== 1
              ? dynamicStyles.counterStart(start - 1)
              : styles.withCounter),
          xstyle,
        ),
        className,
        style,
      )}>
      {children}
    </Tag>
  );

  if (header == null) {
    return <ListContext value={contextValue}>{listElement}</ListContext>;
  }

  return (
    <ListContext value={contextValue}>
      <div {...stylex.props(styles.root)}>
        <div id={headerId} {...stylex.props(styles.header)}>
          {header}
        </div>
        {listElement}
      </div>
    </ListContext>
  );
}

List.displayName = 'List';
