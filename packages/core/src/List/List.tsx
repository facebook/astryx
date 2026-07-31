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
 * - /packages/cli/assets/templates/blocks/components/List/ (showcase blocks)
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
   * Aligns list item content flush with the container edge by cancelling
   * the items' built-in horizontal inset with a matching negative margin.
   * Use when the list sits under full-bleed sibling content such as a
   * section heading, so row text lines up optically with the heading text.
   * Tracks the density-dependent inset automatically (8px for compact and
   * balanced, 12px for spacious). Hover and selection backgrounds still
   * extend past the text by that inset.
   * @default false
   */
  isEdgeAligned?: boolean;

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
  // isEdgeAligned cancels the inline inset that Item applies to each row so
  // row text aligns flush with sibling full-bleed content (e.g. a section
  // heading). The negative margin mirrors Item's own density-dependent
  // paddingInline (--spacing-2, or --spacing-3 for spacious), not the
  // container padding vars: the goal is optical alignment with siblings,
  // not a container bleed like Table/Divider.
  edgeAligned: {
    marginInline: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  edgeAlignedSpacious: {
    marginInline: `calc(-1 * ${spacingVars['--spacing-3']})`,
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
 * Set `isEdgeAligned` when the list sits under full-bleed content such as a
 * section heading; it cancels the items' built-in inline inset so row text
 * aligns flush with the container edge.
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
  isEdgeAligned = false,
  header,
  listStyle = 'none',
  start,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
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
      // Consumer props first: everything the component sets for itself below
      // is part of its contract and wins on conflict.
      {...props}
      data-testid={testId}
      // Only when this component renders the header — writing `undefined`
      // unconditionally would erase a label a consumer pointed at their own
      // heading.
      {...(header != null ? {'aria-labelledby': headerId} : null)}
      {...(isOrdered && start != null && start !== 1 ? {start} : {})}
      // The base list style always sets list-style-type: none (markers are
      // custom-rendered by ListItem), and Safari/VoiceOver drops implicit
      // list semantics for lists styled with list-style: none. The explicit
      // role restores "list, N items" announcements for every listStyle
      // variant.
      role="list"
      {...mergeProps(
        themeProps('list', {density, listStyle}),
        stylex.props(
          styles.list,
          hasDividers && styles.withDividers,
          isEdgeAligned &&
            (density === 'spacious'
              ? styles.edgeAlignedSpacious
              : styles.edgeAligned),
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
