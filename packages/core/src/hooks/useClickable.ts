// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useClickable.ts
 * @input Label, href, onClick, isDisabled
 * @output clickableProps (spreadable handlers + a11y attributes) and resolved role
 * @position Generic interactivity primitive for turning a leaf element into a button/link
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (export)
 */

import type {KeyboardEvent, MouseEvent} from 'react';
import {useCallback} from 'react';
import {useInteractiveRole} from './useInteractiveRole';
import type {InteractiveRole} from './useInteractiveRole';

export interface UseClickableOptions {
  /**
   * Accessible name for the element. Required.
   */
  label: string;

  /**
   * Navigation URL. When provided, the element should render as a link.
   * The hook returns `role: 'link'` — the consumer must render as `<a>`
   * (via useLinkComponent) for href navigation to work.
   * For the button-only case, the returned `clickableProps` include
   * all necessary handlers and a11y attributes.
   */
  href?: string;

  /**
   * Click handler. When provided, the element acts as a button.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Whether the element is disabled.
   * Uses `aria-disabled` (not native `disabled`) so the element remains
   * focusable for screen reader users.
   * @default false
   */
  isDisabled?: boolean;
}

export interface UseClickableReturn {
  /**
   * Props to spread onto the target element.
   * Includes aria-label, aria-disabled, role, tabIndex, onClick, onKeyDown.
   * Does NOT include href — the consumer must render as `<a>` when role is 'link'.
   */
  clickableProps: {
    'aria-label'?: string;
    'aria-disabled'?: true | undefined;
    role?: string;
    tabIndex?: number | undefined;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
  };

  /**
   * The resolved interactive role.
   * - 'link' — render as `<a>` (via useLinkComponent)
   * - 'button' — render as `<button>` or spread clickableProps onto any element
   * - 'inert' — non-interactive, spread clickableProps only for label
   */
  role: InteractiveRole;
}

/**
 * Returns interaction handlers and a11y attributes to turn a single leaf
 * element into a button or link. No wrapper DOM.
 *
 * For the onClick/button case, spread `clickableProps` onto any element
 * to make it interactive with full keyboard support.
 *
 * For the href case, use `role` to conditionally render as a link element
 * (via useLinkComponent), then spread `clickableProps` for the remaining
 * a11y attributes.
 *
 * @compositionHint Use for leaf elements like Badge, Icon, or text spans
 * that need to become clickable without adding wrapper DOM nodes.
 * For surfaces with nested interactive elements, use ClickableContainer.
 *
 * @example
 * ```
 * // Button case — spread onto any element
 * const { clickableProps } = useClickable({ label: "Edit", onClick: handleEdit });
 * return <span {...clickableProps}>Edit</span>;
 * ```
 *
 * @example
 * ```
 * // Link case — conditional href
 * const { clickableProps, role } = useClickable({ label: "Profile", href: "/profile" });
 * if (role === 'link') {
 *   return <LinkComponent href="/profile" {...clickableProps}>Profile</LinkComponent>;
 * }
 * return <span {...clickableProps}>Profile</span>;
 * ```
 */
export function useClickable({
  label,
  href,
  onClick,
  isDisabled = false,
}: UseClickableOptions): UseClickableReturn {
  const role = useInteractiveRole({href, onClick, isDisabled});

  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (isDisabled) {
        return;
      }
      onClick?.(event);
    },
    [onClick, isDisabled],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isDisabled) {
        return;
      }
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      const el = event.currentTarget as HTMLElement;
      // Skip keyboard handling for native interactive elements (button, a, input, etc.)
      // that already handle Enter/Space natively, to avoid double-firing onClick.
      if (el.matches('button, a, input, select, textarea, [role="tab"]')) {
        return;
      }

      event.preventDefault();
      el.click();
    },
    [isDisabled],
  );

  const isInert = role === 'inert';

  const clickableProps = {
    'aria-label': label,
    'aria-disabled': (isDisabled && !isInert) || undefined,
    role: isInert ? undefined : role,
    tabIndex: isInert ? undefined : isDisabled ? -1 : 0,
    onClick: !isInert ? handleClick : undefined,
    onKeyDown: !isInert ? handleKeyDown : undefined,
  };

  return {clickableProps, role};
}
