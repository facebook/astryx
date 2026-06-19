// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useInteractiveRole.ts
 * @input Uses useInteractiveTrigger
 * @output Exports useInteractiveRole hook and InteractiveRole type
 * @position Hook utility; consumed by Token, Thumbnail, Item, ClickableCard, etc.
 *
 * Centralizes the "what element should I render as?" decision for
 * polymorphic components. The priority order:
 *
 *   1. href → 'link' (navigation always wins)
 *   2. onClick → 'button' (explicit interactivity)
 *   3. interactive trigger context → 'button' (implicit via parent)
 *   4. else → 'inert' (non-interactive)
 *
 * This hook is the single place to add new context-based triggers
 * (e.g., Popover, DropdownMenu, Disclosure). Components that consume
 * this hook never need updating when new trigger contexts are added.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (export)
 */

import {useInteractiveRoleContext} from '../InteractiveRoleContext/InteractiveRoleContext';

/**
 * The resolved interactive role for a polymorphic component.
 *
 * - `'link'` — render as `<a>` (via LinkComponent)
 * - `'button'` — render as `<button>`
 * - `'inert'` — render as `<span>` or `<div>` (non-interactive)
 */
export type InteractiveRole = 'link' | 'button' | 'inert';

export interface UseXDSInteractiveRoleOptions {
  /**
   * URL for link navigation. When provided, the component renders as a link.
   * Takes highest priority — a link always navigates.
   */
  href?: string;

  /**
   * Click handler. When provided, the component renders as a button.
   * Takes priority over context-based triggers.
   */
  onClick?: ((...args: never[]) => unknown) | null;

  /**
   * Whether the component is disabled. When true and href is provided,
   * falls back to button (disabled links are an a11y anti-pattern).
   * @default false
   */
  isDisabled?: boolean;
}

/**
 * Determines the interactive role for a polymorphic component.
 *
 * Centralizes the element-type decision so that adding new context-based
 * triggers (popover, dropdown, etc.) only requires updating this hook —
 * all consuming components inherit the new behavior automatically.
 *
 * @example
 * ```ts
 * function Token({ href, onClick, ... }) {
 *   const role = useInteractiveRole({ href, onClick });
 *
 *   switch (role) {
 *     case 'link': return <LinkComponent href={href} ...>{content}</LinkComponent>;
 *     case 'button': return <button ...>{content}</button>;
 *     case 'inert': return <span ...>{content}</span>;
 *   }
 * }
 * ```
 */
export function useInteractiveRole({
  href,
  onClick,
  isDisabled = false,
}: UseXDSInteractiveRoleOptions): InteractiveRole {
  const contextRole = useInteractiveRoleContext();

  // 1. href → link (unless disabled — disabled links fall through to button)
  if (href != null && !isDisabled) {
    return 'link';
  }

  // 2. Explicit onClick → button
  if (onClick != null) {
    return 'button';
  }

  // 3. Context-provided role override (e.g., Popover provides 'button')
  if (contextRole != null) {
    return contextRole;
  }

  // 4. Nothing interactive → inert
  return 'inert';
}
