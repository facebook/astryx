/**
 * @file XDSSideNavItem.tsx
 * @input Uses React, ReactNode, StyleX, XDSIcon, XDSIconType, useXDSPopover, useXDSSideNavCollapse
 * @output Exports XDSSideNavItem component and XDSSideNavItemProps
 * @position Core implementation; used inside XDSSideNav children
 *
 * Navigation item with icon, selected state, and nesting.
 * In collapsed mode with children, renders a popover to access sub-items.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

'use client';

import {useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
  elevationVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {xdsClassName, mergeProps} from '../utils';
import {
  useXDSSideNavCollapse,
  XDSSideNavCollapseProvider,
} from './XDSSideNavCollapseContext';

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
  },
  itemHover: {
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-hover-overlay'],
      },
    },
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
  // Collapsed mode: icon-only button
  collapsedItem: {
    justifyContent: 'center',
    paddingInline: spacingVars['--spacing-2'],
  },
  // Popover surface for collapsed sub-items
  popoverSurface: {
    backgroundColor: colorVars['--color-surface'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: elevationVars['--elevation-menu'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
    minWidth: 180,
  },
  // Label inside popover header
  popoverHeader: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    lineHeight: lineHeightVars['--leading-snug'],
  },
});

// =============================================================================
// Non-collapsed default context value — used inside popovers to ensure
// children render in expanded form even though the parent SideNav is collapsed.
// =============================================================================

const EXPANDED_COLLAPSE_STATE = {
  isCollapsed: false,
  toggle: () => {},
  isCollapsible: false,
};

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
 * In collapsed mode, items with children show a popover on click to access sub-items.
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
  const id = useId();
  const hasChildren = !!children;
  const LinkComponent = useXDSLinkComponent(as);
  const {isCollapsed} = useXDSSideNavCollapse();

  const displayIcon = isSelected && selectedIcon ? selectedIcon : icon;

  // Popover for collapsed items with children
  const popover = useXDSPopover({
    hasLightDismiss: true,
    hasAutoFocus: true,
    hasCloseButton: false,
    dialogLabel: `${label} submenu`,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // =========================================================================
  // Collapsed mode
  // =========================================================================
  if (isCollapsed) {
    // Hide items without icons in collapsed mode
    if (!icon) {
      return null;
    }

    // Collapsed item with children: render popover trigger + popover
    if (hasChildren) {
      return (
        <div
          {...mergeProps(
            xdsClassName('side-nav-item'),
            stylex.props(styles.root),
          )}>
          <button
            ref={el => {
              popover.triggerRef(el);
              if (typeof ref === 'function') {
                ref(el);
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLElement | null>).current =
                  el;
              }
            }}
            type="button"
            onClick={popover.toggle}
            aria-label={label}
            data-testid={testId}
            {...popover.triggerProps}
            {...stylex.props(
              styles.item,
              styles.itemHover,
              styles.collapsedItem,
              isSelected && styles.selected,
              isDisabled && styles.disabled,
            )}>
            {displayIcon && (
              <XDSIcon
                icon={displayIcon}
                size="sm"
                color={
                  isSelected ? 'primary' : isDisabled ? 'disabled' : 'secondary'
                }
              />
            )}
          </button>
          {popover.render(
            <div
              {...stylex.props(styles.popoverSurface)}
              onClick={() => popover.hide()}>
              <div {...stylex.props(styles.popoverHeader)}>{label}</div>
              <XDSSideNavCollapseProvider value={EXPANDED_COLLAPSE_STATE}>
                {children}
              </XDSSideNavCollapseProvider>
            </div>,
            {placement: 'end', alignment: 'start'},
          )}
        </div>
      );
    }

    // Collapsed item without children: icon-only button/link
    const collapsedContent = displayIcon && (
      <XDSIcon
        icon={displayIcon}
        size="sm"
        color={isSelected ? 'primary' : isDisabled ? 'disabled' : 'secondary'}
      />
    );

    const collapsedAriaProps = {
      'aria-current': isSelected ? ('page' as const) : undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-label': label,
      'data-testid': testId,
    };

    const collapsedElement =
      href && !isDisabled ? (
        <LinkComponent
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={handleClick}
          {...collapsedAriaProps}
          {...stylex.props(
            styles.item,
            styles.itemHover,
            styles.collapsedItem,
            isSelected && styles.selected,
            isDisabled && styles.disabled,
          )}>
          {collapsedContent}
        </LinkComponent>
      ) : (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleClick}
          disabled={isDisabled}
          {...collapsedAriaProps}
          {...stylex.props(
            styles.item,
            styles.itemHover,
            styles.collapsedItem,
            isSelected && styles.selected,
            isDisabled && styles.disabled,
          )}>
          {collapsedContent}
        </button>
      );

    return (
      <div
        {...mergeProps(
          xdsClassName('side-nav-item'),
          stylex.props(styles.root),
        )}>
        {collapsedElement}
      </div>
    );
  }

  // =========================================================================
  // Expanded mode (default)
  // =========================================================================
  const itemContent = (
    <>
      {displayIcon && (
        <XDSIcon
          icon={displayIcon}
          size="sm"
          color={isSelected ? 'primary' : isDisabled ? 'disabled' : 'secondary'}
        />
      )}
      <span {...stylex.props(styles.label)}>{label}</span>
      {endContent && (
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
          styles.itemHover,
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
          styles.itemHover,
          isSelected && styles.selected,
          isDisabled && styles.disabled,
        )}>
        {itemContent}
      </button>
    );

  return (
    <div
      {...mergeProps(xdsClassName('side-nav-item'), stylex.props(styles.root))}>
      {itemElement}
      {hasChildren && (
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
}

XDSSideNavItem.displayName = 'XDSSideNavItem';
