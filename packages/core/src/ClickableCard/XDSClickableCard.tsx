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
    position: 'relative',
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

  const isLink = href != null;

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
      role={isLink ? 'link' : 'button'}
      tabIndex={0}
      aria-label={label}
      aria-disabled={isDisabled || undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? onMouseUp : undefined}
      onKeyDown={
        !isDisabled
          ? (e: React.KeyboardEvent) => {
              // Links activate on Enter only; buttons activate on Enter + Space
              if (e.key === 'Enter' || (!isLink && e.key === ' ')) {
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
