/**
 * @file globalIconRegistry.tsx
 * @input None (pure module-level state)
 * @output Exports registerIcons, getIcon, resetIcons, XDSIconName, XDSIconRegistry
 * @position Global icon registry; works in both server and client environments
 *
 * This module has NO 'use client' directive — it's importable from RSC.
 * Components that need icons in server components use getIcon() directly.
 * Client components use useXDSIcon() from IconRegistryContext.tsx which
 * checks context first, then falls back to this global registry.
 */

import type {ReactNode} from 'react';
import {defaultIcons} from './defaultIcons';

// =============================================================================
// Types
// =============================================================================

/**
 * Known namespaced icon names used internally by XDS components.
 *
 * Names follow the pattern `component.role` — they describe where and why
 * an icon is used, not what it looks like. This lets themes override icons
 * per-component and prevents name collisions with marketplace components.
 *
 * The type also accepts any `${string}.${string}` pattern so marketplace
 * components can register their own namespaced icons:
 *
 * @example
 * ```
 * // Marketplace component registers its own icons
 * registerIcons({
 *   'ratingWidget.star': <StarIcon />,
 *   'ratingWidget.starEmpty': <StarOutlineIcon />,
 * });
 * ```
 */
export type XDSIconName =
  // Shared — used by multiple components (Dialog, MobileNav, Token, etc.)
  | 'close'
  // Selector / DropdownMenu / Collapsible / TabMenu
  | 'selector.chevron'
  | 'selector.check'
  // Navigation — Calendar, Pagination
  | 'nav.prev'
  | 'nav.next'
  | 'nav.menu'
  // Status — used by TextInput, NumberInput, Selector, DateInput, TextArea, TimeInput
  | 'status.success'
  | 'status.error'
  | 'status.warning'
  // Field
  | 'field.info'
  // Date/Time inputs
  | 'dateInput.calendar'
  | 'timeInput.clock'
  // Link
  | 'link.external'
  // MoreMenu
  | 'moreMenu.trigger'
  // Search
  | 'search.icon'
  // Extensible — marketplace components can register any namespaced icon
  | `${string}.${string}`;

/**
 * Icon registry mapping semantic names to React nodes.
 *
 * Uses a flexible record type so marketplace components can add
 * their own namespaced entries beyond the built-in XDS names.
 */
export type XDSIconRegistry = Record<XDSIconName, ReactNode>;

// =============================================================================
// Global Registry
// =============================================================================

let globalRegistry: Partial<XDSIconRegistry> = {};

/**
 * Register icons at the module level. Works in both server and client
 * environments. Call once at app initialization (e.g. root layout).
 *
 * Icons registered here are available to all components — including
 * server-rendered ones that can't access React Context.
 *
 * Marketplace components should register their own namespaced icons
 * at module level so themes can override them:
 *
 * @example
 * ```ts
 * // app/layout.tsx — register theme icons
 * import { registerIcons } from '@xds/core';
 * import { brandIcons } from './brand-icons';
 *
 * registerIcons(brandIcons);
 * ```
 *
 * @example
 * ```ts
 * // Marketplace component — register defaults at module level
 * import { registerIcons } from '@xds/core';
 *
 * // Theme can override these by registering the same keys
 * registerIcons({
 *   'ratingWidget.star': <StarIcon />,
 *   'ratingWidget.starEmpty': <StarOutlineIcon />,
 * });
 * ```
 */
export function registerIcons(icons: Partial<XDSIconRegistry>): void {
  globalRegistry = {...globalRegistry, ...icons};
}

/**
 * Get an icon by name from the global registry, falling back to defaults.
 *
 * Use this in server components where hooks aren't available.
 * In client components, prefer useXDSIcon() which also checks
 * the React Context registry.
 */
export function getIcon(name: XDSIconName): ReactNode {
  return globalRegistry[name] ?? defaultIcons[name];
}

/**
 * Get the raw global registry (internal use by useXDSIcon).
 * @internal
 */
export function getGlobalRegistry(): Partial<XDSIconRegistry> {
  return globalRegistry;
}

/**
 * Reset the global registry. For testing only.
 * @internal
 */
export function resetIcons(): void {
  globalRegistry = {};
}
