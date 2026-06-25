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

import React, {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, fontWeightVars} from '../theme/tokens.stylex';

import {Button, type ButtonSize} from '../Button';
import {useToggleButtonGroup} from './ToggleButtonGroup';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Constants & helpers
// =============================================================================

/**
 * The spinner only appears once the action has been pending for this long.
 * A fast action shows the optimistic pressed state immediately with no spinner
 * flash, and rapid re-clicks can interrupt the in-flight action before the
 * button locks behind the spinner.
 */
const PENDING_SPINNER_DELAY_MS = 150;

/**
 * Returns `true` only once `active` has stayed `true` for `delayMs`.
 * Used to debounce the loading spinner so the optimistic state shows first.
 */
function useDelayed(active: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const timer = setTimeout(() => setDelayed(true), delayMs);
    return () => {
      clearTimeout(timer);
      setDelayed(false);
    };
  }, [active, delayMs]);
  return active && delayed;
}

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
   * Action handler for API- or navigation-backed toggles, run inside a
   * transition. The button shows a loading spinner while the action is
   * pending — whether it returns a promise or synchronously triggers a
   * suspending update (e.g. a router navigation that suspends on data).
   *
   * Because it runs in a transition, the toggle is *interruptible*: clicking
   * again while an action is pending starts a new transition with the next
   * optimistic state, so the action reflects the latest intent rather than
   * being dropped.
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

  // Track the pressed state optimistically. While an action is pending, the
  // button reflects the intended (optimistic) state immediately, and a click
  // mid-flight derives its next state from this value — so rapid toggles read
  // true -> false -> true rather than stalling on the last committed value.
  const [optimisticPressed, setOptimisticPressed] =
    useOptimistic(committedPressed);
  const isPressed = optimisticPressed;

  const resolvedIcon = isPressed && pressedIcon ? pressedIcon : icon;

  // Run the toggle inside a transition. The action is interruptible: clicking
  // again while it is pending starts a fresh transition with the next
  // optimistic state instead of being dropped, so there is no re-entry guard.
  // Both onPressedChange and pressedChangeAction run inside the transition,
  // which means a synchronous-but-suspending handler (e.g. a router navigation
  // that suspends on data) also drives the pending state — not just promises.
  const [isPending, startTransition] = useTransition();
  // Debounce the spinner so a fast action shows the optimistic state without a
  // spinner flash, and rapid re-clicks can interrupt before the button locks.
  const showSpinner = useDelayed(isPending, PENDING_SPINNER_DELAY_MS);
  const isLoadingState = isLoading || showSpinner;

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }

    if (group && value != null) {
      // Group mode delegates selection to the group; no async-action path.
      group.toggle(value);
      return;
    }

    const newState = !optimisticPressed;
    startTransition(async () => {
      setOptimisticPressed(newState);
      onPressedChangeProp?.(newState);
      await pressedChangeAction?.(newState);
    });
  }, [
    isDisabled,
    group,
    value,
    optimisticPressed,
    onPressedChangeProp,
    pressedChangeAction,
    setOptimisticPressed,
  ]);

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
      isLoading={isLoadingState}
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
      {...props}>
      {labelContent}
    </Button>
  );
}

ToggleButton.displayName = 'ToggleButton';
