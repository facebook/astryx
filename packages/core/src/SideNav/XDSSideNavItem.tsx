/**
 * @file XDSSideNavItem.tsx
 * @input Uses React, ReactNode, StyleX, XDSIcon, XDSIconType
 * @output Exports XDSSideNavItem component and XDSSideNavItemProps
 * @position Core implementation; used inside XDSSideNav children
 *
 * Navigation item with icon, selected state, and nesting.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

'use client';

import {useId, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {xdsClassName, mergeProps} from '../utils';
import {XDSTooltip} from '../Tooltip';
import {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    lineHeight: lineHeightVars['--leading-base'],
    textAlign: 'start',
    boxSizing: 'border-box',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-hover-overlay'],
      },
    },
  },
  itemCollapsed: {
    justifyContent: 'center',
    paddingInline: spacingVars['--spacing-1'],
  },
  selected: {
    backgroundColor: colorVars['--color-deemphasized'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-deemphasized'],
      },
    },
  },
  disabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  label: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  endContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  children: {
    paddingInlineStart: spacingVars['--spacing-6'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavItemProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Custom component to render instead of `<a>` for link items.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Only applies when `href` is provided. Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
  /**
   * Item label.
   */
  label: string;
  /**
   * Icon (outline variant).
   */
  icon?: XDSIconType;
  /**
   * Icon when selected (filled variant).
   */
  selectedIcon?: XDSIconType;
  /**
   * Current page indicator.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Navigation URL.
   */
  href?: string;
  /**
   * Click handler.
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Right-side content (badges, counts).
   */
  endContent?: ReactNode;
  /**
   * Sub-items for nesting.
   */
  children?: ReactNode;
  /**
   * Test ID for the item element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Navigation item for XDSSideNav.
 *
 * Supports icons, selected state, nesting, and end content like badges or counts.
 *
 * @example
 * ```
 * <XDSSideNavItem
 *   label="Dashboard"
 *   icon={HomeIcon}
 *   selectedIcon={HomeIconSolid}
 *   isSelected
 *   href="/dashboard"
 * />
 * <XDSSideNavItem label="Settings" icon={CogIcon}>
 *   <XDSSideNavItem label="General" href="/settings/general" />
 *   <XDSSideNavItem label="Security" href="/settings/security" />
 * </XDSSideNavItem>
 * ```
 */
export function XDSSideNavItem({
  as,
  label,
  icon,
  selectedIcon,
  isSelected = false,
  isDisabled = false,
  href,
  onClick,
  endContent,
  children,
  'data-testid': testId,
  ref,
}: XDSSideNavItemProps) {
  const {isCollapsed} = useXDSSideNavCollapse();
  const id = useId();
  const hasChildren = !!children;
  const LinkComponent = useXDSLinkComponent(as);
  const itemRef = useRef<HTMLDivElement>(null);

  const displayIcon = isSelected && selectedIcon ? selectedIcon : icon;

  // In collapsed mode: hide items without icons
  if (isCollapsed && !icon) {
    return <div style={{display: 'none'}} />;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const itemContent = (
    <>
      {displayIcon && (
        <XDSIcon
          icon={displayIcon}
          size="sm"
          color={isSelected ? 'primary' : isDisabled ? 'disabled' : 'secondary'}
        />
      )}
      {!isCollapsed && <span {...stylex.props(styles.label)}>{label}</span>}
      {!isCollapsed && endContent && (
        <span {...stylex.props(styles.endContent)}>{endContent}</span>
      )}
    </>
  );

  const ariaProps = {
    'aria-current': isSelected ? ('page' as const) : undefined,
    'aria-disabled': isDisabled || undefined,
    'data-testid': testId,
  };

  const itemElement =
    href && !isDisabled ? (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={handleClick}
        {...ariaProps}
        {...stylex.props(
          styles.item,
          isCollapsed && styles.itemCollapsed,
          isSelected && styles.selected,
          isDisabled && styles.disabled,
        )}>
        {itemContent}
      </LinkComponent>
    ) : (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        {...ariaProps}
        {...stylex.props(
          styles.item,
          isCollapsed && styles.itemCollapsed,
          isSelected && styles.selected,
          isDisabled && styles.disabled,
        )}>
        {itemContent}
      </button>
    );

  const item = (
    <div
      ref={itemRef}
      {...mergeProps(xdsClassName('side-nav-item'), stylex.props(styles.root))}>
      {itemElement}
      {hasChildren && !isCollapsed && (
        <div
          role="group"
          aria-labelledby={`${id}-label`}
          {...stylex.props(styles.children)}>
          <span id={`${id}-label`} hidden>
            {label}
          </span>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      {item}
      {isCollapsed && (
        <XDSTooltip content={label} placement="end" anchorRef={itemRef} />
      )}
    </>
  );
}

XDSSideNavItem.displayName = 'XDSSideNavItem';
