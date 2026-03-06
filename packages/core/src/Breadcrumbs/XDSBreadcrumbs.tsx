/**
 * @file XDSBreadcrumbs.tsx
 * @input Uses React forwardRef, Children, createContext, stylex, theme tokens
 * @output Exports XDSBreadcrumbs component, XDSBreadcrumbsProps, BreadcrumbCtx
 * @position Core container component; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/README.md
 * - /packages/core/src/Breadcrumbs/XDSBreadcrumbs.test.tsx
 * - /packages/core/src/Breadcrumbs/index.ts
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx
 */

'use client';

import {
  forwardRef,
  Children,
  isValidElement,
  createContext,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import type {XDSBreadcrumbItemProps} from './XDSBreadcrumbItem';

// =============================================================================
// Variant type
// =============================================================================

/**
 * Visual variant for the breadcrumb trail.
 * - `'default'`: Standard text styling
 * - `'supporting'`: Smaller, secondary text for supporting context
 */
export type XDSBreadcrumbsVariant = 'default' | 'supporting';

// =============================================================================
// Context shared with XDSBreadcrumbItem
// =============================================================================

/** @internal Context for passing state from XDSBreadcrumbs to XDSBreadcrumbItem. */
export interface BreadcrumbContextValue {
  isAutoLast: boolean;
  variant: XDSBreadcrumbsVariant;
}

export const BreadcrumbCtx = createContext<BreadcrumbContextValue>({
  isAutoLast: false,
  variant: 'default',
});

// =============================================================================
// Props
// =============================================================================

export interface XDSBreadcrumbsProps {
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
   * StyleX styles to apply to the nav container.
   */
  xstyle?: StyleXStyles;
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

const separatorStyles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    color: colorVars['--color-text-secondary'],
    lineHeight: lineHeightVars['--leading-snug'],
    userSelect: 'none',
  },
  defaultSize: {
    fontSize: textSizeVars['--text-sm'],
  },
  supportingSize: {
    fontSize: textSizeVars['--text-xsm'],
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
 * `isCurrent` explicitly set.
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
export const XDSBreadcrumbs = forwardRef<HTMLElement, XDSBreadcrumbsProps>(
  function XDSBreadcrumbs(
    {
      children,
      separator = '/',
      variant = 'default',
      xstyle,
      label = 'Breadcrumb',
      'data-testid': testId,
    },
    ref,
  ) {
    const items = Children.toArray(children);
    const isSupporting = variant === 'supporting';

    // Check if any child has isCurrent explicitly set
    const hasExplicitCurrent = items.some(
      child =>
        isValidElement<XDSBreadcrumbItemProps>(child) &&
        child.props.isCurrent === true,
    );

    const rendered: ReactNode[] = [];

    items.forEach((child, index) => {
      const isLast = index === items.length - 1;

      const ctxValue: BreadcrumbContextValue = {
        isAutoLast: !hasExplicitCurrent && isLast,
        variant,
      };

      rendered.push(
        <BreadcrumbCtx.Provider key={`item-${index}`} value={ctxValue}>
          {child}
        </BreadcrumbCtx.Provider>,
      );

      // Add separator between items (not after the last one)
      if (!isLast) {
        rendered.push(
          <li
            key={`sep-${index}`}
            role="presentation"
            aria-hidden="true"
            {...stylex.props(
              separatorStyles.root,
              isSupporting
                ? separatorStyles.supportingSize
                : separatorStyles.defaultSize,
            )}>
            {separator}
          </li>,
        );
      }
    });

    return (
      <nav
        ref={ref}
        aria-label={label}
        data-testid={testId}
        {...stylex.props(navStyles.root, xstyle)}>
        <ol {...stylex.props(listStyles.root)}>{rendered}</ol>
      </nav>
    );
  },
);

XDSBreadcrumbs.displayName = 'XDSBreadcrumbs';
