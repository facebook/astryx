/**
 * @file XDSBreadcrumbs.tsx
 * @input Uses React forwardRef, Children, cloneElement, stylex, theme tokens
 * @output Exports XDSBreadcrumbs, XDSBreadcrumbItem components and their prop types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/README.md (props table, features, implementation notes)
 * - /packages/core/src/Breadcrumbs/XDSBreadcrumbs.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Breadcrumbs/index.ts (exports if types change)
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  Children,
  isValidElement,
  cloneElement,
  type ReactNode,
  type MouseEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

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

export interface XDSBreadcrumbItemProps {
  /**
   * Label content of the breadcrumb item.
   */
  children: ReactNode;
  /**
   * URL for the breadcrumb link. Omit for the current page.
   */
  href?: string;
  /**
   * Click handler. Works with or without href.
   */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /**
   * Marks this item as the current page. Renders as a span with aria-current="page".
   * If not set on any item, the last item is auto-detected as current.
   * @default false
   */
  isCurrent?: boolean;
  /**
   * Optional icon rendered before the label.
   */
  startIcon?: ReactNode;
  /**
   * Test ID for the list item.
   */
  'data-testid'?: string;
  /**
   * @internal Used by XDSBreadcrumbs to auto-detect the last item.
   */
  _isLast?: boolean;
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
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    userSelect: 'none',
  },
});

const itemStyles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  link: {
    color: colorVars['--color-text-link'],
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
    },
    cursor: 'pointer',
  },
  current: {
    color: colorVars['--color-text-primary'],
    fontWeight: 'inherit',
  },
  icon: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  },
});

// =============================================================================
// XDSBreadcrumbItem
// =============================================================================

/**
 * An individual breadcrumb item. Renders as a link (`<a>`) or a span
 * depending on whether it represents the current page.
 *
 * @example
 * ```tsx
 * <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
 * <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
 * ```
 */
export function XDSBreadcrumbItem({
  children,
  href,
  onClick,
  isCurrent: isCurrentProp,
  startIcon,
  'data-testid': testId,
  _isLast,
}: XDSBreadcrumbItemProps) {
  // If isCurrent is explicitly set, use it. Otherwise, auto-detect from _isLast.
  const isCurrent = isCurrentProp ?? _isLast === true;

  const content = (
    <>
      {startIcon && <span {...stylex.props(itemStyles.icon)}>{startIcon}</span>}
      {children}
    </>
  );

  if (isCurrent) {
    return (
      <li {...stylex.props(itemStyles.root)} data-testid={testId}>
        <span {...stylex.props(itemStyles.current)} aria-current="page">
          {content}
        </span>
      </li>
    );
  }

  return (
    <li {...stylex.props(itemStyles.root)} data-testid={testId}>
      <a href={href} onClick={onClick} {...stylex.props(itemStyles.link)}>
        {content}
      </a>
    </li>
  );
}

XDSBreadcrumbItem.displayName = 'XDSBreadcrumbItem';

// =============================================================================
// XDSBreadcrumbs
// =============================================================================

/**
 * A navigation breadcrumb trail. Wraps XDSBreadcrumbItem children in
 * semantic `<nav>` + `<ol>` markup with separators between items.
 *
 * Auto-detects the last child as the current page if no item has
 * `isCurrent` explicitly set.
 *
 * @example
 * ```tsx
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
      xstyle,
      label = 'Breadcrumb',
      'data-testid': testId,
    },
    ref,
  ) {
    const items = Children.toArray(children);

    // Check if any child has isCurrent explicitly set
    const hasExplicitCurrent = items.some(
      child =>
        isValidElement<XDSBreadcrumbItemProps>(child) &&
        child.props.isCurrent === true,
    );

    const rendered: ReactNode[] = [];

    items.forEach((child, index) => {
      // Clone the last child with _isLast if no explicit isCurrent exists
      if (
        !hasExplicitCurrent &&
        index === items.length - 1 &&
        isValidElement<XDSBreadcrumbItemProps>(child)
      ) {
        rendered.push(cloneElement(child, {_isLast: true, key: child.key}));
      } else {
        rendered.push(child);
      }

      // Add separator between items (not after the last one)
      if (index < items.length - 1) {
        rendered.push(
          <li
            key={`sep-${index}`}
            role="presentation"
            aria-hidden="true"
            {...stylex.props(separatorStyles.root)}>
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
