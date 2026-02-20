/**
 * @file XDSBreadcrumbItem.tsx
 * @input Uses React useContext, stylex, theme tokens, BreadcrumbContext
 * @output Exports XDSBreadcrumbItem component and XDSBreadcrumbItemProps
 * @position Individual breadcrumb item; used inside XDSBreadcrumbs
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Breadcrumbs/README.md
 * - /packages/core/src/Breadcrumbs/XDSBreadcrumbs.test.tsx
 * - /packages/core/src/Breadcrumbs/index.ts
 * - /apps/storybook/stories/Breadcrumbs.stories.tsx
 */

import {useContext, type ReactNode, type MouseEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {BreadcrumbCtx} from './XDSBreadcrumbs';

// =============================================================================
// Props
// =============================================================================

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
}

// =============================================================================
// Styles
// =============================================================================

const itemStyles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
  defaultSize: {
    fontSize: textSizeVars['--text-sm'],
  },
  supportingSize: {
    fontSize: textSizeVars['--text-xsm'],
  },
  contentWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    textDecoration: {
      default: 'none',
      ':hover': 'underline',
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
    display: 'inline-flex',
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
}: XDSBreadcrumbItemProps) {
  const ctx = useContext(BreadcrumbCtx);
  const isCurrent = isCurrentProp ?? ctx.isAutoLast;
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
        {...stylex.props(
          itemStyles.root,
          isSupporting ? itemStyles.supportingSize : itemStyles.defaultSize,
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
      {...stylex.props(
        itemStyles.root,
        isSupporting ? itemStyles.supportingSize : itemStyles.defaultSize,
      )}
      data-testid={testId}>
      <a
        href={href}
        onClick={onClick}
        {...stylex.props(
          itemStyles.link,
          isSupporting ? itemStyles.supportingLink : itemStyles.defaultLink,
        )}>
        {content}
      </a>
    </li>
  );
}

XDSBreadcrumbItem.displayName = 'XDSBreadcrumbItem';
