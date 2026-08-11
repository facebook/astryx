// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavCollapseButton.tsx
 * @input Uses React, StyleX, SideNavCollapseContext, Icon
 * @output Exports SideNavCollapseButton component
 * @position Composable toggle button for sidenav collapse
 *
 * Place inside SideNav (reads context automatically) or outside
 * (pass handleRef to connect). Customizable via label/children.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/index.ts
 * - /packages/cli/assets/templates/blocks/components/SideNav/ (showcase blocks)
 */

import React, {useCallback, useSyncExternalStore, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {durationVars, easeVars} from '../theme/tokens.stylex';
import {Icon} from '../Icon';
import {Button} from '../Button';
import type {BaseProps} from '../BaseProps';
import {composeEventHandlers, rtlStyles} from '../utils';
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
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
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
          // The RTL mirror stays on its own element, wrapping (not merged
          // into) the state rotation: both are `transform`, so on a single
          // element one would overwrite the other and the chevron would stop
          // mirroring under RTL. See utils/rtlStyles.ts.
          <span {...stylex.props(rtlStyles.mirror)}>
            {/* `sm` (1rem) matches what this glyph already renders at: Button's
                icon slot pins its wrapper to 16px, and the registry SVG is
                1em, so the chevron is 16px today. */}
            <Icon
              icon="chevronLeft"
              size="sm"
              color="inherit"
              xstyle={[styles.chevron, isCollapsed && styles.chevronCollapsed]}
            />
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

  // Out-of-tree mode: the state lives in a SideNav this component is not a
  // descendant of, so it is an external store. Subscribing (rather than
  // reading `handleRef.current` during render) is what keeps the chevron and
  // the label in step with the sidenav after a toggle.
  const subscribe = useCallback(
    (listener: () => void) =>
      handleRef?.current?.subscribe?.(listener) ?? (() => {}),
    [handleRef],
  );

  const getSnapshot = useCallback(
    () => handleRef?.current?.getCollapseState() ?? null,
    [handleRef],
  );

  const externalCollapseState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    // The handle is null on the server — there is no SideNav to read from.
    () => null,
  );

  const toggle = useCallback(() => {
    handleRef?.current?.getCollapseState()?.toggle();
  }, [handleRef]);

  if (handleRef == null) {
    return contextCollapseState;
  }

  return {
    isCollapsed: externalCollapseState?.isCollapsed ?? false,
    toggle,
    isCollapsible: externalCollapseState?.isCollapsible ?? true,
  };
}
