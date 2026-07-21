// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ClickableContainer.tsx
 * @input Uses useClickableContainer, useLinkComponent, useTooltip, StyleX
 * @output Exports ClickableContainer component
 * @position Generic interactivity primitive for clickable surfaces with nested interactives
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ClickableContainer/index.ts (exports if types change)
 * - /apps/storybook/stories/ClickableContainer.stories.tsx (storybook stories)
 *
 * DOM contract:
 * <div>                                ← NO role, NO tabIndex (not interactive to AT)
 *   ├─ <button|a aria-label={label}>  ← HIDDEN, FOCUSABLE real element (clip 1×1)
 *   │    carries role, name, focus, keyboard activation
 *   ├─ [hover / pressed overlay]      ← positioned visual affordance
 *   └─ <div>{children}</div>          ← INERT visible content (nested controls OK)
 */

import {useRef} from 'react';
import type {ReactNode, MouseEvent, Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import {useClickableContainer} from '../hooks/useClickableContainer';
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
    display: 'flex',
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
});

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
   * Uses `aria-disabled` so the container stays focusable and announced.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Explains why the container is disabled. When set together with `isDisabled`,
   * shows a tooltip with this text on hover and keyboard focus, and keeps the
   * container focusable via `aria-disabled` so the reason is discoverable.
   *
   * Use this instead of wrapping a disabled container in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <ClickableContainer label="Save" isDisabled
   *   disabledMessage="You need the Editor role">
   *   <Icon icon="save" size="md" />
   * </ClickableContainer>
   * ```
   */
  disabledMessage?: string;

  /**
   * Whether the container is read-only.
   * Keeps appearance and focusability but removes interaction.
   * @default false
   */
  isReadOnly?: boolean;

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
  isReadOnly = false,
  disabledMessage,
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

  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const effectiveOnClick = isReadOnly ? undefined : onClickProp;

  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    interactiveRef,
    onClick: effectiveOnClick,
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
      ref={mergeRefs(
        ref,
        containerRef,
        disabledTooltip.ref as Ref<HTMLDivElement>,
      )}
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
          aria-describedby={
            showsDisabledMessage ? disabledTooltip.describedBy : undefined
          }
          {...stylex.props(interactiveStyles.srOnly)}
        />
      ) : (
        <button
          ref={interactiveRef as Ref<HTMLButtonElement>}
          type="button"
          aria-label={label}
          aria-disabled={isDisabled || undefined}
          onClick={!isDisabled && !isReadOnly ? onClickProp : undefined}
          aria-describedby={
            showsDisabledMessage ? disabledTooltip.describedBy : undefined
          }
          {...stylex.props(interactiveStyles.srOnly)}
        />
      )}
      {children}
      {showsDisabledMessage && disabledTooltip.renderTooltip(disabledMessage)}
    </div>
  );
}

ClickableContainer.displayName = 'ClickableContainer';
