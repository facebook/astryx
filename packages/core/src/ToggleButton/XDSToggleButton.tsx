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
 * - Font weight shift on press with width reservation to prevent layout shift
 * - Group integration via ToggleButtonGroupContext
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts (exports if types change)
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 */

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, fontWeightVars} from '../theme/tokens.stylex';
import {XDSButton, type XDSButtonSize} from '../Button';
import {useXDSToggleButtonGroup} from './XDSToggleButtonGroup';

// =============================================================================
// Styles
// =============================================================================

/**
 * Font weight shift on press with width reservation trick.
 * A hidden span renders the same text at semibold weight to reserve
 * the wider width, preventing layout shift when toggling.
 */
const pressedStyles = stylex.create({
  background: {
    backgroundColor: colorVars['--color-overlay-pressed'],
  },
});

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
   * When used inside XDSToggleButtonGroup, defaults to the group's size.
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
   *
   * To color the pressed icon, pass an already-colored element:
   * @example
   * ```
   * pressedIcon={<StarIconSolid style={{color: 'var(--color-icon-yellow)'}} />}
   * ```
   */
  pressedIcon?: ReactNode;

  /**
   * Optional visible content. If omitted and icon is provided,
   * button becomes icon-only with label used as aria-label.
   */
  children?: ReactNode;

  /**
   * Tooltip text shown on hover.
   * Passed through to XDSButton.
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
 * icon swap, and font weight emphasis.
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
 * // Favorite with icon swap
 * <XDSToggleButton
 *   label="Favorite"
 *   icon={<StarIcon />}
 *   pressedIcon={<StarIconSolid />}
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
  size: sizeProp,
  isDisabled: isDisabledProp = false,
  isLoading = false,
  icon,
  pressedIcon,
  children,
  tooltip,
  value,
  ...props
}: XDSToggleButtonProps): ReactNode {
  // Read group context if inside a group
  const group = useXDSToggleButtonGroup();

  // Resolve state from group or props
  const isPressed =
    group && value != null
      ? group.selectedValues.has(value)
      : (isPressedProp ?? false);
  const size = sizeProp ?? group?.size ?? 'md';
  const isDisabled = group?.isDisabled ?? isDisabledProp;

  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;

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
  const isIconOnly = icon != null && children == null;
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
      aria-pressed={isPressed}
      icon={resolvedIcon}
      tooltip={tooltip}
      xstyle={isPressed ? pressedStyles.background : undefined}
      onClick={handleClick}
      {...props}>
      {labelContent}
    </XDSButton>
  );
}

XDSToggleButton.displayName = 'XDSToggleButton';
