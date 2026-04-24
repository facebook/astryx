'use client';

/**
 * @file XDSSelectableCard.tsx
 * @input Uses XDSCard, useClickableContainer, StyleX
 * @output Exports XDSSelectableCard component and XDSSelectableCardProps
 * @position Interactive card for toggle selection
 *
 * Composes XDSCard for all visual styling. Adds selection state with
 * an inset box-shadow (zero layout jitter) and useClickableContainer
 * for safe nested interactive elements.
 *
 * For static display, use XDSCard.
 * For navigation or action cards, use XDSClickableCard.
 */

import {
  type ReactNode,
  type MouseEvent,
  type MutableRefObject,
  useRef,
  useCallback,
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
// Styles — selection + interaction; Card handles the rest
// =============================================================================

const styles = stylex.create({
  interactive: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s ease',
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
  // Selection indicator — uses inset box-shadow so the card's border-width
  // stays identical to XDSCard. Zero layout jitter.
  selected: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-accent']}`,
  },
  selectedBlue: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-blue']}`,
  },
  selectedCyan: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-cyan']}`,
  },
  selectedGray: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-gray']}`,
  },
  selectedGreen: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-green']}`,
  },
  selectedOrange: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-orange']}`,
  },
  selectedPink: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-pink']}`,
  },
  selectedPurple: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-purple']}`,
  },
  selectedRed: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-red']}`,
  },
  selectedTeal: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-teal']}`,
  },
  selectedYellow: {
    boxShadow: `inset 0 0 0 2px ${colorVars['--color-border-yellow']}`,
  },
});

const selectedStyleForVariant = (variant: XDSCardVariant) => {
  switch (variant) {
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
    default:
      return styles.selected;
  }
};

// =============================================================================
// Props
// =============================================================================

export interface XDSSelectableCardProps {
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
 * A card that toggles between selected and unselected states.
 *
 * Composes XDSCard for visual styling and adds selection state with
 * an inset box-shadow (zero layout jitter vs plain Card). Supports
 * hover, pressed, focus, and disabled states.
 *
 * @compositionHint Use for multi-select or single-select card groups.
 * Manage selection state externally — use a Set for multi-select
 * or a single value for radio-style selection.
 * For navigation/action cards, use XDSClickableCard instead.
 *
 * @example
 * ```tsx
 * // Single select (radio behavior)
 * const [selected, setSelected] = useState<string | null>(null);
 *
 * {plans.map(plan => (
 *   <XDSSelectableCard
 *     key={plan.id}
 *     label={plan.name}
 *     isSelected={selected === plan.id}
 *     onChange={() => setSelected(plan.id)}
 *   >
 *     <XDSText type="body" weight="bold">{plan.name}</XDSText>
 *   </XDSSelectableCard>
 * ))}
 * ```
 *
 * @example
 * ```tsx
 * // Multi-select (checkbox behavior)
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
 *     <XDSText type="body">{filter.name}</XDSText>
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
  variant = 'default',
  width,
  height,
  maxWidth,
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
      className={xdsClassName('selectable-card', {
        variant,
        selected: isSelected ? 'true' : 'false',
      })}
      xstyle={[
        styles.interactive,
        isSelected && selectedStyleForVariant(variant),
        !isDisabled && styles.hoverState,
        isDisabled && styles.disabled,
      ]}
      role="checkbox"
      tabIndex={0}
      aria-label={label}
      aria-checked={isSelected}
      aria-disabled={isDisabled || undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseUp={!isDisabled ? onMouseUp : undefined}
      onKeyDown={
        !isDisabled
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(!isSelected);
              }
            }
          : undefined
      }
      {...props}>
      {children}
    </XDSCard>
  );
}

XDSSelectableCard.displayName = 'XDSSelectableCard';
