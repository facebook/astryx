// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavCollapseContext.ts
 * @input React createContext, use
 * @output Exports SideNavCollapseContext, useSideNavCollapse and the registry
 *   of collapse toggles rendered outside a SideNav, keyed by the collapse
 *   state each toggle shares with its nav
 * @position Internal context for sidenav collapse state
 *
 * Provides collapse state to SideNavCollapseButton and other
 * sidenav children. Set by SideNav when isCollapsible is true.
 * A button rendered outside the SideNav tree is out of context's reach and
 * takes the controlled `collapsible` config as a prop instead.
 */

import {createContext, use, type Ref} from 'react';

export interface SideNavCollapseState {
  /**
   * Whether the sidenav is currently collapsed. Inside a nav that hides
   * entirely (`collapsedWidth: 0`) this stays `false` while collapsed: there
   * is no visible collapsed form to morph into, and the content has to keep
   * its expanded layout while it slides out of view.
   */
  isCollapsed: boolean;
  /** Toggle collapse state */
  toggle: () => void;
  /** Whether collapse is enabled */
  isCollapsible: boolean;
}

/** Object form of SideNav's `collapsible` prop. */
export interface SideNavCollapsibleConfig {
  defaultIsCollapsed?: boolean;
  isCollapsed?: boolean;
  onCollapsedChange?: (isCollapsed: boolean) => void;
  hasButton?: boolean;
  buttonLabel?: string;
  /**
   * Width (px) of the collapsed nav. Defaults to the icon rail. `0` hides the
   * nav entirely, for focused single-pane UIs (e.g. chat) where the rail is
   * not wanted; pair it with a `SideNavCollapseButton` rendered outside the
   * nav, since the built-in one hides with it. A fully hidden nav is `inert`,
   * so its links can't take keyboard focus while invisible, and its content
   * keeps the expanded layout (see `SideNavCollapseState.isCollapsed`). If
   * focus is inside the nav when the collapse starts, it is parked on the
   * outside toggle that shares this nav's collapse state (the same
   * `onCollapsedChange`, or the same `handleRef`) before `inert` lands, so
   * it is never yanked to `<body>` mid-slide. With no such toggle it is
   * blurred instead, with a dev warning.
   */
  collapsedWidth?: number;
  /**
   * Slide the content out and back in when collapsing to `collapsedWidth: 0`.
   * Only `transform` animates; the box itself snaps in one reflow (after the
   * slide on collapse, before it on expand). The icon rail always snaps:
   * animating it would mean animating `width`. Any other `collapsedWidth`
   * therefore ignores this and warns in development. Honours
   * `prefers-reduced-motion`.
   */
  isAnimated?: boolean;
}

/**
 * The controlled form: the consumer holds the state, so it can be handed to
 * both SideNav and a SideNavCollapseButton rendered outside it.
 */
export interface SideNavControlledCollapsible extends SideNavCollapsibleConfig {
  isCollapsed: boolean;
  onCollapsedChange: (isCollapsed: boolean) => void;
}

/**
 * @deprecated Pass the same controlled `collapsible` config to SideNav and to
 * the out-of-tree SideNavCollapseButton instead. The state then reaches the
 * button through props rather than through a ref.
 */
export interface SideNavImperativeCollapseHandle {
  getCollapseState: () => SideNavCollapseState | null;
}

export const SideNavCollapseContext = createContext<SideNavCollapseState>({
  isCollapsed: false,
  toggle: () => {},
  isCollapsible: false,
});
SideNavCollapseContext.displayName = 'SideNavCollapseContext';

/**
 * Read the sidenav collapse state from context.
 * Returns { isCollapsed, toggle, isCollapsible }.
 * When used outside a sidenav with isCollapsible, isCollapsible is false.
 */
export function useSideNavCollapse(): SideNavCollapseState {
  return use(SideNavCollapseContext);
}

/**
 * What ties a SideNavCollapseButton rendered outside a SideNav to that nav:
 * the controlled `onCollapsedChange` both were handed, or the deprecated
 * `handleRef` both hold. Matched by identity, so the documented wiring (one
 * controlled config for both sides) is also what pairs them.
 */
export interface SideNavCollapseAssociation {
  onCollapsedChange?: ((isCollapsed: boolean) => void) | undefined;
  handleRef?: Ref<SideNavImperativeCollapseHandle | null> | undefined;
}

// Collapse toggles rendered outside a SideNav, registered by
// SideNavCollapseButton along with the collapse state each one shares with
// its nav. When a fully-hidden collapse (`collapsedWidth: 0`) starts while
// focus is inside the nav, the nav parks focus on its own toggle before it
// goes `inert`. Module scope rather than context: the outside button and the
// nav share no ancestor of their own, only the consumer's layout. The
// association is read at lookup time, so a button keeps its object current
// rather than re-registering.
const externalCollapseToggles = new Map<
  HTMLElement,
  SideNavCollapseAssociation
>();

/** Registers a collapse toggle rendered outside a SideNav; returns the matching unregister. */
export function registerExternalCollapseToggle(
  element: HTMLElement,
  association: SideNavCollapseAssociation,
): () => void {
  externalCollapseToggles.set(element, association);
  return () => {
    externalCollapseToggles.delete(element);
  };
}

function sharesCollapseState(
  a: SideNavCollapseAssociation,
  b: SideNavCollapseAssociation,
): boolean {
  return (
    (a.onCollapsedChange != null &&
      a.onCollapsedChange === b.onCollapsedChange) ||
    (a.handleRef != null && a.handleRef === b.handleRef)
  );
}

/**
 * The first registered toggle that shares `nav`'s collapse state, is in the
 * document and is not inside `nav`. Never an unrelated toggle: with two navs
 * on a page that would land a keyboard user on the control for the other
 * one, which is worse than a blur.
 */
export function findExternalCollapseToggle(
  nav: HTMLElement,
  association: SideNavCollapseAssociation,
): HTMLElement | null {
  for (const [element, toggleAssociation] of externalCollapseToggles) {
    if (
      element.isConnected &&
      !nav.contains(element) &&
      sharesCollapseState(association, toggleAssociation)
    ) {
      return element;
    }
  }
  return null;
}
