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
import {XDSListContext, type XDSListDensity} from './XDSListContext';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

/** List marker style. */
export type XDSListStyle = 'none' | 'disc' | 'decimal' | 'circle';

export {type XDSListDensity} from './XDSListContext';

export interface XDSListProps {
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
  listStyle?: XDSListStyle;

  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;

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
  },
  listWithMarkers: {
    paddingInlineStart: spacingVars['--spacing-6'],
  },
  header: {
    marginBottom: spacingVars['--spacing-2'],
  },
});

const listStyleTypes = stylex.create({
  none: {
    listStyleType: 'none',
  },
  disc: {
    listStyleType: 'disc',
  },
  decimal: {
    listStyleType: 'decimal',
  },
  circle: {
    listStyleType: 'circle',
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
  const hasMarkers = listStyle !== 'none';
  const Tag = isOrdered ? 'ol' : 'ul';

  const contextValue = useMemo(
    () => ({density, hasDividers, hasMarkers}),
    [density, hasDividers, hasMarkers],
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
            listStyleTypes[listStyle],
            hasMarkers && styles.listWithMarkers,
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
