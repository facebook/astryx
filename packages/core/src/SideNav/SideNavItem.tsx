// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavItem.tsx
 * @input Uses React, ReactNode, StyleX, Icon, IconType
 * @output Exports SideNavItem component and SideNavItemProps
 * @position Core implementation; used inside SideNav children
 *
 * Navigation item with icon, selected state, and nesting.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  sizeVars,
  fontWeightVars,
  typeScaleVars,
  durationVars,
  easeVars,
  borderVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {renderIconSlot, type IconType} from '../Icon';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {usePopover} from '../Popover/usePopover';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {Tooltip} from '../Tooltip';
import {navItemStyles, type NavItemSize} from '../NavItem/navItemStyles.stylex';
import {
  useSideNavCollapse,
  SideNavCollapseContext,
} from './SideNavCollapseContext';
import {getIcon} from '../Icon/globalIconRegistry';
import {useSideNavRenderMode} from './SideNavRenderContext';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {themeProps} from '../utils/themeProps';

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
    width: sizeVars['--size-element-md'],
    paddingInline: 0,
  },
  itemCollapsedSm: {width: sizeVars['--size-element-sm']},
  itemCollapsedLg: {width: sizeVars['--size-element-lg']},
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
    transitionTimingFunction: easeVars['--ease-standard'],
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
    justifyContent: 'center',
    width: spacingVars['--spacing-6'],
    height: spacingVars['--spacing-6'],
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    flexShrink: 0,
  },
  expandChevronExpanded: {
    transform: 'rotate(180deg)',
  },
  // Standalone toggle button for the chevron when collapsible + href.
  expandToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
    ':active': {
      backgroundColor: colorVars['--color-overlay-pressed'],
    },
  },
  // Primary action element inside the split-action row (link or button).
  // Flex:1 so it fills remaining space, giving a wide click target.
  // Resets both link and button appearance so it blends into the row.
  splitAction: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    flex: 1,
    minWidth: 0,
    color: 'inherit',
    textDecoration: 'none',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  // Popover surface for collapsed items with children
  popoverSurface: {
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
    marginInlineStart: spacingVars['--spacing-1'],
    minWidth: 180,
  },
  popoverHeader: {
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
  },
});

// Non-collapsed state for popover children — ensures nested items render expanded
const EXPANDED_COLLAPSE_STATE = {
  isCollapsed: false,
  toggle: () => {},
  isCollapsible: false,
};

// =============================================================================
// NavItemElement — resolves link vs button based on props
// =============================================================================

interface NavItemElementProps {
  href?: string;
  as?: LinkComponentType;
  isDisabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  ref?: React.Ref<HTMLElement>;
  children: ReactNode;
  [key: string]: unknown;
}

/**
 * Renders `<a>` (via LinkComponent) when `href` is set, otherwise `<button>`.
 * Centralizes the link-vs-button decision used across all SideNavItem paths.
 */
function NavItemElement({
  href,
  as,
  isDisabled,
  onClick,
  ref,
  children,
  ...rest
}: NavItemElementProps) {
  const LinkComponent = useLinkComponent(as);
  if (href && !isDisabled) {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        {...rest}>
        {children}
      </LinkComponent>
    );
  }
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      {...rest}>
      {children}
    </button>
  );
}

// =============================================================================
// Types
// =============================================================================

export interface SideNavItemProps extends BaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Custom component to render instead of `<a>` for link items.
   * Overrides the provider-level default set by LinkProvider.
   * Only applies when `href` is provided. Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
  /**
   * Item label.
   */
  label: string;
  /**
   * Icon (outline variant).
   */
  icon?: ReactNode | IconType;
  /**
   * Icon when selected (filled variant).
   */
  selectedIcon?: ReactNode | IconType;
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
   * Size variant for the nav item.
   * @default 'md'
   */
  size?: NavItemSize;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Navigation item for SideNav.
 *
 * Supports icons, selected state, nesting, and end content like badges or counts.
 *
 * @example
 * ```
 * <SideNavItem
 *   label="Dashboard"
 *   icon={HomeIcon}
 *   selectedIcon={HomeIconSolid}
 *   isSelected
 *   href="/dashboard"
 * />
 * <SideNavItem label="Settings" icon={CogIcon}>
 *   <SideNavItem label="General" href="/settings/general" />
 *   <SideNavItem label="Security" href="/settings/security" />
 * </SideNavItem>
 * ```
 */
export function SideNavItem({
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
  size = 'md',
  'data-testid': testId,
  ref,
}: SideNavItemProps) {
  const {isCollapsed} = useSideNavCollapse();
  const renderMode = useSideNavRenderMode();
  const {closeMobileNav} = useAppShellMobile();
  const isInDrawer = renderMode === 'drawer' || renderMode === 'drawer-content';
  const id = useId();
  const hasChildren = !!children;
  const itemRef = useRef<HTMLDivElement>(null);

  // Popover for collapsed items with children
  const popover = usePopover({
    hasLightDismiss: true,
    hasAutoFocus: true,
    hasCloseButton: false,
    dialogLabel: `${label} submenu`,
  });

  // Collapse state for items with children
  const itemCollapsibleConfig = useMemo(
    () => (typeof itemCollapsible === 'object' ? itemCollapsible : {}),
    [itemCollapsible],
  );
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

  // When collapsible + a primary action (href or onClick), the action and
  // toggle are independent: clicking the label navigates/fires onClick,
  // clicking the chevron expands/collapses children.
  const hasPrimaryAction = !!href || !!onClick;
  const hasIndependentToggle =
    isItemCollapsible && hasPrimaryAction && !isCollapsed;

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    if (isItemCollapsible && !hasIndependentToggle && !isCollapsed) {
      e.preventDefault();
      toggleItemCollapse();
      return;
    }
    onClick?.(e);
    // Close the mobile nav when a nav item is activated inside the drawer
    if (isInDrawer) {
      closeMobileNav();
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItemCollapse();
  };

  // Hover handlers for collapsed popover (mirrors TopNavMenu pattern)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPopoverTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const schedulePopoverShow = useCallback(() => {
    clearPopoverTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      popover.show({skipAutoFocus: true});
    }, 150);
  }, [clearPopoverTimeouts, popover]);

  const schedulePopoverHide = useCallback(() => {
    clearPopoverTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      popover.hide();
    }, 200);
  }, [clearPopoverTimeouts, popover]);

  const handlePopoverMouseEnter = useCallback(() => {
    schedulePopoverShow();
  }, [schedulePopoverShow]);

  const handlePopoverMouseLeave = useCallback(() => {
    schedulePopoverHide();
  }, [schedulePopoverHide]);

  // In collapsed mode: hide items without icons
  if (isCollapsed && !icon) {
    return null;
  }

  // =========================================================================
  // Collapsed mode — icon-only items, popover for items with children
  // =========================================================================
  if (isCollapsed) {
    const collapsedIcon =
      displayIcon &&
      renderIconSlot(displayIcon, {
        size: 'sm',
        color: isSelected ? 'primary' : isDisabled ? 'disabled' : 'secondary',
      });

    // Shared collapsed item styles — used by trigger, link, and button
    const collapsedItemStyles = mergeProps(
      themeProps('side-nav-item', {
        size,
        selected: isSelected ? 'selected' : null,
      }),
      stylex.props(
        navItemStyles.item,
        navItemStyles[size],
        styles.itemCollapsed,
        size === 'sm' && styles.itemCollapsedSm,
        size === 'lg' && styles.itemCollapsedLg,
        isSelected && navItemStyles.selected,
        isDisabled && navItemStyles.disabled,
      ),
    );

    // Items with children: popover trigger + popover
    if (hasChildren) {
      return (
        <div {...stylex.props(styles.root)}>
          <button
            ref={mergeRefs(ref, popover.triggerRef)}
            type="button"
            onClick={popover.toggle}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            aria-label={label}
            data-testid={testId}
            {...popover.triggerProps}
            {...collapsedItemStyles}>
            {collapsedIcon}
          </button>
          {popover.render(
            <div
              {...stylex.props(styles.popoverSurface)}
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              onClick={() => popover.hide()}>
              <div {...stylex.props(styles.popoverHeader)}>{label}</div>
              <SideNavCollapseContext value={EXPANDED_COLLAPSE_STATE}>
                {children}
              </SideNavCollapseContext>
            </div>,
            {placement: 'end', alignment: 'start'},
          )}
        </div>
      );
    }

    // Items without children: icon-only link/button with tooltip
    const collapsedAriaProps = {
      'aria-current': isSelected ? ('page' as const) : undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-label': label,
      'data-testid': testId,
    };

    const collapsedElement = (
      <NavItemElement
        ref={ref}
        href={href}
        as={as}
        isDisabled={isDisabled}
        onClick={handleClick}
        {...collapsedAriaProps}
        {...collapsedItemStyles}>
        {collapsedIcon}
      </NavItemElement>
    );

    return (
      <div ref={itemRef} {...stylex.props(styles.root)}>
        {collapsedElement}
        <Tooltip content={label} placement="end" anchorRef={itemRef} />
      </div>
    );
  }

  const itemContent = (
    <>
      {displayIcon &&
        renderIconSlot(displayIcon, {
          size: 'sm',
          color: isSelected ? 'primary' : isDisabled ? 'disabled' : 'secondary',
        })}
      {!isCollapsed && <span {...stylex.props(styles.label)}>{label}</span>}
      {!isCollapsed && endContent && (
        <span {...stylex.props(styles.endContent)}>{endContent}</span>
      )}
      {!isCollapsed && isItemCollapsible && !hasIndependentToggle && (
        <span
          {...stylex.props(
            styles.expandChevron,
            !isItemCollapsed && styles.expandChevronExpanded,
          )}>
          {getIcon('chevronDown')}
        </span>
      )}
    </>
  );

  const navItemStyleProps = mergeProps(
    themeProps('side-nav-item', {
      size,
      selected: isSelected ? 'selected' : null,
    }),
    stylex.props(
      navItemStyles.item,
      navItemStyles[size],
      isSelected && navItemStyles.selected,
      isDisabled && navItemStyles.disabled,
    ),
  );

  // ── Split-action path: <div> row with <a> + <button> as siblings ──
  //
  // When both collapsible and href are set, we can't nest a <button>
  // inside an <a>. Instead we use a <div> as the flex row container,
  // an <a display:contents> for the link (with ::before covering the row),
  // and a <button> sibling lifted above the overlay via z-index.

  // ── Split-action path: primary element + toggle button as siblings ──
  //
  // When collapsible and a primary action (href or onClick) are both set,
  // we render a <div> row with the primary element and chevron toggle as
  // siblings. This avoids nesting interactive elements (<button> inside <a>).

  let itemElement;

  if (hasIndependentToggle) {
    itemElement = (
      <div data-testid={testId} {...navItemStyleProps}>
        <NavItemElement
          ref={ref}
          href={href}
          as={as}
          isDisabled={isDisabled}
          onClick={handleClick}
          aria-current={isSelected ? ('page' as const) : undefined}
          {...stylex.props(styles.splitAction)}>
          {itemContent}
        </NavItemElement>
        <button
          type="button"
          onClick={handleToggleClick}
          aria-label={isItemCollapsed ? `Expand ${label}` : `Collapse ${label}`}
          aria-expanded={!isItemCollapsed}
          aria-controls={`${id}-children`}
          {...stylex.props(styles.expandToggle)}>
          <span
            {...stylex.props(
              styles.expandChevron,
              !isItemCollapsed && styles.expandChevronExpanded,
            )}>
            {getIcon('chevronDown')}
          </span>
        </button>
      </div>
    );
  } else {
    const ariaProps = {
      'aria-current': isSelected ? ('page' as const) : undefined,
      'aria-disabled': isDisabled || undefined,
      'aria-expanded': isItemCollapsible ? !isItemCollapsed : undefined,
      'aria-controls': isItemCollapsible ? `${id}-children` : undefined,
      'data-testid': testId,
    };

    itemElement = (
      <NavItemElement
        ref={ref}
        href={href}
        as={as}
        isDisabled={isDisabled}
        onClick={handleClick}
        {...ariaProps}
        {...navItemStyleProps}>
        {itemContent}
      </NavItemElement>
    );
  }

  const item = (
    <div ref={itemRef} {...stylex.props(styles.root)}>
      {itemElement}
      {hasChildren && !isCollapsed && (
        <div
          id={`${id}-children`}
          role="group"
          aria-labelledby={`${id}-label`}
          aria-hidden={isItemCollapsed}
          inert={isItemCollapsed ? true : undefined}
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

  return item;
}

SideNavItem.displayName = 'SideNavItem';
