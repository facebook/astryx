// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectableCard.tsx
 * @input Uses Card, useClickableContainer, StyleX
 * @output Exports SelectableCard component and SelectableCardProps
 * @position Interactive card for toggle selection
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SelectableCard/SelectableCard.doc.mjs (props table, features)
 * - /packages/core/src/SelectableCard/index.ts (exports if types change)
 * - /apps/storybook/stories/SelectableCard.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Card/SelectableCardShowcase.tsx (showcase block)
 * - /packages/cli/templates/blocks/components/Card/SelectableCardMulti.tsx (block)
 *
 * Composes Card for all visual styling. Adds selection state with
 * an inset box-shadow (zero layout jitter) and useClickableContainer
 * for safe nested interactive elements.
 *
 * A hidden <input type="checkbox"> inside the card provides the accessible
 * role, label, and checked state — the card surface itself has no role/tabIndex.
 *
 * For static display, use Card.
 * For navigation or action cards, use ClickableCard.
 */

import {
  type ReactNode,
  type MouseEvent,
  useRef,
  useCallback,
  type Ref,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import type {SizeValue, SpacingStep} from '../utils/types';
import {mergeProps, mergeRefs} from '../utils';
import {Card} from '../Card/Card';
import type {CardVariant} from '../Card/Card';
import {useClickableContainer} from '../hooks/useClickableContainer';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Styles — selection + interaction; Card handles the rest
// =============================================================================

const styles = stylex.create({
  interactive: {
    position: 'relative',
    cursor: 'pointer',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
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
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  // Selection indicator — inset box-shadow for the thick inner ring (zero layout
  // jitter) plus borderColor change on the card's own border for a cohesive look.
  selected: {
    borderColor: colorVars['--color-accent'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-accent']}`,
  },
  selectedBlue: {
    borderColor: colorVars['--color-border-blue'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-blue']}`,
  },
  selectedCyan: {
    borderColor: colorVars['--color-border-cyan'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-cyan']}`,
  },
  selectedGray: {
    borderColor: colorVars['--color-border-gray'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-gray']}`,
  },
  selectedGreen: {
    borderColor: colorVars['--color-border-green'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-green']}`,
  },
  selectedOrange: {
    borderColor: colorVars['--color-border-orange'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-orange']}`,
  },
  selectedPink: {
    borderColor: colorVars['--color-border-pink'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-pink']}`,
  },
  selectedPurple: {
    borderColor: colorVars['--color-border-purple'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-purple']}`,
  },
  selectedRed: {
    borderColor: colorVars['--color-border-red'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-red']}`,
  },
  selectedTeal: {
    borderColor: colorVars['--color-border-teal'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-teal']}`,
  },
  selectedYellow: {
    borderColor: colorVars['--color-border-yellow'],
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-yellow']}`,
  },
});

const selectedStyleForVariant = (variant: CardVariant) => {
  switch (variant) {
    case 'default':
    case 'transparent':
    case 'muted':
      return styles.selected;
    case 'blue':
      return styles.selectedBlue;
    case 'cyan':
      return styles.selectedCyan;
    case 'gray':
      return styles.selectedGray;
    case 'green':
      return styles.selectedGreen;
    case 'orange':
      return styles.selectedOrange;
    case 'pink':
      return styles.selectedPink;
    case 'purple':
      return styles.selectedPurple;
    case 'red':
      return styles.selectedRed;
    case 'teal':
      return styles.selectedTeal;
    case 'yellow':
      return styles.selectedYellow;
  }
};

// =============================================================================
// Props
// =============================================================================

export interface SelectableCardProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Accessibility label for the card.
   * Used as `aria-label` — provides the accessible name for screen readers.
   */
  label: string;

  /**
   * Controlled selection state.
   * When true, the card shows an inset accent border indicating selection.
   */
  isSelected: boolean;

  /**
   * Selection change handler.
   * Called with the new selection state when the card is toggled.
   */
  onChange: (isSelected: boolean) => void;

  /**
   * Set to true to disable the card.
   * Disabled cards remain focusable (tabIndex 0) with aria-disabled
   * so screen reader users can discover them.
   */
  isDisabled?: boolean;

  /** Content to render inside the card. */
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
 * A card that toggles between selected and unselected states.
 *
 * Composes Card for visual styling and adds selection state with
 * an inset box-shadow (zero layout jitter vs plain Card). Supports
 * hover, pressed, focus, and disabled states.
 *
 * A visually-hidden <input type="checkbox"> inside the card provides
 * the accessible role, label, and checked state. The card surface
 * is a plain <div> — no role or tabIndex on the container.
 *
 * @compositionHint Use for multi-select or single-select card groups.
 * Manage selection state externally — use a Set for multi-select
 * or a single value for radio-style selection.
 * For navigation/action cards, use ClickableCard instead.
 *
 * @example
 * ```
 * <SelectableCard
 *   label="Option A"
 *   isSelected={selected === 'a'}
 *   onChange={() => setSelected('a')}>
 *   <Text type="body" weight="bold">Option A</Text>
 * </SelectableCard>
 * ```
 */
export function SelectableCard({
  label,
  isSelected,
  onChange,
  onClick: onClickProp,
  onMouseUp: onMouseUpProp,
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
}: SelectableCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef<HTMLInputElement | null>(null);

  const handleClick = useCallback(
    (_event: MouseEvent<HTMLElement>) => {
      if (!isDisabled) {
        onChange(!isSelected);
      }
    },
    [isDisabled, isSelected, onChange],
  );

  const {onClick, onMouseUp} = useClickableContainer({
    containerRef,
    interactiveRef,
    onClick: handleClick,
    disabled: isDisabled,
  });

  const composedOnClick = onClickProp
    ? (e: MouseEvent<HTMLElement>) => {
        onClick(e);
        onClickProp(e);
      }
    : onClick;

  const composedOnMouseUp = onMouseUpProp
    ? (e: MouseEvent<HTMLElement>) => {
        onMouseUp(e);
        onMouseUpProp(e);
      }
    : onMouseUp;

  return (
    <Card
      ref={mergeRefs(ref, containerRef)}
      width={width}
      height={height}
      maxWidth={maxWidth}
      padding={padding}
      variant={variant}
      {...mergeProps(
        themeProps('selectable-card', {
          variant,
          selected: isSelected ? 'true' : 'false',
        }),
        {className: classNameProp, style},
      )}
      xstyle={
        [
          styles.interactive,
          styles.focusWithin,
          isSelected && selectedStyleForVariant(variant),
          !isDisabled && styles.overlay,
          !isDisabled && styles.hoverOnPointer,
          isDisabled && styles.disabled,
          xstyleProp,
        ] as unknown as StyleXStyles
      }
      onClick={!isDisabled ? composedOnClick : undefined}
      onMouseUp={!isDisabled ? composedOnMouseUp : undefined}
      {...props}>
      <input
        ref={interactiveRef}
        type="checkbox"
        checked={isSelected}
        aria-label={label}
        disabled={isDisabled}
        onChange={() => onChange(!isSelected)}
        {...stylex.props(styles.srOnly)}
      />
      {children}
    </Card>
  );
}

SelectableCard.displayName = 'SelectableCard';
