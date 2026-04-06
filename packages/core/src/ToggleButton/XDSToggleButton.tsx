'use client';

/**
 * @file XDSToggleButton.tsx
 * @input Uses XDSButton, React, StyleX, theme tokens
 * @output Exports XDSToggleButton component and types
 * @position Thin wrapper over XDSButton; adds controlled toggle pattern
 *
 * XDSToggleButton wraps XDSButton with `isPressed` and adds:
 * - `onPressedChange` controlled toggle callback
 * - `pressedIcon` for outline-to-filled icon swap
 * - `pressedIconColor` (token-only) for semantic icon coloring
 * - Font weight shift on press with width reservation to prevent layout shift
 * - Auto-tooltip for icon-only buttons
 * - Group integration via ToggleButtonGroupContext
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts (exports if types change)
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 */

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {fontWeightVars} from '../theme/tokens.stylex';
import {XDSButton, type XDSButtonSize} from '../Button';
import {useToggleButtonGroup} from './XDSToggleButtonGroup';

// =============================================================================
// Pressed icon color — token-only type
// =============================================================================

/**
 * Allowed values for `pressedIconColor`.
 * Restricted to XDS icon color tokens — no raw hex/rgb values.
 *
 * @example
 * ```
 * <XDSToggleButton pressedIconColor="yellow" ... />
 * <XDSToggleButton pressedIconColor="pink" ... />
 * ```
 */
export type XDSToggleButtonIconColor =
  | 'accent'
  | 'primary'
  | 'secondary'
  | 'blue'
  | 'cyan'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal'
  | 'yellow';

/**
 * Map from color name to the corresponding CSS custom property name.
 * Used as inline style to guarantee the color overrides any class-based
 * `color` from parent elements (e.g., the pressed button style).
 */
const iconColorVarMap: Record<XDSToggleButtonIconColor, string> = {
  accent: 'var(--color-icon-accent)',
  primary: 'var(--color-icon-primary)',
  secondary: 'var(--color-icon-secondary)',
  blue: 'var(--color-icon-blue)',
  cyan: 'var(--color-icon-cyan)',
  gray: 'var(--color-icon-gray)',
  green: 'var(--color-icon-green)',
  orange: 'var(--color-icon-orange)',
  pink: 'var(--color-icon-pink)',
  purple: 'var(--color-icon-purple)',
  red: 'var(--color-icon-red)',
  teal: 'var(--color-icon-teal)',
  yellow: 'var(--color-icon-yellow)',
};

// =============================================================================
// Styles
// =============================================================================

/**
 * Font weight shift on press with width reservation trick.
 * A hidden span renders the same text at semibold weight to reserve
 * the wider width, preventing layout shift when toggling.
 */
const labelStyles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  widthReservation: {
    display: 'block',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    height: 0,
    overflow: 'hidden',
    visibility: 'hidden',
    pointerEvents: 'none',
  },
});

const iconColorWrapperStyles = stylex.create({
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// =============================================================================
// Props
// =============================================================================

export interface XDSToggleButtonProps {
  /**
   * Accessible label for the button (required).
   * Used as visible text, or as aria-label for icon-only buttons.
   */
  label: string;

  /**
   * Whether the button is currently pressed/active.
   * When used inside XDSToggleButtonGroup, this is controlled by the group
   * and this prop is ignored.
   */
  isPressed?: boolean;

  /**
   * Called when the pressed state should change.
   * When used inside XDSToggleButtonGroup, this is handled by the group
   * and this prop is ignored.
   */
  onPressedChange?: (isPressed: boolean) => void;

  /**
   * Async action handler for API-backed toggles.
   * The button shows a loading spinner while the promise is pending.
   *
   * @example
   * ```
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
   * The size of the toggle button.
   * When used inside XDSToggleButtonGroup, the group's size overrides this.
   * @default 'md'
   */
  size?: XDSButtonSize;

  /**
   * Whether the button is disabled.
   * When used inside XDSToggleButtonGroup, the group's isDisabled overrides this.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the button is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Icon element to render in the button.
   * When provided without children, button becomes icon-only (square)
   * with an automatic tooltip from the label.
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
   * Accepts only XDS icon color token names — no raw hex/rgb values.
   * Only affects the icon, not the label text.
   *
   * @example
   * ```
   * <XDSToggleButton pressedIconColor="yellow" ... />
   * <XDSToggleButton pressedIconColor="pink" ... />
   * ```
   */
  pressedIconColor?: XDSToggleButtonIconColor;

  /**
   * Optional visible content. If omitted and icon is provided,
   * button becomes icon-only with label used as aria-label.
   */
  children?: ReactNode;

  /**
   * Tooltip text shown on hover.
   * Defaults to label for icon-only buttons.
   */
  tooltip?: string;

  /**
   * Value identifier when used inside XDSToggleButtonGroup.
   * Required when used in a group.
   */
  value?: string;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A button that toggles between pressed and unpressed states.
 * Thin wrapper over XDSButton — adds controlled toggle pattern,
 * icon swap, semantic icon coloring, and font weight emphasis.
 *
 * Use for toolbar actions, view mode switches, and formatting controls.
 * For on/off settings, use XDSSwitch instead.
 *
 * Works standalone (with `isPressed`/`onPressedChange`) or inside
 * XDSToggleButtonGroup (which controls selection via `value`).
 *
 * @example
 * ```
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
 *   pressedIconColor="yellow"
 *   isPressed={isFavorited}
 *   onPressedChange={setIsFavorited}
 * />
 * ```
 */
export function XDSToggleButton({
  label,
  isPressed: isPressedProp,
  onPressedChange: onPressedChangeProp,
  onPressedChangeAction,
  size: sizeProp = 'md',
  isDisabled: isDisabledProp = false,
  isLoading = false,
  icon,
  pressedIcon,
  pressedIconColor,
  children,
  tooltip,
  value,
  ...props
}: XDSToggleButtonProps): ReactNode {
  // Read group context if inside a group
  const group = useToggleButtonGroup();

  // Resolve state from group or props
  const isPressed =
    group && value != null
      ? group.selectedValues.has(value)
      : (isPressedProp ?? false);
  const size = group?.size ?? sizeProp;
  const isDisabled = group?.isDisabled ?? isDisabledProp;

  const isIconOnly = icon != null && children == null;
  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;

  // Wrap icon with token color when pressed.
  // Uses inline style to guarantee the color overrides any class-based
  // `color` inherited from the pressed button element.
  const coloredIcon =
    resolvedIcon != null && isPressed && pressedIconColor != null ? (
      <span
        {...stylex.props(iconColorWrapperStyles.wrapper)}
        style={{color: iconColorVarMap[pressedIconColor]}}>
        {resolvedIcon}
      </span>
    ) : (
      resolvedIcon
    );

  // Auto-tooltip for icon-only buttons
  const resolvedTooltip = tooltip ?? (isIconOnly ? label : undefined);

  const handleClick = useCallback(() => {
    if (isDisabled || isLoading) return;

    if (group && value != null) {
      // Delegate to group context
      group.toggle(value);
    } else if (onPressedChangeProp) {
      // Standalone toggle
      const newState = !isPressed;
      onPressedChangeProp(newState);
      if (onPressedChangeAction) {
        onPressedChangeAction(newState);
      }
    }
  }, [
    isDisabled,
    isLoading,
    group,
    value,
    onPressedChangeProp,
    onPressedChangeAction,
    isPressed,
  ]);

  // Label with font weight shift and width reservation
  const labelContent =
    children != null ? (
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
    ) : !isIconOnly ? (
      <span {...stylex.props(labelStyles.wrapper)}>
        <span {...stylex.props(isPressed && labelStyles.pressed)}>{label}</span>
        <span
          {...stylex.props(labelStyles.widthReservation)}
          aria-hidden="true">
          {label}
        </span>
      </span>
    ) : undefined;

  return (
    <XDSButton
      label={label}
      variant="ghost"
      size={size}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isPressed={isPressed}
      icon={coloredIcon}
      tooltip={resolvedTooltip}
      onClick={handleClick}
      {...props}>
      {labelContent}
    </XDSButton>
  );
}

XDSToggleButton.displayName = 'XDSToggleButton';
