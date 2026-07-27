// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MobileNavToggle.tsx
 * @input Uses React, Button, Icon, AppShell mobile context
 * @output Exports MobileNavToggle component
 * @position Standalone toggle button; can be placed anywhere in the AppShell tree.
 *
 * Hamburger button that opens/closes the mobile nav drawer.
 * Reads from AppShell mobile context — renders nothing above the mobile breakpoint.
 * Can be placed anywhere in the component tree (TopNav, content area, custom toolbar, etc.).
 */

import React, {type ReactNode} from 'react';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import type {BaseProps} from '../BaseProps';
import {useTranslator} from '../i18n';

export interface MobileNavToggleProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  ref?: React.Ref<HTMLButtonElement>;
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
 *   <MobileNavToggle />
 *   <h1>Page Title</h1>
 * </div>
 * <MobileNavToggle label="Menu">
 *   <MyCustomMenuIcon />
 * </MobileNavToggle>
 * ```
 */
export function MobileNavToggle({
  ref,
  children,
  label: labelFromProps,
  'data-testid': testId,
  xstyle,
  className,
  style,
}: MobileNavToggleProps) {
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.mobileNav.toggle.open');
  const {
    isMobile,
    isMobileNavEnabled,
    isMobileNavOpen,
    mobileNavId,
    toggleMobileNav,
  } = useAppShellMobile();

  // Don't render above the breakpoint or when mobile nav is disabled
  if (!isMobile || !isMobileNavEnabled) {
    return null;
  }

  return (
    <Button
      ref={ref}
      variant="ghost"
      label={label}
      icon={children ?? <Icon icon="menu" color="inherit" />}
      onClick={toggleMobileNav}
      aria-expanded={isMobileNavOpen}
      aria-controls={mobileNavId || undefined}
      data-testid={testId ?? 'mobile-nav-toggle'}
      xstyle={xstyle}
      className={className}
      style={style}
      isIconOnly
    />
  );
}

MobileNavToggle.displayName = 'MobileNavToggle';
