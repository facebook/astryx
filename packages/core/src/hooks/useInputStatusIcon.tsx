// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useInputStatusIcon.tsx
 * @input Input status, statusVariant, and InputGroup awareness
 * @output The on-field status icon element (with tooltip) and aria-describedby wiring
 * @position Shared hook for bordered inputs that render a status affordance inside the control
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts (exports)
 *
 * Centralizes the on-field status icon across the bordered inputs (TextInput,
 * TextArea, NumberInput, DateInput, DateTimeInput, DateRangeInput, TimeInput,
 * FileInput) so the three statusVariants behave consistently:
 *
 * - `attached`  → icon sits inside the control; the message box below carries
 *   the text.
 * - `detached`  → the detached message box renders its OWN leading icon, so the
 *   on-field icon is suppressed here to avoid a duplicate glyph.
 * - `tooltip`   → no message box renders; the on-field icon carries the meaning
 *   through a tooltip on hover, and the message is piped into the input's
 *   `aria-describedby` so assistive tech announces it (the icon itself is not
 *   focusable, so AT reads it through the input's description).
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon, type IconName, type IconSize} from '../Icon';
import type {FieldStatusVariant} from '../FieldStatus/FieldStatus';
import type {InputStatus, InputStatusType} from '../Field/types';
import {useTooltip} from '../Tooltip';

/**
 * Maps each status type to its glyph. Shared so every input shows the same icon
 * for a given status, matching the detached message box's leading icon.
 */
const STATUS_ICON: Record<InputStatusType, IconName> = {
  warning: 'warning',
  error: 'error',
  success: 'success',
};

const styles = stylex.create({
  // Contain the anchor so the tooltip positions against the icon, and keep the
  // glyph vertically centered within the input control.
  iconAnchor: {
    display: 'inline-flex',
    alignItems: 'center',
  },
});

export interface UseInputStatusIconOptions {
  /** The input's status, or undefined when there is none. */
  status?: InputStatus;
  /** How the status is presented relative to the input. */
  statusVariant?: FieldStatusVariant;
  /** Whether the input is inside an InputGroup (which owns status rendering). */
  isInGroup?: boolean;
  /** Size of the on-field icon. @default 'md' */
  size?: IconSize;
}

export interface UseInputStatusIconReturn {
  /**
   * The on-field status affordance to render inside the input container —
   * the status icon plus, for the `tooltip` variant, its tooltip layer.
   * `null` when no icon should render (no status, `detached` variant, or
   * inside a group).
   */
  statusIcon: ReactNode;
  /**
   * ID to add to the input's `aria-describedby` when the status is surfaced
   * only through the tooltip, so screen readers announce it. `undefined`
   * otherwise (the message box owns the description in attached/detached).
   */
  describedBy: string | undefined;
}

/**
 * Builds the on-field status icon and its accessibility wiring for a bordered
 * input. See the file header for the per-variant behavior.
 */
export function useInputStatusIcon({
  status,
  statusVariant = 'attached',
  isInGroup = false,
  size = 'md',
}: UseInputStatusIconOptions): UseInputStatusIconReturn {
  const isTooltipVariant = statusVariant === 'tooltip';

  const tooltip = useTooltip({
    placement: 'above',
    isEnabled: isTooltipVariant && !!status?.message,
  });

  // Inside a group the group owns status rendering; the detached message box
  // renders its own leading icon, so the on-field icon would duplicate it.
  const shouldRenderIcon =
    !!status && !isInGroup && statusVariant !== 'detached';

  if (!shouldRenderIcon) {
    return {statusIcon: null, describedBy: undefined};
  }

  const icon = (
    <Icon icon={STATUS_ICON[status.type]} size={size} color={status.type} />
  );

  // Attached (and tooltip-without-message) variants: plain icon, no tooltip.
  if (!isTooltipVariant || !status.message) {
    return {statusIcon: icon, describedBy: undefined};
  }

  return {
    statusIcon: (
      <>
        <span ref={tooltip.ref} {...stylex.props(styles.iconAnchor)}>
          {icon}
        </span>
        {tooltip.renderTooltip(status.message)}
      </>
    ),
    describedBy: tooltip.describedBy,
  };
}
