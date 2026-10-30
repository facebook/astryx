// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file refreshIndicator.ts
 * @output The names the refresh control's touch layer writes and its
 *   indicator's styles read
 * @position Internal to RefreshControl, shared by refreshTouchController.ts and
 *   the indicator (RefreshControl.tsx, the drawing)
 */

/** CSS custom property the indicator reads: how much of it is revealed (0–1). */
export const REFRESH_REVEAL_VAR = '--astryx-refresh-reveal';
/** CSS custom property the spokes read: the alpha step while spinning. */
export const REFRESH_SPIN_STEP_VAR = '--astryx-refresh-spin-step';
/** Attribute on the indicator while it spins. */
export const REFRESH_SPINNING_ATTRIBUTE = 'data-refresh-spinning';
