/**
 * @file XDSToggleButton.tsx
 * @input Uses React forwardRef, ButtonHTMLAttributes, StyleX, theme tokens
 * @output Exports XDSToggleButton component, XDSToggleButtonProps, XDSToggleButtonVariant, XDSToggleButtonSize types
 * @position Core implementation; consumed by index.ts, tested by XDSToggleButton.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/README.md (props table, features, implementation notes)
 * - /packages/core/src/ToggleButton/XDSToggleButton.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/ToggleButton/index.ts (exports if types change)
 * - /apps/storybook/stories/ToggleButton.stories.tsx (storybook stories)
 */

import {
  forwardRef,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  sizeVars,
  spacingVars,
  radiusVars,
  transitionVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {ThemeContext} from '../theme/ThemeContext';
import {XDSTooltip} from '../Layer/XDSTooltip';
import {XDSSpinner} from '../Spinner';

// =============================================================================
// Styles
// =============================================================================

/**
 * Base toggle button styles.
 * Shares the same foundation as XDSButton but with toggle-specific interaction.
 */
const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: radiusVars['--radius-element'],
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-base'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    cursor: 'pointer',
    transitionProperty: 'background-image, transform, background-color',
    transitionDuration: transitionVars['--transition-fast'],
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.98)',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
    transform: {
      default: null,
      ':active': null,
    },
  },
  readOnly: {
    cursor: 'default',
    transform: {
      default: null,
      ':active': null,
    },
  },
  iconOnly: {
    aspectRatio: '1 / 1',
    paddingInline: spacingVars['--spacing-2'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-sm'],
  },
  md: {
    height: sizeVars['--size-md'],
  },
  lg: {
    height: sizeVars['--size-lg'],
  },
});

// =============================================================================
// Variant styles — unpressed state
// =============================================================================

const variants = stylex.create({
  ghost: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
  secondary: {
    backgroundColor: colorVars['--color-deemphasized'],
    color: colorVars['--color-text-primary'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
  outline: {
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-divider-emphasized'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-focus-outline']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '3px',
    },
  },
});

// =============================================================================
// Read-only variant overrides — remove hover/active overlays
// =============================================================================

const readOnlyVariants = stylex.create({
  ghost: {
    backgroundImage: {
      default: null,
      ':hover': null,
      ':active': null,
    },
  },
  secondary: {
    backgroundImage: {
      default: null,
      ':hover': null,
      ':active': null,
    },
  },
  outline: {
    backgroundImage: {
      default: null,
      ':hover': null,
      ':active': null,
    },
  },
});

// =============================================================================
// Pressed state styles — applied on top of variant when isPressed=true
// =============================================================================

const pressedStyles = stylex.create({
  ghost: {
    backgroundColor: colorVars['--color-pressed-overlay'],
    color: colorVars['--color-icon-primary'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
  },
  secondary: {
    backgroundColor: colorVars['--color-pressed-overlay'],
    color: colorVars['--color-icon-primary'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
  },
  outline: {
    backgroundColor: colorVars['--color-pressed-overlay'],
    color: colorVars['--color-icon-primary'],
    borderColor: colorVars['--color-divider-emphasized'],
    backgroundImage: {
      default: null,
      ':hover': `linear-gradient(${colorVars['--color-hover-overlay']}, ${colorVars['--color-hover-overlay']})`,
      ':active': `linear-gradient(${colorVars['--color-pressed-overlay']}, ${colorVars['--color-pressed-overlay']})`,
    },
  },
});

// =============================================================================
// Types
// =============================================================================

/**
 * Toggle button variant type.
 * Limited to ghost, secondary, and outline — primary and destructive
 * are not appropriate for toggle buttons.
 */
export type XDSToggleButtonVariant = keyof typeof variants;

/**
 * Toggle button size type.
 */
export type XDSToggleButtonSize = keyof typeof sizeStyles;

// =============================================================================
// Module Augmentation
// =============================================================================

declare module '../theme/types' {
  interface ComponentStyles {
    toggleButton?: {
      variants?: Partial<Record<XDSToggleButtonVariant, StyleXStyles>>;
    };
  }
}

// =============================================================================
// Props
// =============================================================================

export interface XDSToggleButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'disabled'
> {
  /**
   * Accessible label for the button (required for accessibility).
   * Used as visible text, or as aria-label for icon-only buttons.
   */
  label: string;

  /**
   * Whether the button is currently pressed/active.
   */
  isPressed: boolean;

  /**
   * Called when the pressed state should change.
   */
  onPressedChange: (isPressed: boolean) => void;

  /**
   * Async action handler for API-backed toggles.
   * The button shows a loading spinner and is disabled while the promise is pending.
   *
   * @example
   * ```tsx
   * <XDSToggleButton
   *   label="Favorite"
   *   isPressed={isFavorited}
   *   onPressedChange={setIsFavorited}
   *   onPressedChangeAction={async (newState) => {
   *     await api.setFavorite(itemId, newState);
   *   }}
   * />
   * ```
   */
  onPressedChangeAction?: (isPressed: boolean) => Promise<void>;

  /**
   * The visual style variant of the toggle button.
   * @default 'ghost'
   */
  variant?: XDSToggleButtonVariant;

  /**
   * The size of the toggle button.
   * @default 'md'
   */
  size?: XDSToggleButtonSize;

  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the button is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether the button is read-only.
   * Shows the current state but prevents interaction.
   * Visually distinct from disabled — no opacity reduction.
   * Useful for showing someone else's favorites/bookmarks.
   * @default false
   */
  isReadOnly?: boolean;

  /**
   * Icon element to render in the button.
   * When provided without children,
   * button becomes icon-only (square).
   */
  icon?: ReactNode;

  /**
   * Icon element to render when the button is pressed.
   * Use to swap between outline (unpressed) and filled (pressed) icon styles.
   * Falls back to `icon` if not provided.
   */
  pressedIcon?: ReactNode;

  /**
   * Color applied to the icon when pressed.
   * Use for semantic icon coloring like yellow stars or pink hearts.
   * Accepts any CSS color value or XDS token.
   * Only affects the icon, not the label text.
   *
   * @example
   * ```tsx
   * // Yellow star
   * <XDSToggleButton pressedIconColor="#F2C00B" ... />
   * // Pink heart
   * <XDSToggleButton pressedIconColor="#E91E63" ... />
   * ```
   */
  pressedIconColor?: string;

  /**
   * Optional visible content. If omitted and icon is provided,
   * button becomes icon-only with label used as aria-label.
   */
  children?: ReactNode;

  /**
   * Tooltip text shown on hover. Defaults to label for icon-only buttons.
   */
  tooltip?: string;

  /**
   * Whether to show a tooltip on hover/focus.
   * Defaults to true for icon-only buttons, false for labeled buttons.
   * Set to false to opt out of the automatic tooltip.
   * @default undefined (auto — true for icon-only, false for labeled)
   */
  hasTooltip?: boolean;

  /**
   * Value identifier when used inside XDSToggleButtonGroup.
   * Required when used in a group.
   */
  value?: string;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Label width reservation — prevents layout shift on font-weight change
// =============================================================================

/**
 * The label wrapper uses a hidden span to prevent layout shift
 * when toggling between medium (unpressed) and semibold (pressed) font weights.
 *
 * The hidden span renders the same text at semibold weight but is visually hidden
 * (height: 0, overflow: hidden). This reserves the wider semibold width at all
 * times, so the button never changes size when toggled.
 */
const labelStyles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widthReservation: {
    display: 'block',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    height: 0,
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  pressed: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
});

const loadingStyles = stylex.create({
  loading: {
    position: 'relative',
    color: 'transparent',
  },
});

// =============================================================================
// Component
// =============================================================================

/**
 * A button that toggles between pressed and unpressed states.
 * Use for toolbar actions, view mode switches, and formatting controls.
 * Also handles icon toggle patterns (favorite, bookmark, like) with
 * pressedIcon and pressedIconColor props.
 *
 * For on/off settings, use XDSSwitch instead.
 * For regular actions, use XDSButton instead.
 *
 * @example
 * ```tsx
 * // Icon-only toggle (toolbar)
 * const [isBold, setIsBold] = useState(false);
 * <XDSToggleButton
 *   label="Bold"
 *   icon={<BoldIcon />}
 *   isPressed={isBold}
 *   onPressedChange={setIsBold}
 * />
 *
 * // Favorite with icon swap and color
 * <XDSToggleButton
 *   label="Favorite"
 *   icon={<StarIcon />}
 *   pressedIcon={<StarIconSolid />}
 *   pressedIconColor="#F2C00B"
 *   isPressed={isFavorited}
 *   onPressedChange={setIsFavorited}
 * />
 *
 * // Async toggle with API call
 * <XDSToggleButton
 *   label="Bookmark"
 *   icon={<BookmarkIcon />}
 *   pressedIcon={<BookmarkIconSolid />}
 *   isPressed={isBookmarked}
 *   onPressedChange={setIsBookmarked}
 *   onPressedChangeAction={async (newState) => {
 *     await api.bookmark(itemId, newState);
 *   }}
 * />
 * ```
 */
export const XDSToggleButton = forwardRef<
  HTMLButtonElement,
  XDSToggleButtonProps
>(
  (
    {
      label,
      isPressed,
      onPressedChange,
      onPressedChangeAction,
      variant = 'ghost',
      size = 'md',
      isDisabled = false,
      isLoading = false,
      isReadOnly = false,
      icon,
      pressedIcon,
      pressedIconColor,
      children,
      tooltip,
      hasTooltip,
      value: _value,
      onClick,
      ...props
    },
    ref,
  ): ReactElement => {
    const [isPending, setIsPending] = useState(false);
    const isIconOnly = icon != null && children == null;
    const buttonDisabled = isDisabled || isLoading || isPending;
    const buttonNonInteractive = buttonDisabled || isReadOnly;
    const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;
    const showLoading = isLoading || isPending;

    // Tooltip logic: explicit hasTooltip overrides, otherwise auto for icon-only
    const shouldShowTooltip =
      hasTooltip !== undefined ? hasTooltip : isIconOnly;
    const resolvedTooltip = shouldShowTooltip ? (tooltip ?? label) : tooltip;

    // Get theme context for component-level overrides (optional)
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride =
      themeContext?.theme.components?.toggleButton?.variants?.[variant];

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (buttonNonInteractive) return;
        onClick?.(e);
        const newState = !isPressed;
        onPressedChange(newState);

        if (onPressedChangeAction) {
          setIsPending(true);
          onPressedChangeAction(newState).finally(() => {
            setIsPending(false);
          });
        }
      },
      [
        buttonNonInteractive,
        onClick,
        onPressedChange,
        onPressedChangeAction,
        isPressed,
      ],
    );

    // Render the icon, optionally wrapped with pressedIconColor
    const iconElement =
      resolvedIcon != null ? (
        isPressed && pressedIconColor ? (
          <span style={{color: pressedIconColor, display: 'inline-flex'}}>
            {resolvedIcon}
          </span>
        ) : (
          resolvedIcon
        )
      ) : null;

    const button = (
      <button
        ref={ref}
        type="button"
        disabled={buttonDisabled}
        aria-pressed={isPressed}
        aria-label={isIconOnly ? label : undefined}
        aria-readonly={isReadOnly || undefined}
        onClick={handleClick}
        {...stylex.props(
          styles.base,
          sizeStyles[size],
          variants[variant],
          themeVariantOverride,
          isPressed && pressedStyles[variant],
          isReadOnly && readOnlyVariants[variant],
          isReadOnly && styles.readOnly,
          isIconOnly && styles.iconOnly,
          buttonDisabled && styles.disabled,
          showLoading && loadingStyles.loading,
        )}
        {...props}>
        {showLoading && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <XDSSpinner size="sm" shade="default" />
          </span>
        )}
        {iconElement}
        {children != null ? (
          <span {...stylex.props(labelStyles.wrapper)}>
            <span {...stylex.props(isPressed && labelStyles.pressed)}>
              {children}
            </span>
            <span
              {...stylex.props(labelStyles.widthReservation)}
              aria-hidden="true">
              {children}
            </span>
          </span>
        ) : isIconOnly ? null : (
          <span {...stylex.props(labelStyles.wrapper)}>
            <span {...stylex.props(isPressed && labelStyles.pressed)}>
              {label}
            </span>
            <span
              {...stylex.props(labelStyles.widthReservation)}
              aria-hidden="true">
              {label}
            </span>
          </span>
        )}
      </button>
    );

    if (resolvedTooltip) {
      return (
        <XDSTooltip content={resolvedTooltip} placement="above">
          {button}
        </XDSTooltip>
      );
    }

    return button;
  },
);

XDSToggleButton.displayName = 'XDSToggleButton';
