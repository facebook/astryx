// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressable.ts
 * @input Nothing
 * @output Exports PRESSABLE_ATTRIBUTE, PRESSED_ATTRIBUTE and pressableProps
 * @position The stateless half of the touch press model: the attributes the
 *   document-level controller (pressFeedback.ts) reads and writes. Split out so
 *   a server-rendered surface (ButtonShell.tsx) can carry the marker without
 *   importing the controller and its module state.
 *
 * SYNC: When modified, update pressFeedback.ts.
 */

/**
 * The marker the controller finds with `closest()`. Every Astryx component
 * that paints a press carries it on the element that paints; a local
 * component can opt in by spreading {@link pressableProps} (or calling
 * `usePressFeedback`) on its own pressable element and reading
 * {@link PRESSED_ATTRIBUTE} in its styles.
 */
export const PRESSABLE_ATTRIBUTE = 'data-astryx-pressable';

/** `on` while the press is believed and the finger is down; `fading` for the release's exit. */
export const PRESSED_ATTRIBUTE = 'data-astryx-press';

/** Spread onto the element that paints the press. */
export const pressableProps: {readonly [PRESSABLE_ATTRIBUTE]: ''} = {
  [PRESSABLE_ATTRIBUTE]: '',
};
