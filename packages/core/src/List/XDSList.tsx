'use client';

/**
 * @file XDSList.tsx
 * @input Uses React, ReactNode, StyleXStyles, theme tokens, XDSListContext
 * @output Exports XDSList component, XDSListProps, XDSListDensity, XDSListStyle types
 * @position Core implementation; consumed by index.ts, tested by XDSList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/List/List.doc.mjs
 * - /packages/core/src/List/XDSList.test.tsx
 * - /packages/core/src/List/index.ts
 * - /apps/storybook/stories/List.stories.tsx
 */

import {useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {
  XDSListContext,
  type XDSListDensity,
  type XDSListMarkerStyle,
} from './XDSListContext';
import {xdsClassName, mergeProps} from '../utils';

export {
  type XDSListDensity,
  type XDSListMarkerStyle as XDSListStyle,
} from './XDSListContext';

export interface XDSListProps extends XDSBaseProps<
  HTMLUListElement | HTMLOListElement
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLUListElement | HTMLOListElement>;
  /**
   * List items. Should be XDSListItem components.
   */
  children: ReactNode;

  /**
   * Spacing density for list items.
   * - 'compact': Tighter spacing for dense UIs
   * - 'balanced': Standard spacing
   * - 'spacious': Extra spacing for readability
   * @default 'balanced'
   */
  density?: XDSListDensity;

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
  listStyle?: XDSListMarkerStyle;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
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
    counterReset: 'xds-list',
  },
  header: {
    marginBottom: spacingVars['--spacing-2'],
  },
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
 * <XDSList>
 *   <XDSListItem label="Notifications" description="Manage your alerts" />
 *   <XDSListItem label="Privacy" description="Control your data" />
 * </XDSList>
 * <XDSList listStyle="decimal" density="compact">
 *   <XDSListItem label="First step" />
 *   <XDSListItem label="Second step" />
 * </XDSList>
 * ```
 */
export function XDSList({
  children,
  density = 'balanced',
  hasDividers = false,
  header,
  listStyle = 'none',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
}: XDSListProps) {
  const headerId = useId();
  const isOrdered = listStyle === 'decimal';
  const Tag = isOrdered ? 'ol' : 'ul';

  const contextValue = useMemo(
    () => ({density, hasDividers, listStyle}),
    [density, hasDividers, listStyle],
  );

  return (
    <XDSListContext.Provider value={contextValue}>
      {header != null && (
        <div id={headerId} {...stylex.props(styles.header)}>
          {header}
        </div>
      )}
      <Tag
        ref={ref as React.Ref<HTMLUListElement & HTMLOListElement>}
        data-testid={testId}
        aria-labelledby={header != null ? headerId : undefined}
        {...(listStyle === 'none' && !isOrdered ? {role: 'list'} : {})}
        {...mergeProps(
          xdsClassName('list', {density, listStyle}),
          stylex.props(
            styles.list,
            hasDividers && styles.withDividers,
            listStyle !== 'none' && styles.withCounter,
            xstyle,
          ),
          className,
          style,
        )}>
        {children}
      </Tag>
    </XDSListContext.Provider>
  );
}

XDSList.displayName = 'XDSList';
