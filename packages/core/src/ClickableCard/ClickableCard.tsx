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
 * - /packages/cli/assets/templates/blocks/components/Card/ClickableCardShowcase.tsx (showcase block)
 * - /packages/cli/assets/templates/blocks/components/Card/ClickableCardWithNestedButton.tsx (block)
 * - /packages/cli/assets/templates/blocks/components/Card/ClickableCardElevated.tsx (block)
 *
 * Composes Card for all visual styling (radius, padding, variants,
 * container tokens, theming). Adds an interactive wrapper with
 * useClickableContainer for safe nested interactive elements.
 *
 * An invisible <button> or <a> inside the card provides the accessible role,
 * label, and focus ring — the card surface itself has no role/tabIndex.
 * This gives screen readers a real interactive element to announce while
 * keeping the visual hover/active overlay on the full card.
 *
 * The control is not clipped to 1×1: it occupies the card's top padding
 * band, so a pointer press aimed at the element that carries the role —
 * speech input, assistive technology, automation — lands on it. It never
 * overlaps the content box, so nested controls, inputs, and text selection
 * behave exactly as they would in a plain Card.
 *
 * For static display, use Card.
 * For toggle selection, use SelectableCard.
 */

import {
  type ReactNode,
  type MouseEvent,
  useCallback,
  useRef,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  borderVars,
  colorVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import type {SizeValue, SpacingStep, Elevation} from '../utils/types';
import {mergeProps} from '../utils';
import {Card} from '../Card/Card';
import type {CardVariant} from '../Card/Card';
import {useClickableContainer} from '../hooks/useClickableContainer';
import type {BaseProps} from '../BaseProps';
import {useLinkComponent} from '../Link/useLinkComponent';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';

import {useMergedRefs} from '../hooks/useMergedRefs';
// =============================================================================
// Styles — only the interactive layer, Card handles everything else
// =============================================================================

const styles = stylex.create({
  interactive: {
    position: 'relative',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    textDecoration: 'none',
    color: 'inherit',
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
      backgroundColor: colorVars['--color-overlay-pressed'],
    },
  },
  hoverOnPointer: {
    '@media (hover: hover)': {
      ':hover:where(:not(:disabled,[aria-disabled="true"]))::after': {
        backgroundColor: colorVars['--color-overlay-hover'],
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
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
        borderColor: colorVars['--color-border-emphasized'],
      },
    },
  },
  disabled: {
    cursor: 'default',
    opacity: 0.5,
  },
  // The accessible control lives in the card's top padding band — the frame,
  // never the content box — so a pointer press aimed at the element carrying
  // the role lands on it without covering anything a consumer rendered.
  // Invisible, not clipped: it keeps real geometry for hit-testing and stays
  // in the accessibility tree. `minHeight` keeps it hit-testable at padding 0.
  control: {
    position: 'absolute',
    top: 0,
    insetInline: 0,
    height: 'var(--container-padding-block-start)',
    minHeight: '1px',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    opacity: 0,
    cursor: {
      default: 'inherit',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  // The bordered variant draws its border inside the padding variable, so the
  // real padding band is one border-width shorter; match it exactly so the
  // control never overlaps the first row of content.
  controlBordered: {
    height: `calc(var(--container-padding-block-start) - ${borderVars['--border-width']})`,
  },
  // A disabled link card keeps `href` for its role. Sealing the control from
  // the pointer covers every path that would follow it — click, middle-click,
  // context menu, drag — and the surface runs nothing while disabled.
  controlDisabled: {
    pointerEvents: 'none',
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

  /**
   * Resting elevation — the shadow depth the card sits at. Often raised to
   * signal that the whole card is clickable.
   * @default 'none'
   */
  elevation?: Elevation;

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
 * An invisible <button> or <a> in the card's top padding band provides the
 * accessible role and label and receives pointer activation. The card
 * surface is a plain <div> — no role or tabIndex on the container.
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
  elevation = 'none',
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

  // A press that lands on the role-bearing control itself — a pointer aimed
  // at the element that is the button/link, or Enter/Space on it — is still a
  // card activation. Run the consumer's callback here, on the surface, so
  // `currentTarget` is the card and `preventDefault()` cancels the control's
  // own default action (link navigation); the container hook would otherwise
  // treat the control as a nested interactive element and skip the callback.
  //
  // A surface click on an href card is proxied by the hook to `link.click()`,
  // and that synthetic click bubbles back through this handler while the hook
  // is still running. It is the same activation, already delivered to the
  // consumer, so it is ignored — otherwise `onClick` would run twice.
  const proxyingRef = useRef(false);
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (proxyingRef.current) {
        return;
      }
      const control = interactiveRef.current;
      if (
        control != null &&
        event.target instanceof Node &&
        control.contains(event.target)
      ) {
        onClickProp?.(event);
        return;
      }
      proxyingRef.current = true;
      try {
        onClick(event);
      } finally {
        proxyingRef.current = false;
      }
    },
    [onClick, onClickProp],
  );

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
      ref={useMergedRefs(ref, containerRef)}
      width={width}
      height={height}
      maxWidth={maxWidth}
      padding={padding}
      variant={variant}
      elevation={elevation}
      {...mergeProps(
        themeProps('clickable-card', {variant}),
        focusOutlineProps.focusWithin(),
        classNameProp,
        style,
      )}
      xstyle={
        [
          styles.interactive,
          hasBorder ? styles.bordered : styles.borderless,
          !isDisabled && styles.overlay,
          !isDisabled && styles.hoverOnPointer,
          !isDisabled && hasBorder && styles.borderedHoverOnPointer,
          isDisabled && styles.disabled,
          xstyleProp,
        ] as unknown as StyleXStyles
      }
      onClick={!isDisabled ? handleClick : undefined}
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
          {...stylex.props(
            styles.control,
            hasBorder && styles.controlBordered,
            isDisabled && styles.controlDisabled,
          )}
        />
      ) : (
        <button
          ref={interactiveRef as React.Ref<HTMLButtonElement>}
          type="button"
          aria-label={label}
          disabled={isDisabled}
          {...stylex.props(styles.control, hasBorder && styles.controlBordered)}
        />
      )}
      {children}
    </Card>
  );
}

ClickableCard.displayName = 'ClickableCard';
