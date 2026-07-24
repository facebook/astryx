// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMenu.tsx
 * @input Uses React, StyleX, usePopover, useMenuHover, useListFocus,
 *   useTypeahead, TopNavItem tokens
 * @output Exports TopNavMenu component and related types
 * @position Navigation item with hover-triggered overflow menu for TopNav
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/TopNavMenu.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /packages/cli/templates/blocks/components/TopNav/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {usePopover} from '../Popover/usePopover';
import {useMenuHover} from '../hooks/useMenuHover';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {getIcon} from '../Icon/globalIconRegistry';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useTopNavSlot} from './TopNavContext';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {useLinkComponent} from '../Link/useLinkComponent';
import {themeProps} from '../utils/themeProps';
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
export interface TopNavMenuItemData {
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

function getMenuItemKey(item: TopNavMenuItemData): string {
  return item.title;
}

export interface TopNavMenuProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * The visible label for the nav item trigger.
   */
  label: string;

  /**
   * Menu items to display in the hover popover.
   */
  items: TopNavMenuItemData[];

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
// TopNavMenu
// =============================================================================

/**
 * A navigation item that displays a hover-triggered overflow menu.
 *
 * Renders as a nav item in TopNav's startContent slot. On hover,
 * shows a popover with rich menu items containing an icon, title,
 * and optional description.
 *
 * @example
 * ```
 * <TopNav
 *   startContent={
 *     <>
 *       <TopNavItem label="Home" href="/" isSelected />
 *       <TopNavMenu
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

export function TopNavMenu({
  ref,
  label,
  items,
  delay = 150,
  hideDelay = 200,
}: TopNavMenuProps) {
  const renderMode = useTopNavRenderMode();
  const {closeMobileNav} = useAppShellMobile();
  const LinkComponent = useLinkComponent();
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const menuId = useId();

  const slot = useTopNavSlot();
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  const popover = usePopover({
    // The popup's own role="menu" is the exposed semantics; a modal dialog
    // wrapper would announce an unnamed dialog around the menu and make the
    // trigger claim aria-haspopup="dialog" for menu content (see TabMenu).
    role: 'none',
    xstyle: styles.menuOffset,
  });

  const {triggerProps, contentProps, menuRef, setTriggerEl} =
    useMenuHover<HTMLDivElement>({
      show: popover.show,
      hide: popover.hide,
      isOpen: popover.isOpen,
      isEnabled: true,
      showDelay: delay,
      hideDelay,
    });

  const setTriggerRef = mergeRefs<HTMLButtonElement>(
    triggerButtonRef,
    popover.triggerRef,
    setTriggerEl,
    ref,
  );

  // The desktop popup is a composite menu widget per the APG menu pattern:
  // a single roving tab stop with ArrowUp/ArrowDown traversal (wrapping),
  // Home/End, and first-character typeahead. The hook owns item tabindex —
  // items render tabIndex={-1} and exactly one is promoted to 0. The
  // composition mirrors NavHeadingMenu.
  const {listRef, handleKeyDown, handleFocus, focusItem} =
    useListFocus<HTMLDivElement>({
      itemSelector: '[role="menuitem"]',
      hasRovingTabIndex: true,
      onEscape: popover.hide,
    });

  // First-character typeahead over the menu items (menus-11).
  const getMenuItems = useCallback(
    (): HTMLElement[] =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
          )
        : [],
    [listRef],
  );
  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getMenuItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
  });

  // Extend useListFocus with Enter/Space activation. Items rendered without an
  // `href` are `<div role="menuitem">` elements, which have no native keyboard
  // activation — without this, Enter/Space on a focused onClick-only item does
  // nothing. Anchor items (with `href`) already activate on Enter natively.
  const menuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement as HTMLElement | null;
        if (focused?.getAttribute('role') === 'menuitem') {
          e.preventDefault();
          focused.click();
          return;
        }
      }
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      handleKeyDown(e);
    },
    [handleKeyDown, typeahead],
  );

  // Menu container carries both the hover hook's ref (for its open/close
  // focus management) and the list-focus ref (for roving tabindex/typeahead).
  const setMenuRef = mergeRefs<HTMLDivElement>(menuRef, listRef);

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
            {items.map(item => (
              <LinkComponent
                key={getMenuItemKey(item)}
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
          themeProps('top-nav-menu'),
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
          ref={setMenuRef}
          role="menu"
          aria-label={label}
          {...contentProps}
          // After the contentProps spread so the full APG composition (roving
          // tabindex + typeahead + Enter/Space activation) replaces the hover
          // hook's basic arrow-key handler.
          onKeyDown={menuKeyDown}
          onFocus={handleFocus}
          {...stylex.props(styles.menuContainer)}>
          {items.map(item => {
            const Element = item.href ? 'a' : 'div';
            return (
              <Element
                key={getMenuItemKey(item)}
                role="menuitem"
                // Single tab stop: useListFocus owns the roving tabindex and
                // promotes exactly one item to 0.
                tabIndex={-1}
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

TopNavMenu.displayName = 'TopNavMenu';
