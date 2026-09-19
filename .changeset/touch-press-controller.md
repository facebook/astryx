---
'@astryxdesign/core': patch
---

[feat] Touch press model: under a coarse pointer the bare `:active` arm is dropped and a delegated, document-level controller paints the press the way a native list does — nothing for 150 ms, then the full pressed overlay on the next frame; cancelled with no fade by 10 px of travel or by a scroll claiming the gesture, and dead until a new touch; a tap shorter than the delay paints at the lift; the release fades over 200 ms. It writes `data-pressed="on"|"fading"` on the nearest element marked `data-astryx-pressable`, which every Astryx surface that paints a press now carries; a mouse keeps `:active`. Public API for a local pressable: `usePressFeedback()` (returns the marker to spread; installs the controller on first mount), plus `installPressFeedback`, `pressableProps`, `PRESSABLE_ATTRIBUTE`, `PRESSED_ATTRIBUTE` and the clocks from `@astryxdesign/core/utils`. Also: `DropdownMenuItem` gains `href` (with `target`/`rel`), rendering the row as a real link through the LinkProvider so modifier and middle clicks work; `Item` gains `isUnread` (semibold label, primary description, an `unread` theme state on the `item` target) and `swipeActions` (touch-only leading/trailing swipe panels that fire past a commit point), and renders a `role`d row with `href` as the anchor itself.

@vjeux
