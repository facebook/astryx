// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Clickable.tsx
 * @input Uses useClickable, useClickableContainer, useLinkComponent, StyleX
 * @output Exports Clickable and ClickableContainer components
 * @position Generic interactivity primitives for making elements clickable
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Clickable/index.ts (exports if types change)
 * - /apps/storybook/stories/Clickable.stories.tsx (storybook stories)
 *
 * Three layers, smallest to largest:
 * 1. useClickable (hook) — returns spreadable a11y + handlers for a leaf element
 * 2. Clickable — button/link wrapper for a single target
 * 3. ClickableContainer — surface with safe nested interactives
 */

import {type ReactNode, type MouseEvent, useRef, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {useClickable} from '../hooks/useClickable';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {BaseProps} from '../BaseProps';
import {mergeProps, mergeRefs} from '../utils';

// =============================================================================
// Shared interactive styles
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
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderStyle: 'none',
  },
  block: {
    display: 'flex',
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
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the element should be rendered as a block-level element.
   * @default false
   */
  isBlock?: boolean;

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
 * <Clickable label="Settings" href="/settings" isBlock>
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
  isBlock = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ClickableProps) {
  const {clickableProps, role} = useClickable({
    label,
    href,
    onClick,
    isDisabled,
  });

  const LinkComponent = useLinkComponent();
  const Component = role === 'link' ? LinkComponent : 'button';

  const typeProp = role === 'button' ? {type: 'button' as const} : {};

  return (
    <Component
      ref={ref as never}
      href={role === 'link' ? href : undefined}
      target={role === 'link' ? target : undefined}
      {...typeProp}
      {...mergeProps(
        stylex.props(
          interactiveStyles.root,
          interactiveStyles.focusWithin,
          !isDisabled && interactiveStyles.overlay,
          !isDisabled && interactiveStyles.hoverOnPointer,
          isDisabled && interactiveStyles.disabled,
          isBlock && interactiveStyles.block,
          xstyle,
        ),
        className,
        style,
      )}
      {...clickableProps}
      {...props}>
      {children}
    </Component>
  );
}

Clickable.displayName = 'Clickable';

// =============================================================================
// ClickableContainer — surface with safe nested interactives
// =============================================================================

export interface ClickableContainerProps extends BaseProps {
  /** Ref forwarded to the root container element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Accessibility label for the container.
   * Required — provides the accessible name for screen readers.
   */
  label: string;

  /**
   * Click handler. Fires when the container surface is clicked
   * (not when nested interactive elements are clicked).
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Navigation URL. When provided, clicking the container navigates.
   * Ctrl/Cmd+click opens in a new tab.
   */
  href?: string;

  /**
   * Link target for href navigation.
   */
  target?: string;

  /**
   * Whether the container is disabled.
   * Disabled containers remain focusable (tabIndex 0) with aria-disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Content to render inside the container.
   * Can include nested interactive elements (buttons, links) — they will
   * work independently from the container's click/navigation behavior.
   */
  children?: ReactNode;
}

/**
 * A clickable surface that safely handles nested interactive elements.
 *
 * Wraps children in a `<div>` with a visually-hidden `<button>` or `<a>`
 * for the accessible role and label. Nested buttons, links, and inputs
 * work independently — clicking them does NOT trigger the container's
 * onClick or navigation.
 *
 * Use for clickable cards, rows, tiles, and other surfaces that contain
 * their own interactive elements.
 *
 * @example
 * ```
 * <ClickableContainer label="View details" onClick={handleView}>
 *   <Text type="body">Card content</Text>
 *   <Button label="Action" onClick={handleAction} />
 * </ClickableContainer>
 * ```
 */
export function ClickableContainer({
  label,
  onClick: onClickProp,
  onMouseUp: onMouseUpProp,
  href,
  target,
  isDisabled = false,
  children,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ClickableContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef<HTMLElement | null>(null);
  const LinkComponent = useLinkComponent();

  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    interactiveRef,
    onClick: onClickProp,
    href,
    target,
    disabled: isDisabled,
  });

  const handleMouseUp = onMouseUpProp
    ? (e: MouseEvent<HTMLElement>) => {
        onMouseUp(e);
        onMouseUpProp(e);
      }
    : onMouseUp;

  const isLink = href != null;

  return (
    <div
      ref={mergeRefs(ref, containerRef)}
      {...mergeProps(
        stylex.props(
          interactiveStyles.root,
          interactiveStyles.block,
          interactiveStyles.focusWithin,
          !isDisabled && interactiveStyles.overlay,
          !isDisabled && interactiveStyles.hoverOnPointer,
          isDisabled && interactiveStyles.disabled,
          xstyle,
        ),
        className,
        style,
      )}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? handleMouseUp : undefined}
      {...props}>
      {isLink ? (
        <LinkComponent
          ref={interactiveRef as Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          aria-label={label}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : 0}
          {...stylex.props(interactiveStyles.srOnly)}
        />
      ) : (
        <button
          ref={interactiveRef as Ref<HTMLButtonElement>}
          type="button"
          aria-label={label}
          disabled={isDisabled}
          onClick={onClickProp}
          {...stylex.props(interactiveStyles.srOnly)}
        />
      )}
      {children}
    </div>
  );
}

ClickableContainer.displayName = 'ClickableContainer';
