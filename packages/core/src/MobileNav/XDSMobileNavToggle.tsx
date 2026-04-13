'use client';

/**
 * @file XDSMobileNavToggle.tsx
 * @input Uses React, XDSButton, XDSIcon, AppShell mobile context
 * @output Exports XDSMobileNavToggle component
 * @position Standalone toggle button; can be placed anywhere in the AppShell tree.
 *
 * Hamburger button that opens/closes the mobile nav drawer.
 * Reads from AppShell mobile context — renders nothing above the mobile breakpoint.
 * Can be placed anywhere in the component tree (TopNav, content area, custom toolbar, etc.).
 */

import {type ReactNode} from 'react';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {useXDSAppShellMobile} from '../AppShell/XDSAppShellMobileContext';
import {XDSBaseProps} from '../XDSBaseProps';

export interface XDSMobileNavToggleProps extends Pick<
  XDSBaseProps,
  'xstyle' | 'className' | 'style'
> {
  /**
   * Custom content to render instead of the default hamburger icon.
   */
  children?: ReactNode;
  /**
   * Accessible label for the toggle button.
   * @default 'Open navigation'
   */
  label?: string;
  /**
   * Test ID for the button element.
   */
  'data-testid'?: string;
}

/**
 * Mobile nav toggle button. Reads from AppShell context to open/close
 * the mobile navigation drawer.
 *
 * Renders nothing when above the mobile breakpoint — safe to include
 * unconditionally in your layout.
 *
 * @example
 * ```
 * <div className="my-toolbar">
 *   <XDSMobileNavToggle />
 *   <h1>Page Title</h1>
 * </div>
 * <XDSMobileNavToggle label="Menu">
 *   <MyCustomMenuIcon />
 * </XDSMobileNavToggle>
 * ```
 */
export function XDSMobileNavToggle({
  children,
  label = 'Open navigation',
  'data-testid': testId,
  xstyle,
  className,
  style,
}: XDSMobileNavToggleProps) {
  const {isMobile, isMobileNavEnabled, toggleMobileNav} =
    useXDSAppShellMobile();

  // Don't render above the breakpoint or when mobile nav is disabled
  if (!isMobile || !isMobileNavEnabled) {
    return null;
  }

  return (
    <XDSButton
      variant="ghost"
      label={label}
      icon={children ?? <XDSIcon icon="menu" color="inherit" />}
      onClick={toggleMobileNav}
      data-testid={testId ?? 'mobile-nav-toggle'}
      xstyle={xstyle}
      className={className}
      style={style}
      isIconOnly
    />
  );
}

XDSMobileNavToggle.displayName = 'XDSMobileNavToggle';
