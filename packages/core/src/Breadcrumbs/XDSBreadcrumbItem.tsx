'use client';

/**
 * @file XDSBreadcrumbItem.tsx
 * @input Uses React useContext, stylex, theme tokens, BreadcrumbContext
 * @output Exports XDSBreadcrumbItem component and XDSBreadcrumbItemProps
 * @position Individual breadcrumb item; used inside XDSBreadcrumbs
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/Breadcrumbs.doc.mjs
 * - /packages/core/src/Breadcrumbs/XDSBreadcrumbs.test.tsx
 * - /packages/core/src/Breadcrumbs/index.ts
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx
 */


import {useContext, type ReactNode, type MouseEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  lineHeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {BreadcrumbCtx} from './XDSBreadcrumbs';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Props
// =============================================================================

export interface XDSBreadcrumbItemProps {
  /**
   * Custom component to render instead of `<a>` for breadcrumb links.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Only applies for non-current items. Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
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
}

// =============================================================================
// Styles
// =============================================================================

const itemStyles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    lineHeight: lineHeightVars['--leading-snug'],
    margin: 0,
  },
  defaultSize: {
    fontSize: typeScaleVars['--text-body-size'],
  },
  supportingSize: {
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    lineHeight: lineHeightVars['--leading-snug'],
    paddingBlock: spacingVars['--spacing-1'],
    textDecoration: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': 'underline',
      },
    },
    cursor: 'pointer',
  },
  defaultLink: {
    color: colorVars['--color-text-link'],
  },
  supportingLink: {
    color: colorVars['--color-text-secondary'],
  },
  current: {
    fontWeight: 'inherit',
  },
  defaultCurrent: {
    color: colorVars['--color-text-primary'],
  },
  supportingCurrent: {
    color: colorVars['--color-text-secondary'],
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * An individual breadcrumb item. Renders as a link (`<a>`) or a span
 * depending on whether it represents the current page.
 *
 * @example
 * ```
 * <XDSBreadcrumbItem href="/projects">Projects</XDSBreadcrumbItem>
 * <XDSBreadcrumbItem isCurrent>My Project</XDSBreadcrumbItem>
 * ```
 */
export function XDSBreadcrumbItem({
  as,
  children,
  href,
  onClick,
  isCurrent: isCurrentProp,
  startIcon,
  'data-testid': testId,
}: XDSBreadcrumbItemProps) {
  const ctx = useContext(BreadcrumbCtx);
  const isCurrent = isCurrentProp ?? ctx.isAutoLast;
  const LinkComponent = useXDSLinkComponent(as);
  const isSupporting = ctx.variant === 'supporting';

  const content = (
    <>
      {startIcon && <span {...stylex.props(itemStyles.icon)}>{startIcon}</span>}
      {children}
    </>
  );

  if (isCurrent) {
    return (
      <li
        {...mergeProps(
          xdsClassName('breadcrumb-item'),
          stylex.props(
            itemStyles.root,
            isSupporting ? itemStyles.supportingSize : itemStyles.defaultSize,
          ),
        )}
        data-testid={testId}>
        <span
          {...stylex.props(
            itemStyles.contentWrapper,
            itemStyles.current,
            isSupporting
              ? itemStyles.supportingCurrent
              : itemStyles.defaultCurrent,
          )}
          aria-current="page">
          {content}
        </span>
      </li>
    );
  }

  return (
    <li
      {...mergeProps(
        xdsClassName('breadcrumb-item'),
        stylex.props(
          itemStyles.root,
          isSupporting ? itemStyles.supportingSize : itemStyles.defaultSize,
        ),
      )}
      data-testid={testId}>
      <LinkComponent
        href={href}
        onClick={onClick}
        {...stylex.props(
          itemStyles.link,
          isSupporting ? itemStyles.supportingLink : itemStyles.defaultLink,
        )}>
        {content}
      </LinkComponent>
    </li>
  );
}

XDSBreadcrumbItem.displayName = 'XDSBreadcrumbItem';
