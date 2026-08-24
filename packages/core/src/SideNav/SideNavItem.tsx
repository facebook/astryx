// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavItem.tsx
 * @input Uses React, ReactNode, StyleX, Icon, IconType, useMenuHover
 * @output Exports SideNavItem component and SideNavItemProps
 * @position Core implementation; used inside SideNav children
 *
 * Navigation item with icon, selected state, and nesting.
 *
 * Collapsed items with children open their submenu flyout through
 * `useMenuHover`, the shared hover-intent hook (same one `SideNavHeading` and
 * `TopNavMenu` use). Hover is a progressive enhancement over the popover's
 * click behavior and is inert on coarse pointers.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
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
  radiusVars,
} from '../theme/tokens.stylex';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {usePopover} from '../Popover/usePopover';
import {useMenuHover} from '../hooks/useMenuHover';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {Tooltip} from '../Tooltip';
import {navItemStyles, type NavItemSize} from '../NavItem/navItemStyles.stylex';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {
  useSideNavCollapse,
  SideNavCollapseContext,
} from './SideNavCollapseContext';
import {useSideNavRenderMode} from './SideNavRenderContext';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

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
    transitionDuration: {
      default: durationVars['--duration-medium'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
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
    // Icon's `lg` would also set font-size: 1.5rem, and the registry chevron
    // is a 1em SVG — that would blow the glyph up from the 14px it inherits
    // from the row to the full 24px box. The 24px box is the touch/alignment
    // target, not the glyph size, so keep the glyph on the inherited size.
    fontSize: 'inherit',
    transitionProperty: 'transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    borderRadius: radiusVars['--radius-element'],
    ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
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
  // `alignSelf: stretch` makes it fill the row's height too — without it the
  // element collapses to its line box (20px), under the 24px WCAG 2.5.8
  // target-size floor even though the row it sits in is 32px tall.
  // Resets both link and button appearance so it blends into the row.
  splitAction: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'stretch',
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
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  // No border and no background: `usePopover` paints the panel this renders
  // into. Drawing a second surface here put square corners inside its rounded
  // ones. The radius matches so a theme retargeting `--radius-container`
  // keeps the two in step.
  popoverSurface: {
    borderRadius: radiusVars['--radius-container'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
    minWidth: 180,
  },
  // The gap from the rail belongs on the positioned layer, where
  // `DropdownMenu` keeps it. On the content div it insets the content instead,
  // leaving the panel flush against the rail.
  popoverGap: {
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: spacingVars['--spacing-1'],
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
  xstyle,
  ...rest
}: SideNavItemProps) {
  const t = useTranslator();
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
    dialogLabel: t('@astryx.sideNavItem.submenuLabel', {label}),
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

  // Pointer half only. The hook's `onKeyDown`/`menuRef` drive a `useListFocus`
  // over `[role="menuitem"]`, and this flyout is a focus-trapped dialog of
  // links — wiring them would swallow arrow keys rather than navigate with
  // them. Keyboard stays with `usePopover`'s trap, as in DropdownMenuSubMenu.
  const {triggerProps: hoverTriggerProps, contentProps: hoverContentProps} =
    useMenuHover({
      show: popover.show,
      hide: popover.hide,
      isOpen: popover.isOpen,
      isEnabled: isCollapsed && hasChildren,
      // Standard popover toggling: the flyout opens beside the rail, not over
      // the icon, so the click after a hover-open is a deliberate dismissal
      // rather than the #3121 confirmation the nav menus need.
      clickGuardMs: 0,
      ownsFocus: false,
    });

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
        // `inherit` so a selected row's icon follows the row to HighlightText
        // under forced colors. Identical to `primary` otherwise: both token
        // families are emitted from one expression.
        color: isSelected ? 'inherit' : isDisabled ? 'disabled' : 'secondary',
      });

    // Shared collapsed item styles — used by trigger, link, and button.
    // All three render a focusable element, so each draws the shared ring.
    const collapsedItemStyles = mergeProps(
      themeProps('side-nav-item', {
        size,
        selected: isSelected ? 'selected' : null,
        disabled: isDisabled ? 'disabled' : null,
      }),
      focusOutlineProps.focusVisible(
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
        <div {...stylex.props(styles.root, xstyle)}>
          <button
            ref={mergeRefs(ref, popover.triggerRef)}
            type="button"
            {...rest}
            {...hoverTriggerProps}
            aria-label={label}
            data-testid={testId}
            {...popover.triggerProps}
            {...collapsedItemStyles}>
            {collapsedIcon}
          </button>
          {popover.render(
            <div
              {...stylex.props(styles.popoverSurface)}
              onMouseEnter={hoverContentProps.onMouseEnter}
              onMouseLeave={hoverContentProps.onMouseLeave}
              onClick={() => popover.hide()}>
              <div {...stylex.props(styles.popoverHeader)}>{label}</div>
              <SideNavCollapseContext value={EXPANDED_COLLAPSE_STATE}>
                {children}
              </SideNavCollapseContext>
            </div>,
            {placement: 'end', alignment: 'start', xstyle: styles.popoverGap},
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
        {...rest}
        {...collapsedAriaProps}
        {...collapsedItemStyles}>
        {collapsedIcon}
      </NavItemElement>
    );

    return (
      <div ref={itemRef} {...stylex.props(styles.root, xstyle)}>
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
          // `inherit` — see the collapsed path above.
          color: isSelected ? 'inherit' : isDisabled ? 'disabled' : 'secondary',
        })}
      {!isCollapsed && <span {...stylex.props(styles.label)}>{label}</span>}
      {!isCollapsed && endContent && (
        <span {...stylex.props(styles.endContent)}>{endContent}</span>
      )}
      {!isCollapsed && isItemCollapsible && !hasIndependentToggle && (
        <Icon
          icon="chevronDown"
          size="lg"
          color="inherit"
          xstyle={[
            styles.expandChevron,
            !isItemCollapsed && styles.expandChevronExpanded,
          ]}
        />
      )}
    </>
  );

  const itemThemeProps = themeProps('side-nav-item', {
    size,
    selected: isSelected ? 'selected' : null,
    disabled: isDisabled ? 'disabled' : null,
  });

  const itemStyleArgs = [
    navItemStyles.item,
    navItemStyles[size],
    isSelected && navItemStyles.selected,
    isDisabled && navItemStyles.disabled,
  ] as const;

  // Two shapes of the same row appearance:
  // - `rowProps` for the split-action path, where the row is a plain <div>
  //   container and its children take focus (so the ring belongs on them);
  // - `focusableRowProps` for every other path, where the row element is
  //   itself the focusable control.
  const rowProps = mergeProps(itemThemeProps, stylex.props(...itemStyleArgs));
  const focusableRowProps = mergeProps(
    itemThemeProps,
    focusOutlineProps.focusVisible(...itemStyleArgs),
  );

  // Split-action path: collapsible plus a primary action renders the primary
  // element and the chevron toggle as siblings in a <div> row, since a
  // <button> cannot nest inside an <a>.
  let itemElement;

  if (hasIndependentToggle) {
    itemElement = (
      <div data-testid={testId} {...rowProps}>
        <NavItemElement
          ref={ref}
          href={href}
          as={as}
          isDisabled={isDisabled}
          onClick={handleClick}
          {...rest}
          aria-current={isSelected ? ('page' as const) : undefined}
          {...focusOutlineProps.focusVisible(styles.splitAction)}>
          {itemContent}
        </NavItemElement>
        <button
          type="button"
          onClick={handleToggleClick}
          aria-label={
            isItemCollapsed
              ? t('@astryx.sideNavItem.expand', {label})
              : t('@astryx.sideNavItem.collapse', {label})
          }
          aria-expanded={!isItemCollapsed}
          aria-controls={`${id}-children`}
          {...focusOutlineProps.focusVisible(styles.expandToggle)}>
          <Icon
            icon="chevronDown"
            size="lg"
            color="inherit"
            xstyle={[
              styles.expandChevron,
              !isItemCollapsed && styles.expandChevronExpanded,
            ]}
          />
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
        {...rest}
        {...ariaProps}
        {...focusableRowProps}>
        {itemContent}
      </NavItemElement>
    );
  }

  const item = (
    <div ref={itemRef} {...stylex.props(styles.root, xstyle)}>
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
