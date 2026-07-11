// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Clickable.tsx
 * @input Uses useClickable, useLinkComponent, useTooltip, StyleX
 * @output Exports Clickable component
 * @position Generic interactivity primitive for making elements clickable
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Clickable/index.ts (exports if types change)
 * - /apps/storybook/stories/Clickable.stories.tsx (storybook stories)
 *
 * Three layers, smallest to largest:
 * 1. useClickable (hook) — returns spreadable a11y + handlers for a leaf element
 * 2. Clickable — button/link wrapper for a single target
 * 3. ClickableContainer (separate file) — surface with safe nested interactives
 */

import type {ReactNode, MouseEvent, Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {useClickable} from '../hooks/useClickable';
import {useLinkComponent} from '../Link/useLinkComponent';
import {useTooltip} from '../Tooltip/useTooltip';
import type {BaseProps} from '../BaseProps';
import {mergeProps, mergeRefs} from '../utils';

// =============================================================================
// Interactive styles
// =============================================================================

const interactiveStyles = stylex.create({
  root: {
    position: 'relative',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    display: 'inline-flex',
    outlineOffset: '2px',
  },
  focusWithin: {
    ':has(:focus-visible)': {
      outline: `2px solid ${colorVars['--color-accent']}`,
      outlineOffset: '2px',
    },
  },
  overlay: {
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transitionProperty: 'background-color',
      transitionDuration: durationVars['--duration-fast'],
      transitionTimingFunction: easeVars['--ease-standard'],
      backgroundColor: 'transparent',
    },
    ':active::after': {
      backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
    },
  },
  hoverOnPointer: {
    '@media (hover: hover)': {
      ':hover::after': {
        backgroundColor: 'color-mix(in srgb, currentColor 5%, transparent)',
      },
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

// =============================================================================
// Clickable — button/link wrapper for a single target
// =============================================================================

export interface ClickableProps extends BaseProps {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLElement>;

  /**
   * Accessibility label for the clickable element.
   * Required — provides the accessible name for screen readers.
   */
  label: string;

  /**
   * Click handler. Fires when the element is clicked.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Navigation URL. When provided, renders as a link.
   */
  href?: string;

  /**
   * Link target for href navigation.
   */
  target?: string;

  /**
   * Whether the element is disabled.
   * Uses `aria-disabled` so the element stays focusable and announced.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Explains why the element is disabled. When set together with `isDisabled`,
   * shows a tooltip with this text on hover and keyboard focus, and keeps the
   * element focusable via `aria-disabled` so the reason is discoverable.
   *
   * Use this instead of wrapping a disabled element in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Clickable label="Save" isDisabled
   *   disabledMessage="You need the Editor role" onClick={handleSave}>
   *   <Icon icon="save" size="md" />
   * </Clickable>
   * ```
   */
  disabledMessage?: string;

  /**
   * Whether the element is read-only.
   * Keeps appearance and focusability but removes interaction.
   * @default false
   */
  isReadOnly?: boolean;

  /**
   * Content to render inside the clickable element.
   */
  children?: ReactNode;
}

/**
 * A button/link wrapper that makes a single child element interactive.
 *
 * Renders the child inside a `<button>` or `<a>` (via useLinkComponent)
 * with a hover/active overlay and focus-visible outline.
 * No padding of its own — purely an interactivity/affordance layer.
 *
 * For leaf elements that just need to be clickable without wrapper DOM, use useClickable.
 * For clickable surfaces with nested interactive elements, use ClickableContainer.
 *
 * @example
 * ```
 * <Clickable label="Settings" href="/settings">
 *   <Badge label="3" />
 * </Clickable>
 * ```
 *
 * @example
 * ```
 * <Clickable label="Open" onClick={handleOpen}>
 *   <Icon icon="add" size="md" />
 * </Clickable>
 * ```
 */
export function Clickable({
  label,
  onClick,
  href,
  target,
  isDisabled = false,
  isReadOnly = false,
  disabledMessage,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ClickableProps) {
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const effectiveOnClick = isReadOnly && onClick ? () => {} : onClick;

  const {clickableProps, role} = useClickable({
    label,
    href,
    onClick: effectiveOnClick,
    isDisabled,
  });

  const LinkComponent = useLinkComponent();
  const Component = role === 'link' ? LinkComponent : 'button';

  const typeProp = role === 'button' ? {type: 'button' as const} : {};

  const isLink = role === 'link';

  // When a disabled link falls back to button (role='inert'), we still need
  // aria-disabled and tabIndex so the element is announced and focusable.
  const disabledLinkFallback =
    isDisabled && href != null && role === 'inert'
      ? {'aria-disabled': true as const, tabIndex: -1}
      : {};

  return (
    <Component
      ref={mergeRefs(ref, disabledTooltip.ref) as never}
      href={isLink ? href : undefined}
      target={isLink ? target : undefined}
      {...typeProp}
      {...mergeProps(
        stylex.props(
          interactiveStyles.root,
          interactiveStyles.focusWithin,
          !isDisabled && interactiveStyles.overlay,
          !isDisabled && interactiveStyles.hoverOnPointer,
          isDisabled && interactiveStyles.disabled,
          xstyle,
        ),
        className,
        style,
      )}
      {...clickableProps}
      {...disabledLinkFallback}
      aria-describedby={
        showsDisabledMessage ? disabledTooltip.describedBy : undefined
      }
      {...props}>
      {children}
      {showsDisabledMessage && disabledTooltip.renderTooltip(disabledMessage)}
    </Component>
  );
}

Clickable.displayName = 'Clickable';
