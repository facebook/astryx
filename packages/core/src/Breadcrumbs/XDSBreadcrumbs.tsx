'use client';

/**
 * @file XDSBreadcrumbs.tsx
 * @input Uses React, createContext, stylex, theme tokens
 * @output Exports XDSBreadcrumbs component, XDSBreadcrumbsProps, BreadcrumbCtx
 * @position Core container component; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/Breadcrumbs.doc.mjs
 * - /packages/core/src/Breadcrumbs/XDSBreadcrumbs.test.tsx
 * - /packages/core/src/Breadcrumbs/index.ts
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx
 */

import {createContext, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

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

export const BreadcrumbCtx = createContext<BreadcrumbContextValue>({
  variant: 'default',
  separator: '/',
});

// =============================================================================
// Props
// =============================================================================

export interface XDSBreadcrumbsProps {
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
   * Accessible label for the nav landmark.
   * @default 'Breadcrumb'
   */
  label?: string;
  /**
   * Test ID for the nav element.
   */
  'data-testid'?: string;
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
  'data-testid': testId,
  ref,
}: XDSBreadcrumbsProps) {
  const ctxValue: BreadcrumbContextValue = {variant, separator};

  return (
    <BreadcrumbCtx.Provider value={ctxValue}>
      <nav
        ref={ref}
        aria-label={label}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('breadcrumbs', {variant}),
          stylex.props(navStyles.root, xstyle),
          className,
          style,
        )}>
        <ol {...stylex.props(listStyles.root)}>{children}</ol>
      </nav>
    </BreadcrumbCtx.Provider>
  );
}

XDSBreadcrumbs.displayName = 'XDSBreadcrumbs';
