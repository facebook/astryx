// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSClickableCard.tsx
 * @input Uses XDSCard, useClickableContainer, StyleX
 * @output Exports XDSClickableCard component and XDSClickableCardProps
 * @position Interactive card for navigation or action targets
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ClickableCard/ClickableCard.doc.mjs (props table, features)
 * - /packages/core/src/ClickableCard/index.ts (exports if types change)
 * - /apps/storybook/stories/ClickableCard.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Card/ClickableCardShowcase.tsx (showcase block)
 * - /packages/cli/templates/blocks/components/Card/ClickableCardWithNestedButton.tsx (block)
 *
 * Composes XDSCard for all visual styling (radius, padding, variants,
 * container tokens, theming). Adds an interactive wrapper with
 * useClickableContainer for safe nested interactive elements.
 *
 * A hidden <button> or <a> inside the card provides the accessible role,
 * label, and focus ring — the card surface itself has no role/tabIndex.
 * This gives screen readers a real interactive element to announce while
 * keeping the visual hover/active overlay on the full card.
 *
 * For static display, use XDSCard.
 * For toggle selection, use XDSSelectableCard.
 */

import {type ReactNode, type MouseEvent, useRef, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {xdsClassName, mergeRefs} from '../utils';
import {XDSCard} from '../Card/XDSCard';
import type {XDSCardVariant} from '../Card/XDSCard';
import {useClickableContainer} from '../hooks/useClickableContainer';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';

// =============================================================================
// Styles — only the interactive layer, Card handles everything else
// =============================================================================

const styles = stylex.create({
  interactive: {
    position: 'relative',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    outlineOffset: '2px',
  },
  focusWithin: {
    ':has(:focus-visible)': {
      outline: `2px solid ${colorVars['--color-accent']}`,
      outlineOffset: '2px',
    },
  },
  // Hover overlay — guarded by @media (hover: hover) so touch devices
  // don't show a stuck hover state. Active/pressed state works everywhere.
  overlay: {
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transition: 'background-color 0.15s ease',
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
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

// =============================================================================
// Props
// =============================================================================

export interface XDSClickableCardProps extends XDSBaseProps {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Accessibility label for the card.
   * Used as `aria-label` — provides the accessible name for screen readers.
   * When the card has visible text that serves as its label, prefer
   * passing that text here so the screen reader announcement matches.
   */
  label: string;

  /**
   * Click handler. Fires when the card surface is clicked
   * (not when nested interactive elements are clicked).
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;

  /**
   * Navigation URL. When provided, clicking the card navigates to this URL.
   * Ctrl/Cmd+click opens in a new tab.
   */
  href?: string;

  /**
   * Link target for href navigation.
   * @default '_self'
   */
  target?: string;

  /**
   * Set to true to disable the card.
   * Disabled cards remain focusable (tabIndex 0) with aria-disabled
   * so screen reader users can discover them.
   */
  isDisabled?: boolean;

  /**
   * Content to render inside the card.
   * Can include nested interactive elements (buttons, links) — they will
   * work independently from the card's click/navigation behavior.
   */
  children?: ReactNode;

  /**
   * Internal padding of the card using the spacing scale.
   * @default 4 (16px)
   */
  padding?: SpacingStep;

  /**
   * Background color variant.
   * @default 'default'
   */
  variant?: XDSCardVariant;

  /** Width of the card. */
  width?: SizeValue;

  /** Height of the card. */
  height?: SizeValue;

  /** Maximum width of the card. */
  maxWidth?: SizeValue;
}

// =============================================================================
// Component
// =============================================================================

/**
 * An interactive card that acts as a single navigation or action target.
 *
 * Composes XDSCard for visual styling and adds an interactive layer
 * with useClickableContainer. Nested interactive elements (buttons,
 * links, inputs) work independently — clicking them does NOT trigger
 * the card's onClick or navigation.
 *
 * A visually-hidden <button> or <a> inside the card provides the
 * accessible role and label. The card surface is a plain <div> —
 * no role or tabIndex on the container.
 *
 * @compositionHint Use for cards that navigate to a detail page or trigger an action.
 * For toggle selection cards, use XDSSelectableCard instead.
 * Nest XDSButton or other interactive elements freely inside — they won't conflict.
 *
 * @example
 * ```
 * <XDSClickableCard label="Settings" href="/settings">
 *   <XDSText type="body" weight="bold">Settings</XDSText>
 *   <XDSText type="supporting" color="secondary">Manage your preferences</XDSText>
 * </XDSClickableCard>
 * ```
 *
 * @example
 * ```
 * <XDSClickableCard label="Open modal" onClick={() => setShowModal(true)}>
 *   <XDSText type="body">Click anywhere to open</XDSText>
 *   <XDSButton label="Other action" onClick={handleOther} />
 * </XDSClickableCard>
 * ```
 */
export function XDSClickableCard({
  label,
  onClick: onClickProp,
  onMouseUp: onMouseUpProp,
  href,
  target,
  isDisabled = false,
  children,
  padding,
  variant = 'default',
  width,
  height,
  maxWidth,
  ref,
  xstyle: xstyleProp,
  className: classNameProp,
  style,
  ...props
}: XDSClickableCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef<HTMLElement | null>(null);
  const LinkComponent = useXDSLinkComponent();

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
    <XDSCard
      ref={mergeRefs(ref, containerRef)}
      width={width}
      height={height}
      maxWidth={maxWidth}
      padding={padding}
      variant={variant}
      className={
        classNameProp
          ? `${xdsClassName('clickable-card', {variant})} ${classNameProp}`
          : xdsClassName('clickable-card', {variant})
      }
      xstyle={
        [
          styles.interactive,
          styles.focusWithin,
          !isDisabled && styles.overlay,
          !isDisabled && styles.hoverOnPointer,
          isDisabled && styles.disabled,
          xstyleProp,
        ] as unknown as StyleXStyles
      }
      style={style}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? handleMouseUp : undefined}
      {...props}>
      {isLink ? (
        <LinkComponent
          ref={interactiveRef as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          aria-label={label}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : 0}
          {...stylex.props(styles.srOnly)}
        />
      ) : (
        <button
          ref={interactiveRef as React.Ref<HTMLButtonElement>}
          type="button"
          aria-label={label}
          disabled={isDisabled}
          onClick={onClickProp}
          {...stylex.props(styles.srOnly)}
        />
      )}
      {children}
    </XDSCard>
  );
}

XDSClickableCard.displayName = 'XDSClickableCard';
