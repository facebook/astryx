// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file BreadcrumbItem.tsx
 * @input Uses React use/useRef/useEffect, stylex, theme tokens, BreadcrumbContext
 * @output Exports BreadcrumbItem component and BreadcrumbItemProps
 * @position Individual breadcrumb item; used inside Breadcrumbs
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/Breadcrumbs.doc.mjs
 * - /packages/core/src/Breadcrumbs/Breadcrumbs.test.tsx
 * - /packages/core/src/Breadcrumbs/index.ts
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx
 * - /packages/cli/templates/blocks/components/Breadcrumbs/ (showcase blocks)
 */

import React, {
  use,
  useRef,
  useEffect,
  type ReactNode,
  type MouseEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, typeScaleVars} from '../theme/tokens.stylex';
import {BreadcrumbContext} from './Breadcrumbs';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Props
// =============================================================================

export interface BreadcrumbItemProps extends Omit<
  BaseProps<HTMLLIElement>,
  'onClick'
> {
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Custom component to render instead of `<a>` for breadcrumb links.
   * Overrides the provider-level default set by LinkProvider.
   * Only applies for non-current items. Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
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
}

// =============================================================================
// Styles
// =============================================================================

const itemStyles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    margin: 0,
    '--separator-display': {
      default: 'flex',
      ':first-child': 'none',
    },
  },
  defaultSize: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  supportingSize: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-1'],
    textDecoration: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': 'underline',
      },
    },
    cursor: 'pointer',
  },
  // Reset native button styles so onClick-only items match link appearance
  buttonReset: {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
  },
  defaultLink: {
    color: colorVars['--color-text-secondary'],
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
  separator: {
    display: 'var(--separator-display)',
    alignItems: 'center',
    color: colorVars['--color-text-secondary'],
    paddingBlock: spacingVars['--spacing-1'],
    userSelect: 'none',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * An individual breadcrumb item. Renders as a link (`<a>`) or a span
 * depending on whether it represents the current page.
 *
 * Each item renders its own leading separator, hidden on :first-child via
 * CSS. Auto-current detection uses a post-render effect that checks the
 * DOM — no React child introspection.
 *
 * @example
 * ```
 * <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
 * <BreadcrumbItem isCurrent>My Project</BreadcrumbItem>
 * ```
 */
export function BreadcrumbItem({
  ref,
  as,
  children,
  href,
  onClick,
  isCurrent: isCurrentProp,
  startIcon,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: BreadcrumbItemProps) {
  const ctx = use(BreadcrumbContext);
  const LinkComponent = useLinkComponent(as);
  const isSupporting = ctx.variant === 'supporting';
  const liRef = useRef<HTMLLIElement>(null);

  const isCurrent = isCurrentProp === true;
  const isAutoCandidate = isCurrentProp == null;

  // Auto-detect: if no sibling has aria-current="page" and this is the last
  // non-separator item, set aria-current on our content element.
  // Runs as useEffect (not layout) — only sets an aria attribute, no visual change.
  useEffect(() => {
    if (!isAutoCandidate) {
      return;
    }

    const li = liRef.current;
    if (!li) {
      return;
    }
    const ol = li.parentElement;
    if (!ol) {
      return;
    }

    // All breadcrumb items (li without aria-hidden are items, with aria-hidden are separators — but we no longer have separator lis)
    const items = Array.from(ol.children) as HTMLElement[];
    const isLast = items.length > 0 && items[items.length - 1] === li;
    const hasExplicit = ol.querySelector('[aria-current="page"]');

    if (isLast && !hasExplicit) {
      li.setAttribute('aria-current', 'page');
    }

    return () => {
      li.removeAttribute('aria-current');
    };
  });

  const content = (
    <>
      {startIcon && <span {...stylex.props(itemStyles.icon)}>{startIcon}</span>}
      {children}
    </>
  );

  if (isCurrent) {
    return (
      <li
        ref={mergeRefs(ref, liRef)}
        {...mergeProps(
          themeProps('breadcrumb-item'),
          stylex.props(
            itemStyles.root,
            isSupporting ? itemStyles.supportingSize : itemStyles.defaultSize,
            xstyle,
          ),
          className,
          style,
        )}
        data-testid={testId}>
        <span aria-hidden="true" {...stylex.props(itemStyles.separator)}>
          {ctx.separator}
        </span>
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

  // Items without isCurrent set render as links (if href) or plain spans.
  // The effect handles adding aria-current for auto-last detection.
  return (
    <li
      ref={mergeRefs(ref, liRef)}
      {...mergeProps(
        themeProps('breadcrumb-item'),
        stylex.props(
          itemStyles.root,
          isSupporting ? itemStyles.supportingSize : itemStyles.defaultSize,
          xstyle,
        ),
        className,
        style,
      )}
      data-testid={testId}>
      <span aria-hidden="true" {...stylex.props(itemStyles.separator)}>
        {ctx.separator}
      </span>
      {href != null ? (
        <LinkComponent
          href={href}
          onClick={onClick}
          {...stylex.props(
            itemStyles.link,
            isSupporting ? itemStyles.supportingLink : itemStyles.defaultLink,
          )}>
          {content}
        </LinkComponent>
      ) : onClick != null ? (
        <button
          type="button"
          onClick={onClick}
          {...stylex.props(
            itemStyles.link,
            itemStyles.buttonReset,
            isSupporting ? itemStyles.supportingLink : itemStyles.defaultLink,
          )}>
          {content}
        </button>
      ) : (
        <span
          {...stylex.props(
            itemStyles.contentWrapper,
            itemStyles.current,
            isSupporting
              ? itemStyles.supportingCurrent
              : itemStyles.defaultCurrent,
          )}>
          {content}
        </span>
      )}
    </li>
  );
}

BreadcrumbItem.displayName = 'BreadcrumbItem';
