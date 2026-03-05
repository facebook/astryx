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
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSHoverCard} from '../Layer/useXDSHoverCard';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  trigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: transitionVars['--transition-fast'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-hover-overlay'],
      },
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
    border: 'none',
    fontFamily: 'inherit',
  },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    minWidth: 280,
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
    transitionDuration: transitionVars['--transition-fast'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-hover-overlay'],
      },
    },
    border: 'none',
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
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
    backgroundColor: colorVars['--color-deemphasized'],
    flexShrink: 0,
  },
  menuItemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
  },
  menuItemTitle: {
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  menuItemDescription: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
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
  const hoverCard = useXDSHoverCard({
    placement: 'below',
    alignment: 'start',
    delay,
    hideDelay,
    focusTrigger: 'always',
  });

  return (
    <>
      <button
        ref={hoverCard.ref}
        type="button"
        aria-haspopup="true"
        aria-describedby={hoverCard.describedBy}
        sx={styles.trigger}>
        {label}
      </button>
      {hoverCard.renderHoverCard(
        <div role="menu" aria-label={label} sx={styles.menuContainer}>
          {items.map((item, index) => {
            const Element = item.href ? 'a' : 'div';
            return (
              <Element
                key={index}
                role="menuitem"
                tabIndex={0}
                href={item.href}
                onClick={item.onClick}
                sx={styles.menuItem}>
                <div sx={styles.menuItemIcon}>{item.icon}</div>
                <div sx={styles.menuItemContent}>
                  <span sx={styles.menuItemTitle}>
                    {item.title}
                  </span>
                  {item.description && (
                    <span sx={styles.menuItemDescription}>
                      {item.description}
                    </span>
                  )}
                </div>
              </Element>
            );
          })}
        </div>,
      )}
    </>
  );
}

XDSTopNavMenu.displayName = 'XDSTopNavMenu';
