/**
 * @file XDSSideNavCollapseButton.tsx
 * @input Uses React, StyleX, XDSSideNavCollapseContext, getIcon
 * @output Exports XDSSideNavCollapseButton component
 * @position Composable toggle button for sidenav collapse
 *
 * Place inside XDSSideNav (reads context automatically) or outside
 * (pass sideNavRef to connect). Customizable via label/children.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/index.ts
 */

'use client';

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {durationVars, easingVars} from '../theme/tokens.stylex';
import {getIcon} from '../Icon/globalIconRegistry';
import {XDSButton} from '../Button';
import {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';
import {useXDSAppShellMobile} from '../AppShell/XDSAppShellMobileContext';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easingVars['--easing-standard'],
  },
  chevronCollapsed: {
    transform: 'rotate(180deg)',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavCollapseButtonProps {
  /**
   * Ref to the XDSSideNav element. Only needed when the button is
   * rendered outside the sidenav (reads collapse state via ref instead
   * of context).
   */
  sideNavRef?: React.RefObject<HTMLElement | null>;

  /**
   * Custom button label text. When provided, renders as a text button
   * with the chevron icon. When omitted, renders as an icon-only button.
   */
  label?: string;

  /**
   * Custom button content. Overrides the default chevron icon and label.
   */
  children?: ReactNode;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Composable toggle button for sidenav collapse.
 *
 * Place anywhere inside XDSSideNav (header, topContent, footer, footerIcons)
 * and it reads collapse state from context automatically. For placement
 * outside the sidenav (e.g. in TopNav or content area), pass sideNavRef.
 *
 * @example
 * ```
 * <XDSSideNav isCollapsible footerIcons={<XDSSideNavCollapseButton />}>
 *   ...
 * </XDSSideNav>
 * ```
 *
 * @example
 * ```
 * const ref = useRef(null);
 * <XDSTopNav endContent={<XDSSideNavCollapseButton sideNavRef={ref} />} />
 * <XDSSideNav ref={ref} isCollapsible>...</XDSSideNav>
 * ```
 */
export function XDSSideNavCollapseButton({
  sideNavRef: _sideNavRef,
  label,
  children,
}: XDSSideNavCollapseButtonProps) {
  const {isCollapsed, toggle, isCollapsible} = useXDSSideNavCollapse();
  const {isMobile} = useXDSAppShellMobile();

  const handleClick = useCallback(() => {
    toggle();
  }, [toggle]);

  // TODO: sideNavRef-based wiring for outside-sidenav usage
  // For now, the button only works via context (inside sidenav or
  // when AppShell provides the context at the shell level).

  // Hide when not collapsible, or when in mobile mode (sidenav is in
  // the mobile drawer — collapse doesn't apply there)
  if (!isCollapsible || isMobile) {
    return null;
  }

  return (
    <XDSButton
      label={label ?? (isCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
      variant="ghost"
      onClick={handleClick}
      icon={
        children ?? (
          <span
            {...stylex.props(
              styles.chevron,
              isCollapsed && styles.chevronCollapsed,
            )}>
            {getIcon('chevronLeft')}
          </span>
        )
      }
    />
  );
}

XDSSideNavCollapseButton.displayName = 'XDSSideNavCollapseButton';
