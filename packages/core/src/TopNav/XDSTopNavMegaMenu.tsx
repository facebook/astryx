/**
 * @file XDSTopNavMegaMenu.tsx
 * @input Uses React, StyleX, useXDSPopover (Popover API + CSS anchor positioning)
 * @output Exports XDSTopNavMegaMenu component and related types
 * @position Navigation item with hover-triggered full-width mega menu for XDSTopNav
 *
 * Uses useXDSPopover to promote the panel to the top layer via the Popover API,
 * eliminating z-index stacking. CSS anchor positioning places the panel below
 * the nav wrapper.
 *
 * Supports three render modes via XDSTopNavRenderContext:
 * - 'default': desktop popover mega menu (hover/click triggered)
 * - 'mobile-bar': returns null (hidden in compact mobile bar)
 * - 'drawer': drill-down navigation with back button
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Children,
  isValidElement,
  type ReactNode,
} from 'react';
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
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useTopNavSlot} from './TopNavContext';
import {useXDSTopNavRenderMode} from './XDSTopNavRenderContext';
import type {XDSTopNavMegaMenuGroupProps} from './XDSTopNavMegaMenuGroup';
import type {XDSTopNavMegaMenuItemProps} from './XDSTopNavMegaMenuItem';
import type {XDSTopNavMegaMenuFeaturedProps} from './XDSTopNavMegaMenuFeatured';

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
  // =========================================================================
  // Drawer mode styles (composes navItemStyles.item as base)
  // =========================================================================
  drawerSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  // Header button override — justifyContent and button resets only,
  // base layout/colors come from navItemStyles.item
  drawerHeader: {
    justifyContent: 'space-between',
    border: 'none',
    background: 'none',
  },
  drawerChevron: {
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: transitionVars['--transition-fast'],
  },
  drawerChevronExpanded: {
    transform: 'rotate(180deg)',
  },
  drawerItems: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: transitionVars['--transition-normal'],
  },
  drawerItemsExpanded: {
    gridTemplateRows: '1fr',
  },
  drawerItemsInner: {
    overflow: 'hidden',
    minHeight: 0,
  },
  // Item indentation + content layout overrides (base from navItemStyles.item)
  drawerItem: {
    paddingInlineStart: spacingVars['--spacing-6'],
    alignItems: 'flex-start',
    textDecoration: 'none',
  },
  drawerItemIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-deemphasized'],
    flexShrink: 0,
    color: colorVars['--color-icon-secondary'],
    marginBlockStart: spacingVars['--spacing-0-5'],
  },
  drawerItemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    minWidth: 0,
  },
  drawerItemDescription: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    fontWeight: fontWeightVars['--font-weight-normal'],
  },
  // Featured card in drawer — compact version
  drawerFeatured: {
    marginBlockStart: spacingVars['--spacing-2'],
    marginInlineStart: spacingVars['--spacing-6'],
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-deemphasized'],
    overflow: 'hidden',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSTopNavMegaMenuProps {
  /** The visible label for the nav item trigger. */
  label: string;
  /** Composed children: XDSTopNavMegaMenuGroup and XDSTopNavMegaMenuFeatured. */
  children?: ReactNode;
  /** Delay before showing the menu on hover (ms). @default 150 */
  delay?: number;
  /** Delay before hiding the menu after mouse leaves (ms). @default 250 */
  hideDelay?: number;
  /**
   * Callback fired when the mega menu opens or closes.
   * Useful for coordinating wrapper styles (e.g. hiding other shadows).
   */
  onOpenChange?: (isOpen: boolean) => void;
}

// =============================================================================
// Helpers — extract children by displayName
// =============================================================================

interface ParsedChildren {
  groups: Array<{items: XDSTopNavMegaMenuItemProps[]}>;
  featuredContent: ReactNode | null;
}

function parseChildren(children: ReactNode): ParsedChildren {
  const groups: Array<{items: XDSTopNavMegaMenuItemProps[]}> = [];
  let featuredContent: ReactNode | null = null;

  Children.forEach(children, child => {
    if (!isValidElement(child)) return;

    const displayName =
      (child.type as {displayName?: string}).displayName ?? '';

    if (displayName === 'XDSTopNavMegaMenuGroup') {
      const groupProps = child.props as XDSTopNavMegaMenuGroupProps;
      const items: XDSTopNavMegaMenuItemProps[] = [];

      Children.forEach(groupProps.children, groupChild => {
        if (!isValidElement(groupChild)) return;
        const itemDisplayName =
          (groupChild.type as {displayName?: string}).displayName ?? '';
        if (itemDisplayName === 'XDSTopNavMegaMenuItem') {
          items.push(groupChild.props as XDSTopNavMegaMenuItemProps);
        }
      });

      groups.push({items});
    } else if (displayName === 'XDSTopNavMegaMenuFeatured') {
      const featuredProps = child.props as XDSTopNavMegaMenuFeaturedProps;
      featuredContent = featuredProps.children;
    }
  });

  return {groups, featuredContent};
}

// =============================================================================
// XDSTopNavMegaMenu
// =============================================================================

/**
 * A navigation item that displays a full-width mega menu on hover.
 *
 * Uses a composed children API with sub-components:
 * - `XDSTopNavMegaMenuGroup` — wraps items in a responsive grid
 * - `XDSTopNavMegaMenuItem` — individual menu item
 * - `XDSTopNavMegaMenuFeatured` — featured content area
 *
 * Supports three render modes via XDSTopNavRenderContext:
 * - `'default'`: desktop popover with hover/click trigger
 * - `'mobile-bar'`: hidden (returns null)
 * - `'drawer'`: inline drill-down with back button
 *
 * @example
 * ```
 * <XDSTopNav
 *   startContent={
 *     <XDSTopNavMegaMenu label="Products">
 *       <XDSTopNavMegaMenuGroup>
 *         <XDSTopNavMegaMenuItem
 *           title="Analytics"
 *           description="Track behavior"
 *           icon={<ChartIcon />}
 *           href="/analytics"
 *         />
 *         <XDSTopNavMegaMenuItem
 *           title="Messaging"
 *           description="Real-time comms"
 *           icon={<ChatIcon />}
 *           href="/messaging"
 *         />
 *       </XDSTopNavMegaMenuGroup>
 *       <XDSTopNavMegaMenuFeatured>
 *         <strong>New: AI Features</strong>
 *         <p>Explore our latest AI-powered tools.</p>
 *       </XDSTopNavMegaMenuFeatured>
 *     </XDSTopNavMegaMenu>
 *   }
 * />
 * ```
 */
export function XDSTopNavMegaMenu({
  label,
  children,
  delay = 150,
  hideDelay = 250,
  onOpenChange,
}: XDSTopNavMegaMenuProps) {
  const renderMode = useXDSTopNavRenderMode();

  // =========================================================================
  // Mobile-bar mode — hidden
  // =========================================================================
  if (renderMode === 'mobile-bar') {
    return null;
  }

  // =========================================================================
  // Drawer mode — drill-down
  // =========================================================================
  if (renderMode === 'drawer') {
    return <DrawerMegaMenu label={label}>{children}</DrawerMegaMenu>;
  }

  // =========================================================================
  // Default mode — desktop popover
  // =========================================================================
  return (
    <DefaultMegaMenu
      label={label}
      delay={delay}
      hideDelay={hideDelay}
      onOpenChange={onOpenChange}>
      {children}
    </DefaultMegaMenu>
  );
}

XDSTopNavMegaMenu.displayName = 'XDSTopNavMegaMenu';

// =============================================================================
// DefaultMegaMenu — desktop popover mode
// =============================================================================

function DefaultMegaMenu({
  label,
  children,
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

  const {groups, featuredContent} = parseChildren(children);

  // Flatten all items from all groups for the grid
  const allItems = groups.flatMap(g => g.items);

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
            {allItems.length > 0 && (
              <div {...stylex.props(styles.menuWrapper)}>
                <XDSGrid columns={2} minChildWidth={200} gap={2}>
                  {allItems.map((item, index) => {
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
            )}

            {/* Featured section */}
            {featuredContent != null && (
              <div {...stylex.props(styles.featured)}>{featuredContent}</div>
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

// =============================================================================
// DrawerMegaMenu — mobile drawer inline collapsible mode
// =============================================================================

function DrawerMegaMenu({
  label,
  children,
}: Pick<XDSTopNavMegaMenuProps, 'label' | 'children'>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuId = `mega-menu-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const {groups, featuredContent} = parseChildren(children);
  const allItems = groups.flatMap(g => g.items);

  return (
    <div {...stylex.props(styles.drawerSection)}>
      {/* Header toggle — same pattern as TopNavMenu drawer */}
      <button
        type="button"
        onClick={() => setIsExpanded(v => !v)}
        aria-expanded={isExpanded}
        aria-controls={`${menuId}-items`}
        {...mergeProps(
          xdsClassName('top-nav-mega-menu', {mode: 'drawer'}),
          stylex.props(navItemStyles.item, styles.drawerHeader),
        )}>
        {label}
        <span
          {...stylex.props(
            styles.drawerChevron,
            isExpanded && styles.drawerChevronExpanded,
          )}>
          {getIcon('chevronDown')}
        </span>
      </button>

      {/* Animated expand/collapse container */}
      <div
        id={`${menuId}-items`}
        {...stylex.props(
          styles.drawerItems,
          isExpanded && styles.drawerItemsExpanded,
        )}>
        <div {...stylex.props(styles.drawerItemsInner)}>
          {allItems.map((item, index) => {
            const Element = item.href ? 'a' : 'button';
            const elementProps =
              Element === 'button' ? {type: 'button' as const} : {};
            return (
              <Element
                key={index}
                href={item.href}
                onClick={item.onClick}
                {...elementProps}
                {...stylex.props(navItemStyles.item, styles.drawerItem)}>
                {item.icon && (
                  <div {...stylex.props(styles.drawerItemIcon)}>
                    {item.icon}
                  </div>
                )}
                <div {...stylex.props(styles.drawerItemContent)}>
                  {item.title}
                  {item.description && (
                    <span {...stylex.props(styles.drawerItemDescription)}>
                      {item.description}
                    </span>
                  )}
                </div>
              </Element>
            );
          })}

          {/* Featured card */}
          {featuredContent != null && (
            <div {...stylex.props(styles.drawerFeatured)}>
              {featuredContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
