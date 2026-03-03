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
import {useXDSLayer} from '../Layer';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
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
  // Animation styles applied to the layer's popover element.
  // Uses :popover-open for enter and @starting-style for initial state.
  panelAnimation: {
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
  // Anchor positioning: stretch panel to match the anchor width.
  anchorStretch: {
    left: 'anchor(left)' as unknown as string,
    right: 'anchor(right)' as unknown as string,
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
 * The panel is promoted to the top layer via the Popover API (through
 * useXDSLayer) and positioned via CSS anchor positioning relative to the
 * nearest positioned ancestor (typically the nav bar wrapper).
 *
 * For correct full-width behavior, wrap the XDSTopNav in a container with
 * `position: relative`.
 *
 * @example
 * ```
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
 *           linkText: 'Learn more \u2192',
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

  // useXDSLayer handles: Popover API (top layer), CSS anchor positioning,
  // toggle event sync, and popover element rendering.
  const layer = useXDSLayer({
    mode: 'context',
    lightDismiss: false, // Hover-driven, not click-to-dismiss
    onShow: () => onOpenChange?.(true),
    onHide: () => onOpenChange?.(false),
  });

  // Set the CSS anchor to the nearest positioned ancestor (the nav wrapper).
  // The panel spans this element's full width.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let el: HTMLElement | null = wrapper.parentElement;
    while (el) {
      const position = getComputedStyle(el).position;
      if (
        position === 'relative' ||
        position === 'absolute' ||
        position === 'fixed'
      ) {
        layer.ref(el);
        break;
      }
      el = el.parentElement;
    }

    return () => {
      layer.ref(null);
    };
  }, [layer]);

  const setOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        layer.show();
      } else {
        layer.hide();
      }
    },
    [layer],
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
      {layer.render(
        <div
          role="menu"
          aria-label={label}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...stylex.props(styles.panelContainer)}>
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
        </div>,
        {
          placement: 'below',
          alignment: 'center',
          xstyle: [styles.panelAnimation, styles.anchorStretch],
        },
      )}
    </div>
  );
}

XDSTopNavMegaMenu.displayName = 'XDSTopNavMegaMenu';
