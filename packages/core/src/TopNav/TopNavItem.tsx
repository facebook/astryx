// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavItem.tsx
 * @input Uses React, ReactNode, BaseProps, LinkComponentType
 * @output Exports TopNavItem component and TopNavItemProps
 * @position Navigation item component for TopNav startContent
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /packages/cli/templates/blocks/components/TopNav/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {navItemStyles, type NavItemSize} from '../NavItem/navItemStyles.stylex';
import {mergeProps} from '../utils';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {themeProps} from '../utils/themeProps';

/**
 * NavItem styles with hover/selected states
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1-5'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  selected: {
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    backgroundColor: {
      default: colorVars['--color-neutral'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-neutral'],
      },
      ':active': colorVars['--color-neutral'],
    },
  },
  iconOnly: {
    paddingInline: spacingVars['--spacing-2'],
  },
  // Drawer mode — focus outline (base item + selected come from navItemStyles)
  drawerFocus: {
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
});

export interface TopNavItemProps extends BaseProps<HTMLAnchorElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLAnchorElement>;
  /** Link destination URL. */
  href?: string;
  /** Where to open the linked document. */
  target?: string;
  /** Link relationship. */
  rel?: string;
  /** Causes the browser to download the linked URL. */
  download?: string | boolean;
  /** Referrer policy for the link. */
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
  /**
   * The accessible label for the nav item.
   * Rendered as visible text by default. When `isIconOnly` is true,
   * used as aria-label instead.
   */
  label: string;
  /**
   * Whether this nav item is currently selected/highlighted.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Whether the nav item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Renders the item as a square icon-only element.
   * When true, `label` becomes the aria-label and visible text is hidden.
   * Requires `icon` to be set.
   * @default false
   */
  isIconOnly?: boolean;
  /**
   * Optional icon to display before the label.
   */
  icon?: ReactNode;
  /**
   * Optional content to render instead of the label.
   */
  children?: ReactNode;
  /**
   * Size variant for the nav item. Has no effect in horizontal mode;
   * controls height/padding in drawer mode.
   * @default 'md'
   */
  size?: NavItemSize;
}

/**
 * A navigation item for use within TopNav startContent.
 *
 * Renders as an anchor element with hover/selected states.
 * Supports icons and selected state indication with highlighted appearance.
 *
 * @example
 * ```
 * <TopNav
 *   startContent={
 *     <>
 *       <TopNavItem label="Home" href="/" isSelected />
 *       <TopNavItem label="Products" href="/products" />
 *       <TopNavItem label="Settings" href="/settings" icon={<GearIcon />} isIconOnly />
 *     </>
 *   }
 * />
 * ```
 */
export function TopNavItem({
  as,
  label,
  isSelected = false,
  isDisabled = false,
  isIconOnly = false,
  icon,
  children,
  size = 'md',
  xstyle,
  className,
  style,
  ref,
  ...props
}: TopNavItemProps) {
  const LinkComponent = useLinkComponent(as);
  const renderMode = useTopNavRenderMode();
  const {closeMobileNav} = useAppShellMobile();

  // =========================================================================
  // Drawer mode — render as a SideNavItem-style vertical list element
  // =========================================================================
  if (renderMode === 'drawer') {
    const handleDrawerClick = (e: React.MouseEvent) => {
      if (isDisabled) {
        return;
      }
      // Forward the original onClick if present
      (props as {onClick?: (e: React.MouseEvent) => void}).onClick?.(e);
      closeMobileNav();
    };

    return (
      <LinkComponent
        ref={ref}
        aria-label={isIconOnly ? label : undefined}
        aria-current={isSelected ? 'page' : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...mergeProps(
          themeProps('top-nav-item', {
            mode: 'drawer',
            selected: isSelected ? 'selected' : null,
          }),
          stylex.props(
            navItemStyles.item,
            navItemStyles[size],
            styles.drawerFocus,
            isSelected && navItemStyles.selected,
            isDisabled && navItemStyles.disabled,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}
        onClick={handleDrawerClick}>
        {icon}
        {!isIconOnly && (children ?? label)}
      </LinkComponent>
    );
  }

  // =========================================================================
  // Default / mobile-bar mode — standard horizontal nav item
  // =========================================================================

  return (
    <LinkComponent
      ref={ref}
      aria-label={isIconOnly ? label : undefined}
      aria-current={isSelected ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      {...mergeProps(
        themeProps('top-nav-item', {
          selected: isSelected ? 'selected' : null,
        }),
        stylex.props(
          styles.base,
          isSelected && styles.selected,
          isDisabled && navItemStyles.disabled,
          isIconOnly && styles.iconOnly,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {icon}
      {!isIconOnly && (children ?? label)}
    </LinkComponent>
  );
}

TopNavItem.displayName = 'TopNavItem';
