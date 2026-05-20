// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTopNavMenu.tsx
 * @input Uses React, StyleX, useXDSHoverCard, XDSTopNavItem tokens
 * @output Exports XDSTopNavMenu component and related types
 * @position Navigation item with hover-triggered overflow menu for XDSTopNav
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/XDSTopNavMenu.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /packages/cli/templates/blocks/components/TopNav/ (showcase blocks)
 */

import {useCallback, useId, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {useXDSMenuHover} from '../hooks/useXDSMenuHover';
import {getIcon} from '../Icon/globalIconRegistry';
import {xdsClassName, mergeProps} from '../utils';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useTopNavSlot} from './TopNavContext';
import {useXDSTopNavRenderMode} from './XDSTopNavRenderContext';
import {useXDSAppShellMobile} from '../AppShell/XDSAppShellMobileContext';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  typeScaleVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  trigger: {
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
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
    border: 'none',
    fontFamily: 'inherit',
  },
  triggerOpen: {
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    minWidth: 280,
    padding: spacingVars['--spacing-1'],
  },
  menuOffset: {
    marginBlockStart: spacingVars['--spacing-1'],
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    border: 'none',
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  menuItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-neutral'],
    flexShrink: 0,
  },
  menuItemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
  },
  menuItemTitle: {
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: typeScaleVars['--text-label-leading'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  menuItemDescription: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
});

const drawerStyles = stylex.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    justifyContent: 'space-between',
    border: 'none',
    background: 'none',
  },
  chevron: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
  items: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  itemsExpanded: {
    gridTemplateRows: '1fr',
  },
  itemsInner: {
    overflow: 'hidden',
    minHeight: 0,
  },
  item: {
    paddingInlineStart: spacingVars['--spacing-6'],
    textDecoration: 'none',
  },
  itemIcon: {
    flexShrink: 0,
    width: 20,
    height: 20,
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  itemDescription: {
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
    fontWeight: fontWeightVars['--font-weight-normal'],
  },
});

// =============================================================================
// Types
// =============================================================================

/**
 * An item in the TopNav overflow menu.
 */
export interface XDSTopNavMenuItemData {
  /**
   * Display title for the menu item.
   */
  title: string;

  /**
   * Optional description text displayed below the title.
   */
  description?: string;

  /**
   * Optional icon element displayed to the left.
   */
  icon?: ReactNode;

  /**
   * URL to navigate to when clicked.
   */
  href?: string;

  /**
   * Callback when item is clicked.
   */
  onClick?: () => void;
}

export interface XDSTopNavMenuProps {
  /**
   * The visible label for the nav item trigger.
   */
  label: string;

  /**
   * Menu items to display in the hover popover.
   */
  items: XDSTopNavMenuItemData[];

  /**
   * Delay before showing the menu on hover (ms).
   * @default 150
   */
  delay?: number;

  /**
   * Delay before hiding the menu after mouse leaves (ms).
   * @default 200
   */
  hideDelay?: number;
}

// =============================================================================
// XDSTopNavMenu
// =============================================================================

/**
 * A navigation item that displays a hover-triggered overflow menu.
 *
 * Renders as a nav item in XDSTopNav's startContent slot. On hover,
 * shows a popover with rich menu items containing an icon, title,
 * and optional description.
 *
 * @example
 * ```
 * <XDSTopNav
 *   startContent={
 *     <>
 *       <XDSTopNavItem label="Home" href="/" isSelected />
 *       <XDSTopNavMenu
 *         label="Products"
 *         items={[
 *           {
 *             title: 'Analytics',
 *             description: 'Track and analyze user behavior',
 *             icon: <ChartBarIcon />,
 *             href: '/products/analytics',
 *           },
 *           {
 *             title: 'Messaging',
 *             description: 'Real-time communication tools',
 *             icon: <ChatBubbleIcon />,
 *             href: '/products/messaging',
 *           },
 *         ]}
 *       />
 *     </>
 *   }
 * />
 * ```
 */

export function XDSTopNavMenu({
  label,
  items,
  delay = 150,
  hideDelay = 200,
}: XDSTopNavMenuProps) {
  const renderMode = useXDSTopNavRenderMode();
  const {closeMobileNav} = useXDSAppShellMobile();
  const LinkComponent = useXDSLinkComponent();
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const menuId = useId();

  const slot = useTopNavSlot();
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const popover = useXDSPopover({
    dialogLabel: label,
    xstyle: styles.menuOffset,
  });

  const {triggerProps, contentProps, menuRef, setTriggerEl} = useXDSMenuHover({
    show: popover.show,
    hide: popover.hide,
    isOpen: popover.isOpen,
    isEnabled: true,
    showDelay: delay,
    hideDelay,
  });

  const setTriggerRef = useCallback(
    (el: HTMLButtonElement | null) => {
      (
        triggerButtonRef as React.MutableRefObject<HTMLButtonElement | null>
      ).current = el;
      popover.triggerRef(el);
      setTriggerEl(el);
    },
    [popover, setTriggerEl],
  );

  // Mobile bar: hide menus entirely
  if (renderMode === 'mobile-bar') {
    return null;
  }

  // Drawer mode: collapsible section
  if (renderMode === 'drawer') {
    return (
      <div {...stylex.props(drawerStyles.section)}>
        <button
          type="button"
          onClick={() => setDrawerExpanded(v => !v)}
          aria-expanded={drawerExpanded}
          aria-controls={`${menuId}-items`}
          {...stylex.props(navItemStyles.item, drawerStyles.header)}>
          {label}
          <span
            {...stylex.props(
              drawerStyles.chevron,
              drawerExpanded && drawerStyles.chevronExpanded,
            )}>
            {getIcon('chevronDown')}
          </span>
        </button>
        <div
          id={`${menuId}-items`}
          {...stylex.props(
            drawerStyles.items,
            drawerExpanded && drawerStyles.itemsExpanded,
          )}>
          <div {...stylex.props(drawerStyles.itemsInner)}>
            {items.map((item, i) => (
              <LinkComponent
                key={i}
                href={item.href}
                onClick={(_e: React.MouseEvent) => {
                  item.onClick?.();
                  closeMobileNav();
                }}
                {...stylex.props(navItemStyles.item, drawerStyles.item)}>
                {item.icon && (
                  <span {...stylex.props(drawerStyles.itemIcon)}>
                    {item.icon}
                  </span>
                )}
                <span {...stylex.props(drawerStyles.itemText)}>
                  {item.title}
                  {item.description && (
                    <span {...stylex.props(drawerStyles.itemDescription)}>
                      {item.description}
                    </span>
                  )}
                </span>
              </LinkComponent>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: desktop popover
  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        {...popover.triggerProps}
        {...triggerProps}
        {...mergeProps(
          xdsClassName('top-nav-menu'),
          stylex.props(styles.trigger, popover.isOpen && styles.triggerOpen),
        )}>
        {label}
        <span
          {...stylex.props(
            styles.chevron,
            popover.isOpen && styles.chevronOpen,
          )}>
          {getIcon('chevronDown')}
        </span>
      </button>
      {popover.render(
        <div
          ref={menuRef as React.RefObject<HTMLDivElement>}
          role="menu"
          aria-label={label}
          {...contentProps}
          {...stylex.props(styles.menuContainer)}>
          {items.map((item, index) => {
            const Element = item.href ? 'a' : 'div';
            return (
              <Element
                key={index}
                role="menuitem"
                tabIndex={popover.isOpen ? 0 : -1}
                href={item.href}
                onClick={item.onClick}
                {...stylex.props(styles.menuItem)}>
                <div {...stylex.props(styles.menuItemIcon)}>{item.icon}</div>
                <div {...stylex.props(styles.menuItemContent)}>
                  <span {...stylex.props(styles.menuItemTitle)}>
                    {item.title}
                  </span>
                  {item.description && (
                    <span {...stylex.props(styles.menuItemDescription)}>
                      {item.description}
                    </span>
                  )}
                </div>
              </Element>
            );
          })}
        </div>,
        {
          placement: 'below',
          alignment: slot,
          xstyle: styles.menuOffset,
        },
      )}
    </>
  );
}

XDSTopNavMenu.displayName = 'XDSTopNavMenu';
