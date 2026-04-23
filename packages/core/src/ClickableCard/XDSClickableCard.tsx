'use client';

/**
 * @file XDSClickableCard.tsx
 * @input Uses XDSCard, useClickableContainer, StyleX
 * @output Exports XDSClickableCard component and XDSClickableCardProps
 * @position Interactive card for navigation or action targets
 *
 * An interactive card that acts as a single navigation or action target.
 * Nested interactive elements (buttons, links) work independently —
 * clicking them does NOT trigger the card's onClick or navigation.
 *
 * For static display, use XDSCard.
 * For toggle selection, use XDSSelectableCard.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ClickableCard/ClickableCard.doc.mjs
 * - /packages/core/src/ClickableCard/index.ts
 * - /apps/storybook/stories/ClickableCard.stories.tsx
 */

import {type ReactNode, type MouseEvent, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {container} from '../Layout/container.stylex';
import type {SpacingToken} from '../Layout/container.stylex';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
  spacingStepToToken,
} from '../Layout/padding.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useClickableContainer} from '../hooks/useClickableContainer';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  card: {
    '--_card-radius': radiusVars['--radius-container'],
    borderRadius: 'var(--_card-radius)',
    overflow: 'clip',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: colorVars['--color-background-card'],
    position: 'relative',
    cursor: 'pointer',
    // Remove default anchor styles
    textDecoration: 'none',
    color: 'inherit',
    // Focus visible outline
    outlineOffset: '2px',
    ':focus-visible': {
      outline: `2px solid ${colorVars['--color-accent']}`,
    },
  },
  // Hover/active states applied to the card itself via ::after pseudo-element
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

const variantStyles = stylex.create({
  default: {
    backgroundColor: colorVars['--color-background-card'],
    borderColor: colorVars['--color-border-emphasized'],
  },
  transparent: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  muted: {
    backgroundColor: colorVars['--color-background-muted'],
    borderColor: 'transparent',
  },
});

// =============================================================================
// Props
// =============================================================================

export interface XDSClickableCardProps extends XDSBaseProps {
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
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;

  /**
   * Background color variant.
   * @default 'default'
   */
  variant?: 'default' | 'transparent' | 'muted';

  /**
   * Width of the card.
   */
  width?: SizeValue;

  /**
   * Height of the card.
   */
  height?: SizeValue;

  /**
   * Maximum width of the card.
   */
  maxWidth?: SizeValue;
}

// Dynamic sizing styles
const dynamicStyles = stylex.create({
  sizing: (
    width: SizeValue | null,
    height: SizeValue | null,
    maxWidth: SizeValue | null,
  ) => ({
    width: width ?? undefined,
    height: height ?? undefined,
    maxWidth: maxWidth ?? undefined,
  }),
});

// =============================================================================
// Component
// =============================================================================

/**
 * An interactive card that acts as a single navigation or action target.
 *
 * Nested interactive elements (buttons, links, inputs) work independently —
 * clicking them does NOT trigger the card's onClick or navigation.
 * This is handled automatically via the useClickableContainer hook.
 *
 * @compositionHint Use for cards that navigate to a detail page or trigger an action.
 * For toggle selection cards, use XDSSelectableCard instead.
 * Nest XDSButton or other interactive elements freely inside — they won't conflict.
 *
 * @example
 * ```tsx
 * <XDSClickableCard label="Settings" href="/settings">
 *   <XDSText weight="bold">Settings</XDSText>
 *   <XDSText color="secondary">Manage your preferences</XDSText>
 * </XDSClickableCard>
 * ```
 *
 * @example
 * ```tsx
 * <XDSClickableCard label="Open modal" onClick={() => setShowModal(true)}>
 *   <XDSText>Click anywhere to open</XDSText>
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
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSClickableCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    onClick: onClickProp,
    href,
    target,
    disabled: isDisabled,
  });

  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  return (
    <div
      ref={(node) => {
        (containerRef as any).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as any).current = node;
      }}
      role={href ? 'link' : 'button'}
      tabIndex={isDisabled ? -1 : 0}
      aria-label={label}
      aria-disabled={isDisabled || undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? onMouseUp : undefined}
      onKeyDown={
        !isDisabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as any);
              }
            }
          : undefined
      }
      {...mergeProps(
        xdsClassName('clickable-card', {variant}),
        stylex.props(
          styles.card,
          variantStyles[variant] ?? variantStyles.default,
          !isDisabled && styles.hoverState,
          isDisabled && styles.disabled,
          dynamicStyles.sizing(
            width ?? null,
            height ?? null,
            maxWidth ?? null,
          ),
          ...container(
            useThemeDefault
              ? {useThemeDefault: 'card'}
              : {
                  paddingInnerX: paddingToken,
                  paddingInnerY: paddingToken,
                  paddingOuterX: paddingToken,
                  paddingOuterY: paddingToken,
                },
          ),
          !useThemeDefault &&
            effectivePadding !== 4 &&
            paddingStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingInlineVarStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingBlockStartVarStyles[effectivePadding],
          !useThemeDefault &&
            effectivePadding !== 4 &&
            containerPaddingBlockEndVarStyles[effectivePadding],
          xstyle,
        ),
        className,
        style,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

XDSClickableCard.displayName = 'XDSClickableCard';
