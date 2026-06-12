// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSBreadcrumbs.tsx
 * @input Uses React, createContext, stylex, theme tokens
 * @output Exports XDSBreadcrumbs component, XDSBreadcrumbsProps, BreadcrumbContext
 * @position Core container component; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/Breadcrumbs.doc.mjs
 * - /packages/core/src/Breadcrumbs/XDSBreadcrumbs.test.tsx
 * - /packages/core/src/Breadcrumbs/index.ts
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx
 * - /packages/cli/templates/blocks/components/Breadcrumbs/ (showcase blocks)
 */

import {createContext, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps, xdsProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

// =============================================================================
// Variant type
// =============================================================================

/**
 * Extensible variant map for XDSBreadcrumbs.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Breadcrumbs' {
 *   interface XDSBreadcrumbsVariantMap {
 *     'compact': true;
 *   }
 * }
 * ```
 */
export interface XDSBreadcrumbsVariantMap {
  default: true;
  supporting: true;
}

/**
 * Visual variant for the breadcrumb trail.
 * - `'default'`: Standard text styling
 * - `'supporting'`: Smaller, secondary text for supporting context
 *
 * Extensible via module augmentation of XDSBreadcrumbsVariantMap.
 */
export type XDSBreadcrumbsVariant = keyof XDSBreadcrumbsVariantMap;

// =============================================================================
// Context shared with XDSBreadcrumbItem
// =============================================================================

/** @internal Context for passing variant and separator from XDSBreadcrumbs to XDSBreadcrumbItem. */
export interface BreadcrumbContextValue {
  variant: XDSBreadcrumbsVariant;
  separator: ReactNode;
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  variant: 'default',
  separator: '/',
});
BreadcrumbContext.displayName = 'BreadcrumbContext';

// =============================================================================
// Props
// =============================================================================

export interface XDSBreadcrumbsProps extends XDSBaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * XDSBreadcrumbItem elements to render as breadcrumb trail.
   */
  children: ReactNode;
  /**
   * Separator rendered between items. Decorative only (aria-hidden).
   * @default '/'
   */
  separator?: ReactNode;
  /**
   * Visual variant for the breadcrumb trail.
   * - `'default'`: Standard text styling
   * - `'supporting'`: Smaller, secondary text for supporting context
   * @default 'default'
   */
  variant?: XDSBreadcrumbsVariant;
  /**
   * Accessible label for the nav landmark.
   * @default 'Breadcrumb'
   */
  label?: string;
}

// =============================================================================
// Styles
// =============================================================================

const navStyles = stylex.create({
  root: {
    display: 'block',
  },
});

const listStyles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A navigation breadcrumb trail. Wraps XDSBreadcrumbItem children in
 * semantic `<nav>` + `<ol>` markup with separators between items.
 *
 * Auto-detects the last child as the current page if no item has
 * `isCurrent` explicitly set — handled by each item via DOM inspection,
 * no React child introspection needed.
 *
 * @example
 * ```
 * <XDSBreadcrumbs>
 *   <XDSBreadcrumbItem href="/">Home</XDSBreadcrumbItem>
 *   <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
 *   <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
 * </XDSBreadcrumbs>
 * ```
 */
export function XDSBreadcrumbs({
  children,
  separator = '/',
  variant = 'default',
  xstyle,
  className,
  style,
  label = 'Breadcrumb',
  ref,
  ...rest
}: XDSBreadcrumbsProps) {
  const ctxValue = useMemo<BreadcrumbContextValue>(
    () => ({variant, separator}),
    [variant, separator],
  );

  return (
    <BreadcrumbContext value={ctxValue}>
      <nav
        ref={ref}
        aria-label={label}
        {...mergeProps(
          xdsProps('breadcrumbs', {variant}),
          stylex.props(navStyles.root, xstyle),
          className,
          style,
        )}
        {...rest}>
        <ol {...stylex.props(listStyles.root)}>{children}</ol>
      </nav>
    </BreadcrumbContext>
  );
}

XDSBreadcrumbs.displayName = 'XDSBreadcrumbs';
