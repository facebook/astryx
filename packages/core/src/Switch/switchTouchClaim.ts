// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file switchTouchClaim.ts
 * @input Nothing
 * @output SWITCH_CLAIMS_HELD_TOUCH: whether a held switch keeps its touch from
 *   the page's scroll (UISwitch) or stays passive and yields to it
 * @position The one switch-point of Switch's touch presentation
 *   (useSwitchTouch.ts); its interaction spec reads it too
 *
 * UISwitch keeps a touch that rests on it: once held, a vertical drag never
 * scrolls the list, and lifting the finger toggles. On the web that takes a
 * NON-passive `touchmove` listener on the switch (the gesture system's
 * claim), so a scroll that starts on the switch waits for a busy main thread
 * before it moves, as UIKit's own scroll view would; Safari ignores a
 * listener added once the touch has started, so it cannot be added later.
 *
 * - `true` (claiming, UISwitch): UISwitch's own recognizers. A held switch
 *   keeps the touch: a vertical drag after the hold does not scroll and the
 *   lift toggles; a horizontal drag flips it.
 * - `false` (passive): the switch listens without blocking. `touch-action:
 *   pan-y` keeps horizontal moves for it, so a horizontal drag flips it and
 *   a tap or a hold toggles it; a vertical drag, even after a hold, scrolls
 *   the page and the switch yields (no toggle).
 *
 * SYNC: When modified, update useSwitchTouch.ts and
 * __tests__/Switch.interaction.browser.spec.ts.
 */

export const SWITCH_CLAIMS_HELD_TOUCH: boolean = true;
