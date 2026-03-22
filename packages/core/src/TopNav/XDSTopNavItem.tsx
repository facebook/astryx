'use client';

/**
 * @file XDSTopNavItem.tsx
 * @input Uses React, AnchorHTMLAttributes, ReactNode
 * @output Exports XDSTopNavItem component and XDSTopNavItemProps
 * @position Navigation item component for XDSTopNav startContent
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 */


import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  lineHeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {useXDSTopNavRenderMode} from './XDSTopNavRenderContext';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * NavItem styles with hover/selected states
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-2'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: lineHeightVars['--leading-base'],
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
      ':focus-visible': `2px solid ${colorVars['--color-ring-focus']}`,
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
      default: colorVars['--color-muted'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-muted'],
      },
      ':active': colorVars['--color-muted'],
    },
  },
  iconOnly: {
    paddingInline: spacingVars['--spacing-2'],
  },
  // Drawer mode — focus outline (base item + selected come from navItemStyles)
  drawerFocus: {
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-ring-focus']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
});

export interface XDSTopNavItemProps extends XDSBaseProps<HTMLAnchorElement> {
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
   * Overrides the provider-level default set by XDSLinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
  /**
   * The accessible label for the nav item.
   * Used as visible text, or as aria-label for icon-only items.
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
   * Optional icon to display before the label.
   * If provided without children, item becomes icon-only.
   */
  icon?: ReactNode;
  /**
   * Optional content to render instead of the label.
   * If omitted and icon is provided, item becomes icon-only.
   */
  children?: ReactNode;
}

/**
 * A navigation item for use within XDSTopNav startContent.
 *
 * Renders as an anchor element with hover/selected states.
 * Supports icons and selected state indication with highlighted appearance.
 *
 * @example
 * ```
 * <XDSTopNav
 *   startContent={
 *     <>
 *       <XDSTopNavItem label="Home" href="/" isSelected />
 *       <XDSTopNavItem label="Products" href="/products" />
 *       <XDSTopNavItem label="Settings" href="/settings" icon={<GearIcon />} />
 *     </>
 *   }
 * />
 * ```
 */
export function XDSTopNavItem({
  as,
  label,
  isSelected = false,
  isDisabled = false,
  icon,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSTopNavItemProps) {
  const LinkComponent = useXDSLinkComponent(as);
  const renderMode = useXDSTopNavRenderMode();
  const isIconOnly = icon != null && children == null && !label;
  const showLabel = !isIconOnly;

  // =========================================================================
  // Drawer mode — render as a SideNavItem-style vertical list element
  // =========================================================================
  if (renderMode === 'drawer') {
    return (
      <LinkComponent
        ref={ref}
        aria-current={isSelected ? 'page' : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...mergeProps(
          xdsClassName('top-nav-item', {mode: 'drawer'}),
          stylex.props(
            navItemStyles.item,
            styles.drawerFocus,
            isSelected && navItemStyles.selected,
            isDisabled && navItemStyles.disabled,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {icon}
        {children ?? label}
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
        xdsClassName('top-nav-item'),
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
      {showLabel && (children ?? label)}
    </LinkComponent>
  );
}

XDSTopNavItem.displayName = 'XDSTopNavItem';
