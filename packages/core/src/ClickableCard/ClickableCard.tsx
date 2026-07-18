// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ClickableCard.tsx
 * @input Uses Card, useClickableContainer, StyleX
 * @output Exports ClickableCard component and ClickableCardProps
 * @position Interactive card for navigation or action targets
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ClickableCard/ClickableCard.doc.mjs (props table, features)
 * - /packages/core/src/ClickableCard/index.ts (exports if types change)
 * - /apps/storybook/stories/ClickableCard.stories.tsx (storybook stories)
 * - /packages/core/templates/blocks/components/Card/ClickableCardShowcase.tsx (showcase block)
 * - /packages/core/templates/blocks/components/Card/ClickableCardWithNestedButton.tsx (block)
 *
 * Composes Card for all visual styling (radius, padding, variants,
 * container tokens, theming). Adds an interactive wrapper with
 * useClickableContainer for safe nested interactive elements.
 *
 * A hidden <button> or <a> inside the card provides the accessible role,
 * label, and focus ring — the card surface itself has no role/tabIndex.
 * This gives screen readers a real interactive element to announce while
 * keeping the visual hover/active overlay on the full card.
 *
 * For static display, use Card.
 * For toggle selection, use SelectableCard.
 */

import {type ReactNode, type MouseEvent, useRef, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {mergeProps, mergeRefs} from '../utils';
import {Card} from '../Card/Card';
import type {CardVariant} from '../Card/Card';
import {useClickableContainer} from '../hooks/useClickableContainer';
import type {BaseProps} from '../BaseProps';
import {useLinkComponent} from '../Link/useLinkComponent';
import {themeProps} from '../utils/themeProps';

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
  // Borderless variants (everything except `default`): drop the transparent
  // 1px border Card applies. The overlay is inset to the padding box — inside
  // that border — so a transparent border strip stays untinted on hover and
  // reads as a faint ring. With no border, the overlay covers the full box
  // edge-to-edge and the ring disappears.
  borderless: {
    borderWidth: 0,
  },
  // Bordered variant (`default`): draw the 1px border *within* the padding by
  // subtracting the border width from every side. Total inset (border +
  // padding) then equals the borderless variants' padding, so content geometry
  // and outer dimensions stay identical across all variants. The border rests
  // at the subtle token and emphasizes on hover.
  bordered: {
    borderColor: colorVars['--color-border'],
    paddingInlineStart: `calc(var(--container-padding-inline-start) - ${borderVars['--border-width']})`,
    paddingInlineEnd: `calc(var(--container-padding-inline-end) - ${borderVars['--border-width']})`,
    paddingBlockStart: `calc(var(--container-padding-block-start) - ${borderVars['--border-width']})`,
    paddingBlockEnd: `calc(var(--container-padding-block-end) - ${borderVars['--border-width']})`,
    transitionProperty: 'border-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  // Emphasize the bordered variant's border on hover. Guarded by
  // @media (hover: hover) so touch devices don't get a stuck hover state.
  borderedHoverOnPointer: {
    '@media (hover: hover)': {
      ':hover': {
        borderColor: colorVars['--color-border-emphasized'],
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

export interface ClickableCardProps extends BaseProps {
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
  variant?: CardVariant;

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
 * Composes Card for visual styling and adds an interactive layer
 * with useClickableContainer. Nested interactive elements (buttons,
 * links, inputs) work independently — clicking them does NOT trigger
 * the card's onClick or navigation.
 *
 * A visually-hidden <button> or <a> inside the card provides the
 * accessible role and label. The card surface is a plain <div> —
 * no role or tabIndex on the container.
 *
 * @compositionHint Use for cards that navigate to a detail page or trigger an action.
 * For toggle selection cards, use SelectableCard instead.
 * Nest Button or other interactive elements freely inside — they won't conflict.
 *
 * @example
 * ```
 * <ClickableCard label="Settings" href="/settings">
 *   <Text type="body" weight="bold">Settings</Text>
 *   <Text type="supporting" color="secondary">Manage your preferences</Text>
 * </ClickableCard>
 * ```
 *
 * @example
 * ```
 * <ClickableCard label="Open modal" onClick={() => setShowModal(true)}>
 *   <Text type="body">Click anywhere to open</Text>
 *   <Button label="Other action" onClick={handleOther} />
 * </ClickableCard>
 * ```
 */
export function ClickableCard({
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
}: ClickableCardProps) {
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

  // Only the `default` variant has a visible border. Card draws a transparent
  // 1px border on every other variant purely to avoid layout jitter; we drop
  // it here so the hover overlay covers the full box with no untinted ring.
  const hasBorder = variant === 'default';

  return (
    <Card
      ref={mergeRefs(ref, containerRef)}
      width={width}
      height={height}
      maxWidth={maxWidth}
      padding={padding}
      variant={variant}
      {...mergeProps(themeProps('clickable-card', {variant}), {
        className: classNameProp,
        style,
      })}
      xstyle={
        [
          styles.interactive,
          styles.focusWithin,
          hasBorder ? styles.bordered : styles.borderless,
          !isDisabled && styles.overlay,
          !isDisabled && styles.hoverOnPointer,
          !isDisabled && hasBorder && styles.borderedHoverOnPointer,
          isDisabled && styles.disabled,
          xstyleProp,
        ] as unknown as StyleXStyles
      }
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
    </Card>
  );
}

ClickableCard.displayName = 'ClickableCard';
