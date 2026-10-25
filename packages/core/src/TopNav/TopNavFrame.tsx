// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TopNavFrame.tsx
 * @input Uses TopNavRenderContext, TopNavSlotContext and a lazily loaded
 *   client TopNav
 * @output Exports TopNavFrame (the landmark around a server-rendered TopNav)
 *   and TopNavSlotScope (the slot a server-rendered section belongs to)
 * @position Client parts of TopNavShell.tsx.
 *   - TopNavFrame renders the `<nav>` landmark around the bar the server
 *     rendered (TopNavLocalizedFrame supplies the default label in the page's
 *     locale when the caller gives none). AppShell renders
 *     its `topNav` three times and tells each copy its mode through
 *     TopNavRenderContext; a Server Component cannot read that. In the mobile
 *     bar this renders TopNavMobileBar at once (AppShell has already loaded
 *     the drawer toggle); in the drawer, the client TopNav (MobileNav and the
 *     divider), loaded only then.
 *   - TopNavSlotScope tells the menus inside a section which slot they are in,
 *     as the client TopNav does; it renders no DOM of its own.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/TopNav/TopNavShell.tsx
 * - /packages/core/src/TopNav/TopNav.tsx (default mode markup and slots)
 * - /packages/core/src/__tests__/serverEntryClientParts.ts
 */

import {lazy, Suspense, type ReactNode} from 'react';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {useTopNavRenderMode} from './TopNavRenderContext';
import {useTopNavMobileContent} from './TopNavMobileContentContext';
import {TopNavMobileBar} from './TopNavMobileBar';
import {TopNavSlotContext, type TopNavSlot} from './TopNavContext';
import type {TopNavProps} from './TopNav';

const ClientTopNav = lazy(async () =>
  import('./TopNav').then(mod => ({default: mod.TopNav})),
);

// AppShell imports MobileNavToggle itself, so in its mobile bar this module is
// already loaded and resolves at once; outside AppShell it is never needed.
const MobileNavToggle = lazy(async () =>
  import('../MobileNav/MobileNavToggle').then(mod => ({
    default: mod.MobileNavToggle,
  })),
);

export interface TopNavFrameProps {
  /** The props TopNav was rendered with: data only, no functions. */
  topNavProps: TopNavProps;
  /** The landmark's accessible name. */
  label: string;
  /** The landmark's classes, style and the caller's other attributes. */
  rootProps: Record<string, unknown>;
  /** The bar's sections, as the server rendered them. */
  children: ReactNode;
}

/**
 * The landmark around a server-rendered TopNav; the client TopNav in
 * AppShell's mobile bar and drawer.
 */
export function TopNavFrame({
  topNavProps,
  label,
  rootProps,
  children,
}: TopNavFrameProps): ReactNode {
  const renderMode = useTopNavRenderMode();
  const mobileContent = useTopNavMobileContent();
  const {hasAutoToggle} = useAppShellMobile();
  if (renderMode === 'mobile-bar') {
    // Rendered here rather than by the client TopNav, so the switch to the
    // mobile bar is immediate. Same markup as TopNav.tsx's mobile bar.
    const {
      heading,
      startContent,
      children: startAlias,
      centerContent,
      endContent,
      label: _label,
      ...barProps
    } = topNavProps;
    const hasDrawerContent =
      (startContent ?? startAlias) != null ||
      centerContent != null ||
      mobileContent != null;
    return (
      <TopNavMobileBar
        {...barProps}
        label={label}
        heading={heading}
        endContent={endContent}
        toggle={
          hasDrawerContent && hasAutoToggle ? (
            <Suspense fallback={null}>
              <MobileNavToggle />
            </Suspense>
          ) : null
        }
      />
    );
  }
  if (renderMode === 'drawer') {
    // The drawer opens later; AppShell renders it hidden ahead of time, which
    // loads the client TopNav before it is shown.
    return (
      <Suspense fallback={null}>
        <ClientTopNav {...topNavProps} />
      </Suspense>
    );
  }
  return (
    <nav role="navigation" aria-label={label} {...rootProps}>
      {children}
    </nav>
  );
}

TopNavFrame.displayName = 'TopNavFrame';

export interface TopNavSlotScopeProps {
  slot: TopNavSlot;
  children: ReactNode;
}

/** Sets the TopNav slot for the menus inside a server-rendered section. */
export function TopNavSlotScope({
  slot,
  children,
}: TopNavSlotScopeProps): ReactNode {
  return <TopNavSlotContext value={slot}>{children}</TopNavSlotContext>;
}

TopNavSlotScope.displayName = 'TopNavSlotScope';
