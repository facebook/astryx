// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavMegaMenu.tsx
 * @input Uses React, StyleX, usePopover (Popover API + CSS anchor positioning)
 * @output Exports TopNavMegaMenu component and related types
 * @position Navigation item with hover-triggered full-width mega menu for TopNav
 *
 * Uses usePopover to promote the panel to the top layer via the Popover API,
 * eliminating z-index stacking. CSS anchor positioning places the panel below
 * the nav wrapper.
 *
 * Supports three render modes via TopNavRenderContext:
 * - 'default': desktop popover mega menu (hover/click triggered)
 * - 'mobile-bar': returns null (hidden in compact mobile bar)
 * - 'drawer': drill-down navigation with back button
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 * - /packages/cli/templates/blocks/components/TopNav/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  fontWeightVars,
  shadowVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import {usePopover} from '../Popover/usePopover';
import {Grid} from '../Grid/Grid';
import {getIcon} from '../Icon/globalIconRegistry';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useTopNavSlot} from './TopNavContext';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {themeProps} from '../utils/themeProps';

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
    backgroundColor: colorVars['--color-background-popover'],
    borderTopWidth: borderVars['--border-width'],
    borderTopStyle: 'solid',
    borderTopColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: shadowVars['--shadow-low'],
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
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-muted'],
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
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-muted'],
    overflow: 'hidden',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface TopNavMegaMenuProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /** The visible label for the nav item trigger. */
  label: string;
  /**
   * Menu items slot — typically one or more TopNavMegaMenuItem components,
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
// TopNavMegaMenu
// =============================================================================

/**
 * A navigation item that displays a full-width mega menu on hover.
 *
 * Uses a composed children API with sub-components:
 * - `items` — ReactNode slot, typically TopNavMegaMenuItem components
 * - `featured` — ReactNode slot for the right-panel / drawer featured card
 *
 * Supports three render modes via TopNavRenderContext:
 * - `'default'`: desktop popover with hover/click trigger
 * - `'mobile-bar'`: hidden (returns null)
 * - `'drawer'`: inline collapsible matching TopNavMenu pattern
 *
 * @example
 * ```
 * <TopNav
 *   startContent={
 *     <TopNavMegaMenu
 *       label="Products"
 *       items={
 *         <>
 *           <TopNavMegaMenuItem
 *             title="Analytics"
 *             description="Track behavior"
 *             icon={<ChartIcon />}
 *             href="/analytics"
 *           />
 *           <TopNavMegaMenuItem
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
export function TopNavMegaMenu({
  ref,
  label,
  items,
  featured,
  delay = 150,
  hideDelay = 250,
  onOpenChange,
}: TopNavMegaMenuProps) {
  const renderMode = useTopNavRenderMode();

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
      ref={ref}
      label={label}
      items={items}
      featured={featured}
      delay={delay}
      hideDelay={hideDelay}
      onOpenChange={onOpenChange}
    />
  );
}

TopNavMegaMenu.displayName = 'TopNavMegaMenu';

// =============================================================================
// DefaultMegaMenu — desktop popover mode
// =============================================================================

function DefaultMegaMenu({
  ref,
  label,
  items,
  featured,
  delay = 150,
  hideDelay = 250,
  onOpenChange,
}: TopNavMegaMenuProps) {
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

  const popover = usePopover({
    dialogLabel: label,
    // hasSurface: false — mega menu provides its own surface (panelContainer)
    // with border-top and custom overflow. Animation is applied via the
    // render() call's xstyle prop (panelAnimation), not the hook options.
    hasSurface: false,
    onShow: handlePopoverShow,
    onHide: handlePopoverHide,
  });

  // Set the CSS anchor to the parent <nav> element (the TopNav).
  useEffect(() => {
    const nav = triggerButtonRef.current?.closest('nav');
    if (nav) {
      popover.triggerRef(nav);
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
    if (!clickLockedRef.current) {
      scheduleShow();
    }
  }, [scheduleShow]);

  const handleMouseLeave = useCallback(() => {
    if (!clickLockedRef.current) {
      scheduleHide();
    }
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
        ref={mergeRefs(triggerButtonRef, ref)}
        type="button"
        aria-haspopup="true"
        aria-expanded={popover.isOpen}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...mergeProps(
          themeProps('top-nav-mega-menu'),
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
                <Grid columns={2} gap={2}>
                  {items}
                </Grid>
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
}: Pick<TopNavMegaMenuProps, 'label' | 'items' | 'featured'>) {
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
          themeProps('top-nav-mega-menu', {mode: 'drawer'}),
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
          {/* Items render themselves in drawer mode via TopNavRenderContext */}
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
