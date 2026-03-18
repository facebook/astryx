/**
 * @file XDSTopNavMegaMenuItem.tsx
 * @input Uses React, StyleX, theme tokens, navItemStyles, XDSTopNavRenderContext
 * @output Exports XDSTopNavMegaMenuItem component and props
 * @position Individual item inside an XDSTopNavMegaMenu — renders itself in both
 *   desktop (popover) and mobile drawer modes.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

'use client';

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {useXDSTopNavRenderMode} from './XDSTopNavRenderContext';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  // Desktop popover item
  desktop: {
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
      ':active': colorVars['--color-pressed-overlay'],
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
    fontFamily: 'inherit',
    textAlign: 'start',
    boxSizing: 'border-box',
    width: '100%',
  },
  desktopIcon: {
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
  desktopContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    minWidth: 0,
  },
  desktopTitle: {
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-primary'],
  },
  desktopDescription: {
    fontSize: textSizeVars['--text-sm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  // Drawer item overrides (base from navItemStyles.item)
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
});

// =============================================================================
// Types
// =============================================================================

export interface XDSTopNavMegaMenuItemProps {
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
  /**
   * Custom component to render instead of `<a>` for link items.
   * Overrides the provider-level default set by XDSLinkProvider.
   */
  as?: XDSLinkComponentType;
  /**
   * tabIndex — set by parent when inside a closed popover.
   * @internal
   */
  tabIndex?: number;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An individual item inside an XDSTopNavMegaMenu.
 *
 * Renders itself in both desktop (popover grid) and mobile drawer modes
 * using XDSTopNavRenderContext to switch appearance.
 *
 * @example
 * ```
 * <XDSTopNavMegaMenu
 *   label="Products"
 *   items={
 *     <>
 *       <XDSTopNavMegaMenuItem
 *         title="Analytics"
 *         description="Track and analyze user behavior"
 *         icon={<ChartIcon />}
 *         href="/analytics"
 *       />
 *       <XDSTopNavMegaMenuItem title="Reports" href="/reports" />
 *     </>
 *   }
 * />
 * ```
 */
export function XDSTopNavMegaMenuItem({
  title,
  description,
  icon,
  href,
  onClick,
  as,
  tabIndex,
}: XDSTopNavMegaMenuItemProps) {
  const renderMode = useXDSTopNavRenderMode();
  const LinkComponent = useXDSLinkComponent(as);

  // =========================================================================
  // Drawer mode — matches SideNavItem / TopNavMenu drawer appearance
  // =========================================================================
  if (renderMode === 'drawer') {
    const Element = href ? LinkComponent : 'button';
    const elementProps = Element === 'button' ? {type: 'button' as const} : {};
    return (
      <Element
        href={href}
        onClick={onClick}
        {...elementProps}
        {...stylex.props(navItemStyles.item, styles.drawerItem)}>
        {icon && <div {...stylex.props(styles.drawerItemIcon)}>{icon}</div>}
        <div {...stylex.props(styles.drawerItemContent)}>
          {title}
          {description && (
            <span {...stylex.props(styles.drawerItemDescription)}>
              {description}
            </span>
          )}
        </div>
      </Element>
    );
  }

  // =========================================================================
  // Default mode — desktop popover item with large icon + description
  // =========================================================================
  const Element = href ? LinkComponent : 'div';
  return (
    <Element
      href={href}
      onClick={onClick}
      tabIndex={tabIndex}
      {...stylex.props(styles.desktop)}>
      {icon && <div {...stylex.props(styles.desktopIcon)}>{icon}</div>}
      <div {...stylex.props(styles.desktopContent)}>
        <span {...stylex.props(styles.desktopTitle)}>{title}</span>
        {description && (
          <span {...stylex.props(styles.desktopDescription)}>
            {description}
          </span>
        )}
      </div>
    </Element>
  );
}

XDSTopNavMegaMenuItem.displayName = 'XDSTopNavMegaMenuItem';
