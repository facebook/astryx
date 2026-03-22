'use client';

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


import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  lineHeightVars,
  shadowVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSGrid} from '../Grid/XDSGrid';
import {getIcon} from '../Icon/globalIconRegistry';
import {xdsClassName, mergeProps} from '../utils';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useTopNavSlot} from './TopNavContext';
import {useXDSTopNavRenderMode} from './XDSTopNavRenderContext';

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
    borderRadius: radiusVars['--radius-2'],
    fontSize: typeScaleVars['--text-label-size'],
    lineHeight: lineHeightVars['--leading-base'],
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
      ':focus-visible': `2px solid ${colorVars['--color-ring-focus']}`,
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
  // Animation styles applied to the layer's popover element.
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
    transitionDuration: durationVars['--duration-medium-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transitionBehavior: 'allow-discrete',
    '@starting-style': {
      opacity: 0,
      transform: 'translateY(-4px)',
    },
  },
  // Visual styles for the panel content container.
  panelContainer: {
    backgroundColor: colorVars['--color-popover'],
    borderTop: `1px solid ${colorVars['--color-border']}`,
    borderRadius: radiusVars['--radius-3'],
    boxShadow: shadowVars['--shadow-menu'],
    overflow: 'hidden',
  },
  panelContent: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-6'],
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
    maxWidth: 960,
  },
  menuWrapper: {
    flexGrow: 2,
    flexShrink: 1,
    flexBasis: 300,
    minWidth: 0,
  },
  featured: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 200,
    borderRadius: radiusVars['--radius-3'],
    backgroundColor: colorVars['--color-muted'],
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
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  drawerChevronExpanded: {
    transform: 'rotate(180deg)',
  },
  drawerItems: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  drawerItemsExpanded: {
    gridTemplateRows: '1fr',
  },
  drawerItemsInner: {
    overflow: 'hidden',
    minHeight: 0,
  },

  // Featured card in drawer — compact version
  drawerFeatured: {
    marginBlockStart: spacingVars['--spacing-2'],
    marginInlineStart: spacingVars['--spacing-6'],
    borderRadius: radiusVars['--radius-3'],
    backgroundColor: colorVars['--color-muted'],
    overflow: 'hidden',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSTopNavMegaMenuProps {
  /** The visible label for the nav item trigger. */
  label: string;
  /**
   * Menu items slot — typically one or more XDSTopNavMegaMenuItem components,
   * but accepts any ReactNode for custom layouts.
   */
  items?: ReactNode;
  /**
   * Featured content slot — rendered in the right panel on desktop,
   * and below the items in the mobile drawer.
   */
  featured?: ReactNode;
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
// XDSTopNavMegaMenu
// =============================================================================

/**
 * A navigation item that displays a full-width mega menu on hover.
 *
 * Uses a composed children API with sub-components:
 * - `items` — ReactNode slot, typically XDSTopNavMegaMenuItem components
 * - `featured` — ReactNode slot for the right-panel / drawer featured card
 *
 * Supports three render modes via XDSTopNavRenderContext:
 * - `'default'`: desktop popover with hover/click trigger
 * - `'mobile-bar'`: hidden (returns null)
 * - `'drawer'`: inline collapsible matching TopNavMenu pattern
 *
 * @example
 * ```
 * <XDSTopNav
 *   startContent={
 *     <XDSTopNavMegaMenu
 *       label="Products"
 *       items={
 *         <>
 *           <XDSTopNavMegaMenuItem
 *             title="Analytics"
 *             description="Track behavior"
 *             icon={<ChartIcon />}
 *             href="/analytics"
 *           />
 *           <XDSTopNavMegaMenuItem
 *             title="Messaging"
 *             description="Real-time comms"
 *             icon={<ChatIcon />}
 *             href="/messaging"
 *           />
 *         </>
 *       }
 *       featured={
 *         <>
 *           <strong>New: AI Features</strong>
 *           <p>Explore our latest AI-powered tools.</p>
 *         </>
 *       }
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
  const renderMode = useXDSTopNavRenderMode();

  // =========================================================================
  // Mobile-bar mode — hidden
  // =========================================================================
  if (renderMode === 'mobile-bar') {
    return null;
  }

  // =========================================================================
  // Drawer mode — inline collapsible
  // =========================================================================
  if (renderMode === 'drawer') {
    return <DrawerMegaMenu label={label} items={items} featured={featured} />;
  }

  // =========================================================================
  // Default mode — desktop popover
  // =========================================================================
  return (
    <DefaultMegaMenu
      label={label}
      items={items}
      featured={featured}
      delay={delay}
      hideDelay={hideDelay}
      onOpenChange={onOpenChange}
    />
  );
}

XDSTopNavMegaMenu.displayName = 'XDSTopNavMegaMenu';

// =============================================================================
// DefaultMegaMenu — desktop popover mode
// =============================================================================

function DefaultMegaMenu({
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

  const handlePopoverShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handlePopoverHide = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const popover = useXDSPopover({
    dialogLabel: label,
    xstyle: styles.panelAnimation,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
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
            {items != null && (
              <div {...stylex.props(styles.menuWrapper)}>
                <XDSGrid columns={2} minChildWidth={200} gap={2}>
                  {items}
                </XDSGrid>
              </div>
            )}

            {/* Featured section */}
            {featured != null && (
              <div {...stylex.props(styles.featured)}>{featured}</div>
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
  items,
  featured,
}: Pick<XDSTopNavMegaMenuProps, 'label' | 'items' | 'featured'>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuId = `mega-menu-${label.toLowerCase().replace(/\s+/g, '-')}`;

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
          {/* Items render themselves in drawer mode via XDSTopNavRenderContext */}
          {items}

          {/* Featured card */}
          {featured != null && (
            <div {...stylex.props(styles.drawerFeatured)}>{featured}</div>
          )}
        </div>
      </div>
    </div>
  );
}
