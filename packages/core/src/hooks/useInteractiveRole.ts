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
 *   1. href → 'link' (navigation always wins, unless disabled)
 *   2. onClick → 'button' (explicit interactivity)
 *   3. interactive trigger context → 'button' (implicit via parent)
 *   4. else → 'inert' (non-interactive)
 *
 * A disabled `href` is excluded at step 1 and therefore resolves via the
 * remaining steps — 'inert' when no onClick or context applies.
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

export interface UseInteractiveRoleOptions {
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
   * Whether the component is disabled. When true, an `href` is ignored for
   * role resolution (a disabled link is an a11y anti-pattern), so the role is
   * decided by the remaining inputs: `onClick` → `'button'`, an interactive
   * context → its role, otherwise `'inert'`. In particular a disabled `href`
   * with no `onClick` and no context override resolves to `'inert'`, not a
   * link or a button.
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
}: UseInteractiveRoleOptions): InteractiveRole {
  const contextRole = useInteractiveRoleContext();

  // 1. href → link (unless disabled — a disabled href is skipped here and
  // resolved by the checks below, landing on 'inert' if nothing else applies)
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
