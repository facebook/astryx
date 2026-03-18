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

import {useCallback, useId, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
  durationVars,
  easingVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {xdsClassName, mergeProps} from '../utils';
import {XDSTooltip} from '../Tooltip';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';
import {getIcon} from '../Icon/globalIconRegistry';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  itemCollapsed: {
    justifyContent: 'center',
    paddingInline: spacingVars['--spacing-1'],
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
  childrenCollapsible: {
    display: 'grid',
    gridTemplateRows: '1fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easingVars['--easing-standard'],
  },
  childrenCollapsed: {
    gridTemplateRows: '0fr',
  },
  childrenInner: {
    overflow: 'hidden',
    minHeight: 0,
    paddingInlineStart: spacingVars['--spacing-6'],
  },
  expandChevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easingVars['--easing-standard'],
    flexShrink: 0,
  },
  expandChevronCollapsed: {
    transform: 'rotate(180deg)',
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
   * Enables collapse behavior for items with children.
   * When true, clicking the item toggles visibility of sub-items.
   *
   * - `true` — collapsible with defaults (starts expanded)
   * - Object — controlled/configured:
   *   - `defaultIsCollapsed` — start collapsed (default: false)
   *   - `isCollapsed` + `onCollapsedChange` — controlled mode
   *
   * @default false
   */
  collapsible?:
    | boolean
    | {
        defaultIsCollapsed?: boolean;
        isCollapsed?: boolean;
        onCollapsedChange?: (isCollapsed: boolean) => void;
      };
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
  collapsible: itemCollapsible,
  'data-testid': testId,
  ref,
}: XDSSideNavItemProps) {
  const {isCollapsed} = useXDSSideNavCollapse();
  const id = useId();
  const hasChildren = !!children;
  const LinkComponent = useXDSLinkComponent(as);
  const itemRef = useRef<HTMLDivElement>(null);

  // Collapse state for items with children
  const itemCollapsibleConfig =
    typeof itemCollapsible === 'object' ? itemCollapsible : {};
  const isItemCollapsible = hasChildren && itemCollapsible !== false;
  const itemControlledCollapsed = itemCollapsibleConfig.isCollapsed;
  const isItemControlled = itemControlledCollapsed !== undefined;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    itemCollapsibleConfig.defaultIsCollapsed ?? false,
  );
  const isItemCollapsed = isItemControlled
    ? itemControlledCollapsed
    : uncontrolledCollapsed;

  const toggleItemCollapse = useCallback(() => {
    const next = !isItemCollapsed;
    if (!isItemControlled) {
      setUncontrolledCollapsed(next);
    }
    itemCollapsibleConfig.onCollapsedChange?.(next);
  }, [isItemCollapsed, isItemControlled, itemCollapsibleConfig]);

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
    if (isItemCollapsible && !isCollapsed) {
      e.preventDefault();
      toggleItemCollapse();
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
      {!isCollapsed && isItemCollapsible && (
        <span
          {...stylex.props(
            styles.expandChevron,
            isItemCollapsed && styles.expandChevronCollapsed,
          )}>
          {getIcon('chevronDown')}
        </span>
      )}
    </>
  );

  const ariaProps = {
    'aria-current': isSelected ? ('page' as const) : undefined,
    'aria-disabled': isDisabled || undefined,
    'aria-expanded': isItemCollapsible ? !isItemCollapsed : undefined,
    'aria-controls': isItemCollapsible ? `${id}-children` : undefined,
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
          navItemStyles.item,
          isCollapsed && styles.itemCollapsed,
          isSelected && navItemStyles.selected,
          isDisabled && navItemStyles.disabled,
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
          navItemStyles.item,
          isCollapsed && styles.itemCollapsed,
          isSelected && navItemStyles.selected,
          isDisabled && navItemStyles.disabled,
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
          id={`${id}-children`}
          role="group"
          aria-labelledby={`${id}-label`}
          aria-hidden={isItemCollapsed}
          {...stylex.props(
            styles.childrenCollapsible,
            isItemCollapsed && styles.childrenCollapsed,
          )}>
          <div {...stylex.props(styles.childrenInner)}>
            <span id={`${id}-label`} hidden>
              {label}
            </span>
            {children}
          </div>
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
