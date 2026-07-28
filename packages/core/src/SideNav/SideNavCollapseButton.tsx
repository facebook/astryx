// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavCollapseButton.tsx
 * @input Uses React, StyleX, SideNavCollapseContext, getIcon
 * @output Exports SideNavCollapseButton component
 * @position Composable toggle button for sidenav collapse
 *
 * Place inside SideNav (reads context automatically) or outside
 * (pass handleRef to connect). Customizable via label/children.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/index.ts
 * - /packages/cli/templates/blocks/components/SideNav/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars} from '../theme/tokens.stylex';
import {getIcon} from '../Icon/globalIconRegistry';
import {Button} from '../Button';
import type {BaseProps} from '../BaseProps';
import {composeEventHandlers} from '../utils';
import {
  useSideNavCollapse,
  type SideNavCollapseState,
  type SideNavImperativeCollapseHandle,
} from './SideNavCollapseContext';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {useTranslator} from '../i18n';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  chevron: {
    display: 'inline-flex',
    alignItems: 'center',
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  chevronCollapsed: {
    transform: 'rotate(180deg)',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface SideNavCollapseButtonProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Imperative handle from SideNav. Only needed when the button is rendered
   * outside the sidenav, where collapse context is unavailable.
   */
  handleRef?: React.RefObject<SideNavImperativeCollapseHandle | null>;

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
 * Place anywhere inside SideNav (header, topContent, footer, footerIcons)
 * and it reads collapse state from context automatically. For placement
 * outside the sidenav (e.g. in TopNav or content area), pass handleRef.
 *
 * @example
 * ```
 * <SideNav isCollapsible footerIcons={<SideNavCollapseButton />}>
 *   ...
 * </SideNav>
 * ```
 *
 * @example
 * ```
 * const ref = useRef(null);
 * <TopNav endContent={<SideNavCollapseButton handleRef={ref} />} />
 * <SideNav handleRef={ref} collapsible>...</SideNav>
 * ```
 */
export function SideNavCollapseButton({
  ref,
  handleRef,
  label,
  children,
  onClick: onClickProp,
  ...props
}: SideNavCollapseButtonProps) {
  const t = useTranslator();
  const {isCollapsed, toggle, isCollapsible} =
    useSideNavCollapseState(handleRef);
  const {isMobile} = useAppShellMobile();

  // Hide when not collapsible, or when in mobile mode (sidenav is in
  // the mobile drawer — collapse doesn't apply there)
  if (!isCollapsible || isMobile) {
    return null;
  }

  return (
    <Button
      ref={ref}
      label={
        label ??
        (isCollapsed
          ? t('@astryx.sideNavCollapseButton.expandSidebar')
          : t('@astryx.sideNavCollapseButton.collapseSidebar'))
      }
      variant="ghost"
      {...props}
      onClick={composeEventHandlers(onClickProp, toggle)}
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
      isIconOnly
    />
  );
}

SideNavCollapseButton.displayName = 'SideNavCollapseButton';

function useSideNavCollapseState(
  handleRef:
    React.RefObject<SideNavImperativeCollapseHandle | null> | undefined,
): SideNavCollapseState {
  const contextCollapseState = useSideNavCollapse();

  if (handleRef == null) {
    return contextCollapseState;
  }

  const externalCollapseState = handleRef.current?.getCollapseState() ?? null;

  return {
    isCollapsed: externalCollapseState?.isCollapsed ?? false,
    toggle: () => {
      handleRef.current?.getCollapseState()?.toggle();
    },
    isCollapsible: externalCollapseState?.isCollapsible ?? true,
  };
}
