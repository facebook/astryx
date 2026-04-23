'use client';

/**
 * @file XDSSelectableCard.tsx
 * @input Uses XDSCard styles, useClickableContainer, StyleX
 * @output Exports XDSSelectableCard component and XDSSelectableCardProps
 * @position Interactive card for toggle selection
 *
 * A card that toggles between selected and unselected states.
 * Visually indicates selection with an accent border.
 *
 * For static display, use XDSCard.
 * For navigation or action cards, use XDSClickableCard.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SelectableCard/SelectableCard.doc.mjs
 * - /packages/core/src/SelectableCard/index.ts
 * - /apps/storybook/stories/SelectableCard.stories.tsx
 */

import {type ReactNode, type MouseEvent, type MutableRefObject, useRef, useCallback, type Ref} from 'react';
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
    // Always 2px border to prevent layout jitter on selection toggle.
    // Unselected uses the standard border color; selected uses accent.
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: colorVars['--color-background-card'],
    position: 'relative',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease',
    outlineOffset: '2px',
    ':focus-visible': {
      outline: `2px solid ${colorVars['--color-accent']}`,
    },
  },
  selected: {
    borderColor: colorVars['--color-accent'],
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

export interface XDSSelectableCardProps extends Omit<XDSBaseProps, 'onChange'> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Accessibility label for the card (required).
   * Describes the card's purpose to screen readers.
   */
  label: string;

  /**
   * Controlled selection state.
   * When true, the card shows an accent border indicating selection.
   */
  isSelected: boolean;

  /**
   * Selection change handler.
   * Called with the new selection state when the card is toggled.
   */
  onChange: (isSelected: boolean) => void;

  /**
   * Set to true to disable the card.
   * Suppresses click/hover/focus and selection toggle.
   */
  isDisabled?: boolean;

  /**
   * Content to render inside the card.
   */
  children?: ReactNode;

  /**
   * Internal padding of the card using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * @default 4 (16px)
   */
  padding?: SpacingStep;

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
 * A card that toggles between selected and unselected states.
 *
 * Visually indicates selection with an accent border. Supports hover,
 * pressed, focus, and disabled states.
 *
 * @compositionHint Use for multi-select or single-select card groups.
 * Manage selection state externally — use a Set for multi-select
 * or a single value for radio-style selection.
 * For navigation/action cards, use XDSClickableCard instead.
 *
 * @example Single select (radio behavior)
 * ```tsx
 * const [selected, setSelected] = useState<string | null>(null);
 *
 * {plans.map(plan => (
 *   <XDSSelectableCard
 *     key={plan.id}
 *     label={plan.name}
 *     isSelected={selected === plan.id}
 *     onChange={() => setSelected(plan.id)}
 *   >
 *     <XDSText weight="bold">{plan.name}</XDSText>
 *     <XDSText color="secondary">{plan.price}</XDSText>
 *   </XDSSelectableCard>
 * ))}
 * ```
 *
 * @example Multi-select (checkbox behavior)
 * ```tsx
 * const [selected, setSelected] = useState(new Set<string>());
 *
 * {filters.map(filter => (
 *   <XDSSelectableCard
 *     key={filter.id}
 *     label={filter.name}
 *     isSelected={selected.has(filter.id)}
 *     onChange={(isNowSelected) => {
 *       setSelected(prev => {
 *         const next = new Set(prev);
 *         isNowSelected ? next.add(filter.id) : next.delete(filter.id);
 *         return next;
 *       });
 *     }}
 *   >
 *     <XDSText>{filter.name}</XDSText>
 *   </XDSSelectableCard>
 * ))}
 * ```
 */
export function XDSSelectableCard({
  label,
  isSelected,
  onChange,
  isDisabled = false,
  children,
  padding,
  width,
  height,
  maxWidth,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSSelectableCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

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
    onClick: handleClick,
    disabled: isDisabled,
  });

  const useThemeDefault = padding == null;
  const effectivePadding = padding ?? 4;
  const paddingToken = spacingStepToToken[effectivePadding] as SpacingToken;

  return (
    <div
      ref={(node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref != null)
          (ref as MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      role="checkbox"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={label}
      aria-checked={isSelected}
      aria-disabled={isDisabled || undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? onMouseUp : undefined}
      onKeyDown={
        !isDisabled
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(!isSelected);
              }
            }
          : undefined
      }
      {...mergeProps(
        xdsClassName('selectable-card', {
          selected: isSelected ? 'true' : 'false',
        }),
        stylex.props(
          styles.card,
          isSelected && styles.selected,
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

XDSSelectableCard.displayName = 'XDSSelectableCard';
