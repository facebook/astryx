/**
 * @file XDSTopNavMegaMenu.tsx
 * @input Uses React, StyleX, useXDSLayer (Popover API + CSS anchor positioning)
 * @output Exports XDSTopNavMegaMenu component and related types
 * @position Navigation item with hover-triggered full-width mega menu for XDSTopNav
 *
 * Uses useXDSLayer to promote the panel to the top layer via the Popover API,
 * eliminating z-index stacking. CSS anchor positioning places the panel below
 * the nav wrapper.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

'use client';

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
  elevationVars,
} from '../theme/tokens.stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSGrid} from '../Grid/XDSGrid';
import {getIcon} from '../Icon/globalIconRegistry';
import {xdsClassName, mergeProps} from '../utils';
import {useTopNavSlot} from './TopNavContext';

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
  triggerOpen: {
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-hover-overlay'],
  },
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: transitionVars['--transition-fast'],
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  // Animation styles applied to the layer's popover element.
  // Uses :popover-open for enter and @starting-style for initial state.
  panelAnimation: {
    backgroundColor: 'transparent',
    opacity: {
      default: 0,
      ':popover-open': 1,
    },
    transform: {
      default: 'translateY(-4px)',
      ':popover-open': 'translateY(0)',
    },
    transitionProperty: 'opacity, transform, overlay, display',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
    transitionBehavior: 'allow-discrete',
    '@starting-style': {
      opacity: 0,
      transform: 'translateY(-4px)',
    },
  },
  // Visual styles for the panel content container.
  panelContainer: {
    backgroundColor: colorVars['--color-popover'],
    borderTop: `1px solid ${colorVars['--color-divider']}`,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: radiusVars['--radius-container'],
    borderBottomRightRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-menu'],
    overflow: 'hidden',
  },
  panelContent: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-6'],
    paddingBlock: spacingVars['--spacing-6'],
    paddingInline: spacingVars['--spacing-6'],
    maxWidth: 960,
  },
  menuWrapper: {
    flexGrow: 2,
    flexShrink: 1,
    flexBasis: 300,
    minWidth: 0,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'flex-start',
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
    color: 'inherit',
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
    color: colorVars['--color-icon-secondary'],
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
  featured: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-deemphasized'],
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  featuredImage: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
    display: 'block',
  },
  featuredBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-4'],
    paddingInline: spacingVars['--spacing-4'],
  },
  featuredTitle: {
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  featuredDescription: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
  },
  featuredLink: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-accent-text'],
    textDecoration: 'none',
    cursor: 'pointer',
    marginBlockStart: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Types
// =============================================================================

/**
 * An item in the mega menu.
 */
export interface XDSTopNavMegaMenuItemData {
  /** Display title for the menu item. */
  title: string;
  /** Optional description text displayed below the title. */
  description?: string;
  /** Optional icon element displayed to the left. */
  icon?: ReactNode;
  /** URL to navigate to when clicked. */
  href?: string;
  /** Callback when item is clicked. */
  onClick?: () => void;
}

/**
 * Featured content for the right side of the mega menu.
 */
export interface XDSTopNavMegaMenuFeatured {
  /** Image URL for the featured area. */
  image?: string;
  /** Alt text for the featured image. */
  imageAlt?: string;
  /** Featured content title. */
  title: string;
  /** Featured content description. */
  description?: string;
  /** Call-to-action link text. */
  linkText?: string;
  /** Call-to-action link URL. */
  linkHref?: string;
  /** Callback when CTA is clicked. */
  onLinkClick?: () => void;
  /** Custom content to render instead of the default layout. */
  children?: ReactNode;
}

export interface XDSTopNavMegaMenuProps {
  /** The visible label for the nav item trigger. */
  label: string;
  /** Menu items to display in the mega menu panel. */
  items: XDSTopNavMegaMenuItemData[];
  /** Optional featured content on the right side. */
  featured?: XDSTopNavMegaMenuFeatured;
  /** Delay before showing the menu on hover (ms). @default 150 */
  delay?: number;
  /** Delay before hiding the menu after mouse leaves (ms). @default 250 */
  hideDelay?: number;
  /** Whether to use single-column layout for items. @default false */
  /**
   * Callback fired when the mega menu opens or closes.
   * Useful for coordinating wrapper styles (e.g. hiding other shadows).
   */
  onOpenChange?: (isOpen: boolean) => void;
}

// =============================================================================
// =============================================================================
// XDSTopNavMegaMenu
// =============================================================================

/**
 * A navigation item that displays a full-width mega menu on hover.
 *
 * Renders as a nav item trigger in XDSTopNav's startContent slot. On hover,
 * shows a full-width panel below the nav bar with menu items organized in
 * columns and an optional featured content area on the right.
 *
 * The panel is promoted to the top layer via the Popover API (through
 * useXDSLayer) and positioned via CSS anchor positioning relative to the
 * parent `<nav>` element (the XDSTopNav).
 *
 * @example
 * ```
 * <XDSTopNav
 *   startContent={
 *     <XDSTopNavMegaMenu
 *       label="Products"
 *       items={[
 *         { title: 'Analytics', description: 'Track behavior', icon: <ChartIcon /> },
 *         { title: 'Messaging', description: 'Real-time comms', icon: <ChatIcon /> },
 *       ]}
 *       featured={{
 *         title: 'New: AI Features',
 *         description: 'Explore our latest AI-powered tools.',
 *         linkText: 'Learn more \u2192',
 *         linkHref: '/ai',
 *       }}
 *     />
 *   }
 * />
 * ```
 */
export function XDSTopNavMegaMenu({
  label,
  items,
  featured,
  delay = 150,
  hideDelay = 250,
  onOpenChange,
}: XDSTopNavMegaMenuProps) {
  const slot = useTopNavSlot();
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const clickLockedRef = useRef(false);

  const popover = useXDSPopover({
    dialogLabel: label,
    xstyle: styles.panelAnimation,
    onShow: () => onOpenChange?.(true),
    onHide: () => onOpenChange?.(false),
  });

  // Set the CSS anchor to the parent <nav> element (the XDSTopNav).
  useEffect(() => {
    const nav = triggerButtonRef.current?.closest('nav');
    if (nav) {
      popover.triggerRef(nav as HTMLElement);
    }
    return () => {
      popover.triggerRef(null);
    };
  }, [popover]);

  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const scheduleShow = useCallback(() => {
    clearTimeouts();
    showTimeoutRef.current = setTimeout(() => {
      popover.show({skipAutoFocus: true});
    }, delay);
  }, [clearTimeouts, popover, delay]);

  const scheduleHide = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      popover.hide();
    }, hideDelay);
  }, [clearTimeouts, popover, hideDelay]);

  const handleMouseEnter = useCallback(() => {
    if (!clickLockedRef.current) scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    if (!clickLockedRef.current) scheduleHide();
  }, [scheduleHide]);

  const handleClick = useCallback(() => {
    clearTimeouts();
    if (popover.isOpen) {
      clickLockedRef.current = false;
      popover.hide();
      triggerButtonRef.current?.focus();
    } else {
      clickLockedRef.current = true;
      popover.show();
    }
  }, [popover, clearTimeouts]);

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={popover.isOpen}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...mergeProps(
          xdsClassName('top-nav-mega-menu'),
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
          role="menu"
          aria-label={label}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...stylex.props(styles.panelContainer)}>
          <div {...stylex.props(styles.panelContent)}>
            {/* Menu items section */}
            <div {...stylex.props(styles.menuWrapper)}>
              <XDSGrid columns={2} minChildWidth={200} gap={2}>
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
                      {item.icon && (
                        <div {...stylex.props(styles.menuItemIcon)}>
                          {item.icon}
                        </div>
                      )}
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
              </XDSGrid>
            </div>

            {/* Featured section */}
            {featured && (
              <div {...stylex.props(styles.featured)}>
                {featured.children ? (
                  featured.children
                ) : (
                  <>
                    {featured.image && (
                      <img
                        src={featured.image}
                        alt={featured.imageAlt ?? ''}
                        {...stylex.props(styles.featuredImage)}
                      />
                    )}
                    <div {...stylex.props(styles.featuredBody)}>
                      <span {...stylex.props(styles.featuredTitle)}>
                        {featured.title}
                      </span>
                      {featured.description && (
                        <span {...stylex.props(styles.featuredDescription)}>
                          {featured.description}
                        </span>
                      )}
                      {featured.linkText && (
                        <a
                          href={featured.linkHref}
                          onClick={featured.onLinkClick}
                          tabIndex={popover.isOpen ? 0 : -1}
                          {...stylex.props(styles.featuredLink)}>
                          {featured.linkText}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>,
        {
          placement: 'below',
          alignment: slot,
          xstyle: styles.panelAnimation,
        },
      )}
    </>
  );
}

XDSTopNavMegaMenu.displayName = 'XDSTopNavMegaMenu';
