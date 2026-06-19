// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ToggleButton.tsx
 * @input Uses Button, React, StyleX, theme tokens
 * @output Exports ToggleButton component and types
 * @position Thin wrapper over Button; adds controlled toggle pattern
 *
 * ToggleButton wraps Button with `isPressed` and adds:
 * - `onPressedChange` controlled toggle callback
 * - `pressedIcon` for outline-to-filled icon swap
 * - Font weight shift on press with width reservation to prevent layout shift
 * - Group integration via ToggleButtonGroupContext
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ToggleButton/index.ts (exports if types change)
 * - /apps/storybook/stories/ToggleButton.stories.tsx
 * - /packages/cli/templates/blocks/components/ToggleButton/ (showcase blocks)
 */

import React, {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, fontWeightVars} from '../theme/tokens.stylex';

import {Button, type ButtonSize} from '../Button';
import {useToggleButtonGroup} from './ToggleButtonGroup';
import type {BaseProps} from '../BaseProps';
import {xdsThemeProps} from '../utils/xdsThemeProps';

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

export interface ToggleButtonProps extends BaseProps<HTMLButtonElement> {
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Accessible label for the button (required).
   * Used as visible text, or as aria-label for icon-only buttons.
   */
  label: string;

  /**
   * Whether the button is currently pressed/active.
   * When used inside ToggleButtonGroup, this is controlled by the group
   * and this prop is ignored.
   */
  isPressed?: boolean;

  /**
   * Called when the pressed state should change.
   * When used inside ToggleButtonGroup, this is handled by the group
   * and this prop is ignored.
   */
  onPressedChange?: (isPressed: boolean) => void;

  /**
   * Async action handler for API-backed toggles.
   * The button shows a loading spinner while the promise is pending.
   *
   * @example
   * ```
   * <ToggleButton
   *   label="Favorite"
   *   isPressed={isFavorited}
   *   onPressedChange={setIsFavorited}
   *   pressedChangeAction={async (newState) => {
   *     await api.setFavorite(itemId, newState);
   *   }}
   * />
   * ```
   */
  pressedChangeAction?: (isPressed: boolean) => Promise<void>;

  /**
   * The size of the toggle button.
   * When used inside ToggleButtonGroup, defaults to the group's size.
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether the button is disabled.
   * When used inside ToggleButtonGroup, the group's isDisabled overrides this.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the button is in a loading state.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Icon element rendered before the label text.
   */
  icon?: ReactNode;

  /**
   * When true, renders as a square icon-only button with `label` as aria-label
   * and an automatic tooltip from the label.
   * @default false
   */
  isIconOnly?: boolean;

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
   * Optional visible content. When provided, rendered instead of `label`
   * as the visible text.
   */
  children?: ReactNode;

  /**
   * Tooltip text shown on hover.
   * Passed through to Button.
   */
  tooltip?: string;

  /**
   * Value identifier when used inside ToggleButtonGroup.
   * Required when used in a group.
   */
  value?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A button that toggles between pressed and unpressed states.
 * Thin wrapper over Button — adds controlled toggle pattern,
 * icon swap, and font weight emphasis.
 *
 * Use for toolbar actions, view mode switches, and formatting controls.
 * For on/off settings, use Switch instead.
 *
 * Works standalone (with `isPressed`/`onPressedChange`) or inside
 * ToggleButtonGroup (which controls selection via `value`).
 *
 * @example
 * ```
 * const [isBold, setIsBold] = useState(false);
 * <ToggleButton
 *   label="Bold"
 *   icon={<BoldIcon />}
 *   isPressed={isBold}
 *   onPressedChange={setIsBold}
 * />
 * ```
 */
export function ToggleButton({
  ref,
  label,
  isPressed: isPressedProp,
  onPressedChange: onPressedChangeProp,
  pressedChangeAction,
  size: sizeProp,
  isDisabled: isDisabledProp = false,
  isLoading = false,
  icon,
  isIconOnly = false,
  pressedIcon,
  children,
  tooltip,
  value,
  xstyle,
  className: _className,
  style,
  ...props
}: ToggleButtonProps): ReactNode {
  // Read group context if inside a group
  const group = useToggleButtonGroup();

  // Resolve state from group or props
  const isPressed =
    group && value != null
      ? group.selectedValues.has(value)
      : (isPressedProp ?? false);
  const size = sizeProp ?? group?.size ?? 'md';
  const isDisabled = group?.isDisabled ?? isDisabledProp;

  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;

  const handleClick = useCallback(() => {
    if (isDisabled || isLoading) {
      return;
    }

    if (group && value != null) {
      // Delegate to group context
      group.toggle(value);
    } else if (onPressedChangeProp) {
      // Standalone toggle
      const newState = !isPressed;
      onPressedChangeProp(newState);
      if (pressedChangeAction) {
        void pressedChangeAction(newState);
      }
    }
  }, [
    isDisabled,
    isLoading,
    group,
    value,
    onPressedChangeProp,
    pressedChangeAction,
    isPressed,
  ]);

  // Label with font weight shift and width reservation
  // isIconOnly prop is the source of truth for icon-only rendering.
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
    <Button
      ref={ref}
      label={label}
      variant="ghost"
      size={size}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isIconOnly={isIconOnly}
      aria-pressed={isPressed}
      icon={resolvedIcon}
      tooltip={tooltip}
      {...xdsThemeProps('toggle-button', {
        isPressed: isPressed ? 'true' : 'false',
      })}
      xstyle={[isPressed ? pressedStyles.background : undefined, xstyle]}
      style={style}
      onClick={handleClick}
      {...props}>
      {labelContent}
    </Button>
  );
}

ToggleButton.displayName = 'ToggleButton';
