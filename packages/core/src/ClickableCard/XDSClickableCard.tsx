'use client';

/**
 * @file XDSClickableCard.tsx
 * @input Uses XDSCard, useClickableContainer, StyleX
 * @output Exports XDSClickableCard component and XDSClickableCardProps
 * @position Interactive card for navigation or action targets
 *
 * Composes XDSCard for all visual styling (radius, padding, variants,
 * container tokens, theming). Adds an interactive wrapper with
 * useClickableContainer for safe nested interactive elements.
 *
 * For static display, use XDSCard.
 * For toggle selection, use XDSSelectableCard.
 */

import {
  type ReactNode,
  type MouseEvent,
  type MutableRefObject,
  useRef,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {xdsClassName} from '../utils';
import {XDSCard} from '../Card/XDSCard';
import type {XDSCardVariant} from '../Card/XDSCard';
import {useClickableContainer} from '../hooks/useClickableContainer';

// =============================================================================
// Styles — only the interactive layer, Card handles everything else
// =============================================================================

const styles = stylex.create({
  interactive: {
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
    outlineOffset: '2px',
    ':focus-visible': {
      outline: `2px solid ${colorVars['--color-accent']}`,
    },
  },
  hoverState: {
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transition: 'background-color 0.15s ease',
      backgroundColor: 'transparent',
    },
    ':hover::after': {
      backgroundColor: 'color-mix(in srgb, currentColor 5%, transparent)',
    },
    ':active::after': {
      backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

// =============================================================================
// Props
// =============================================================================

export interface XDSClickableCardProps {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Accessibility label for the card (required).
   * Describes the card's purpose to screen readers.
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
   * Suppresses click/hover/focus states.
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
   * - `default`: standard card background with visible border
   * - `transparent`: no background, no border
   * - `muted`: subtle muted background
   * - Non-semantic palette: `blue | cyan | gray | green | orange | pink | purple | red | teal | yellow`
   * @default 'default'
   */
  variant?: XDSCardVariant;

  /** Width of the card. */
  width?: SizeValue;

  /** Height of the card. */
  height?: SizeValue;

  /** Maximum width of the card. */
  maxWidth?: SizeValue;

  /** Allow data-* attributes. */
  [key: `data-${string}`]: string | undefined;
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
 * @compositionHint Use for cards that navigate to a detail page or trigger an action.
 * For toggle selection cards, use XDSSelectableCard instead.
 * Nest XDSButton or other interactive elements freely inside — they won't conflict.
 *
 * @example
 * ```tsx
 * <XDSClickableCard label="Settings" href="/settings">
 *   <XDSText type="body" weight="bold">Settings</XDSText>
 *   <XDSText type="supporting" color="secondary">Manage your preferences</XDSText>
 * </XDSClickableCard>
 * ```
 *
 * @example
 * ```tsx
 * <XDSClickableCard label="Open modal" onClick={() => setShowModal(true)}>
 *   <XDSText type="body">Click anywhere to open</XDSText>
 *   <XDSButton label="Other action" onClick={handleOther} />
 * </XDSClickableCard>
 * ```
 */
export function XDSClickableCard({
  label,
  onClick: onClickProp,
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
  ...props
}: XDSClickableCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    onClick: onClickProp,
    href,
    target,
    disabled: isDisabled,
  });

  return (
    <XDSCard
      ref={(node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref != null)
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      width={width}
      height={height}
      maxWidth={maxWidth}
      padding={padding}
      variant={variant}
      className={xdsClassName('clickable-card', {variant})}
      xstyle={[
        styles.interactive,
        !isDisabled && styles.hoverState,
        isDisabled && styles.disabled,
      ]}
      role={href ? 'link' : 'button'}
      tabIndex={isDisabled ? -1 : 0}
      aria-label={label}
      aria-disabled={isDisabled || undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? onMouseUp : undefined}
      onKeyDown={
        !isDisabled
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as MouseEvent<HTMLElement>);
              }
            }
          : undefined
      }
      {...props}>
      {children}
    </XDSCard>
  );
}

XDSClickableCard.displayName = 'XDSClickableCard';
