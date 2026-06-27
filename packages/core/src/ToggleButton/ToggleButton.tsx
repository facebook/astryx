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

import React, {useOptimistic, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, fontWeightVars} from '../theme/tokens.stylex';

import {Button, type ButtonSize} from '../Button';
import {useToggleButtonGroup} from './ToggleButtonGroup';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

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
   * Called when the pressed state should change. Receives the next pressed
   * state and the originating click event. Call `event.preventDefault()` to
   * opt out of running `pressedChangeAction` (e.g. to handle the toggle
   * entirely in this callback).
   * When used inside ToggleButtonGroup, this is handled by the group
   * and this prop is ignored.
   */
  onPressedChange?: (
    isPressed: boolean,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;

  /**
   * Action handler for API- or navigation-backed toggles, run inside a
   * transition by Button. The button shows a loading spinner while the action
   * is pending — whether it returns a promise or synchronously triggers a
   * suspending update (e.g. a router navigation that suspends on data).
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
  pressedChangeAction?: (isPressed: boolean) => void | Promise<void>;

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
  const group = useToggleButtonGroup();

  const committedPressed =
    group && value != null
      ? group.selectedValues.has(value)
      : (isPressedProp ?? false);
  const size = sizeProp ?? group?.size ?? 'md';
  const isDisabled = group?.isDisabled ?? isDisabledProp;

  // Track the pressed state optimistically so the button reflects the intended
  // state immediately while an async action is pending. The optimistic update
  // is applied inside Button's clickAction transition (below), satisfying
  // React's "useOptimistic must run in a transition" rule.
  const [optimisticPressed, setOptimisticPressed] =
    useOptimistic(committedPressed);
  const isPressed = optimisticPressed;

  // Next state derives from the *optimistic* value, not the committed one, so a
  // re-click while an action is pending reads the in-flight intent and toggles
  // (true -> false -> true) rather than recomputing from the stale committed
  // state. handleClick and clickAction share this so the callback and the
  // optimistic update always agree within a single click.
  const nextPressed = !isPressed;

  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;

  // Synchronous part of the toggle. Button calls onClick before clickAction and
  // skips clickAction when the event is defaultPrevented, so calling
  // preventDefault() inside onPressedChange opts out of pressedChangeAction.
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return;
    }
    if (group && value != null) {
      // Group mode delegates selection to the group; no async-action path.
      group.toggle(value);
      event.preventDefault();
      return;
    }
    onPressedChangeProp?.(nextPressed, event);
  };

  // Async part of the toggle, run inside Button's transition (so the optimistic
  // update is valid and Button's isPending drives the pending spinner). Skipped
  // automatically by Button when handleClick called preventDefault, and never
  // wired in group mode (where there is no async action). Button is rendered
  // interruptible, so it stays clickable while pending and a re-click starts a
  // fresh transition that interrupts the previous one.
  const clickAction =
    group && value != null
      ? undefined
      : async () => {
          setOptimisticPressed(nextPressed);
          await pressedChangeAction?.(nextPressed);
        };

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
      isInterruptible
      isIconOnly={isIconOnly}
      aria-pressed={isPressed}
      icon={resolvedIcon}
      tooltip={tooltip}
      {...themeProps('toggle-button', {
        isPressed: isPressed ? 'true' : 'false',
      })}
      xstyle={[isPressed ? pressedStyles.background : undefined, xstyle]}
      style={style}
      onClick={handleClick}
      clickAction={clickAction}
      {...props}>
      {labelContent}
    </Button>
  );
}

ToggleButton.displayName = 'ToggleButton';
