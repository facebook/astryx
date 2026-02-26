/**
 * @file XDSTopNavMegaMenu.tsx
 * @input Uses React, StyleX, custom hover logic
 * @output Exports XDSTopNavMegaMenu component and related types
 * @position Navigation item with hover-triggered full-width mega menu for XDSTopNav
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/README.md
 * - /packages/core/src/TopNav/index.ts
 */

'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
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

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    // position: static so the panel positions relative to the nearest
    // positioned ancestor (the nav bar wrapper), not this div.
    position: 'static',
  },
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
  // Backdrop covers the entire positioned ancestor (nav + panel area).
  // It provides the unified card appearance: shared shadow, rounded corners,
  // and surface background so the nav bar and panel look like one popover.
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: elevationVars['--elevation-hover'],
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
    pointerEvents: 'none',
  },
  backdropOpen: {
    opacity: 1,
  },
  panel: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colorVars['--color-surface'],
    // No separate shadow or border — the backdrop provides the unified
    // card shadow, and the panel flows seamlessly from the nav bar.
    borderBottomLeftRadius: radiusVars['--radius-container'],
    borderBottomRightRadius: radiusVars['--radius-container'],
    boxShadow: elevationVars['--elevation-hover'],
    overflow: 'hidden',
    opacity: 0,
    transform: 'translateY(-4px)',
    transitionProperty: 'opacity, transform',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease-out',
    pointerEvents: 'none',
  },
  panelOpen: {
    opacity: 1,
    transform: 'translateY(0)',
    pointerEvents: 'auto',
  },
  panelContent: {
    display: 'flex',
    gap: spacingVars['--spacing-6'],
    paddingBlock: spacingVars['--spacing-6'],
    paddingInline: spacingVars['--spacing-6'],
    maxWidth: 960,
    marginInline: 'auto',
  },
  menuSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacingVars['--spacing-2'],
    flex: 1,
  },
  menuSectionSingle: {
    gridTemplateColumns: '1fr',
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
    width: 280,
    flexShrink: 0,
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
  divider: {
    width: 1,
    backgroundColor: colorVars['--color-divider'],
    flexShrink: 0,
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
  isSingleColumn?: boolean;
  /**
   * Callback fired when the mega menu opens or closes.
   * Useful for coordinating wrapper styles (e.g. hiding other shadows).
   */
  onOpenChange?: (isOpen: boolean) => void;
}

// =============================================================================
// Chevron Icon
// =============================================================================

function ChevronDown() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  );
}

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
 * The panel positions itself relative to the nearest positioned ancestor
 * (typically the nav bar wrapper). For correct full-width behavior, wrap
 * the XDSTopNav in a container with `position: relative`.
 *
 * @example
 * ```tsx
 * <div style={{ position: 'relative' }}>
 *   <XDSTopNav
 *     startContent={
 *       <XDSTopNavMegaMenu
 *         label="Products"
 *         items={[
 *           { title: 'Analytics', description: 'Track behavior', icon: <ChartIcon /> },
 *           { title: 'Messaging', description: 'Real-time comms', icon: <ChatIcon /> },
 *         ]}
 *         featured={{
 *           title: 'New: AI Features',
 *           description: 'Explore our latest AI-powered tools.',
 *           linkText: 'Learn more →',
 *           linkHref: '/ai',
 *         }}
 *       />
 *     }
 *   />
 * </div>
 * ```
 */
export function XDSTopNavMegaMenu({
  label,
  items,
  featured,
  delay = 150,
  hideDelay = 250,
  isSingleColumn = false,
  onOpenChange,
}: XDSTopNavMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

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
      setOpen(true);
    }, delay);
  }, [clearTimeouts, setOpen, delay]);

  const scheduleHide = useCallback(() => {
    clearTimeouts();
    hideTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, hideDelay);
  }, [clearTimeouts, setOpen, hideDelay]);

  const handleMouseEnter = useCallback(() => {
    scheduleShow();
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        clearTimeouts();
        setOpen(false);
      }
    },
    [clearTimeouts, setOpen],
  );

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return (
    <div
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      {...stylex.props(styles.wrapper)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        {...stylex.props(styles.trigger, isOpen && styles.triggerOpen)}>
        {label}
        <span {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}>
          <ChevronDown />
        </span>
      </button>
      {/* Backdrop: covers the entire positioned ancestor to create a unified
          card appearance (shared shadow + rounded corners) for nav + panel */}
      <div
        aria-hidden="true"
        {...stylex.props(styles.backdrop, isOpen && styles.backdropOpen)}
      />
      <div
        role="menu"
        aria-label={label}
        {...stylex.props(styles.panel, isOpen && styles.panelOpen)}>
        <div {...stylex.props(styles.panelContent)}>
          {/* Menu items section */}
          <div
            {...stylex.props(
              styles.menuSection,
              isSingleColumn && styles.menuSectionSingle,
            )}>
            {items.map((item, index) => {
              const Element = item.href ? 'a' : 'div';
              return (
                <Element
                  key={index}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
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
          </div>

          {/* Featured section */}
          {featured && (
            <>
              <div {...stylex.props(styles.divider)} />
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
                          tabIndex={isOpen ? 0 : -1}
                          {...stylex.props(styles.featuredLink)}>
                          {featured.linkText}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

XDSTopNavMegaMenu.displayName = 'XDSTopNavMegaMenu';
