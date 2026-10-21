---
'@astryxdesign/core': patch
---

[feat] `BottomSheetSwitcher` renders a native `<dialog>` per sheet (prototype for evaluation). Each child `BottomSheet` now owns its own dialog, exactly like a standalone sheet; the switcher presents the selected sheet's dialog (`showModal()` with a scrim, `show()` without), keeps the previous sheet's dialog open and inert beneath the entering one through the handoff, and closes it once its panel has faded. One backdrop paints at a time: the retained dialog keeps the scrim until it closes, then the new dialog takes it over without a fade, so the page is never dimmed twice and the previous panel is never dimmed. The focus trap, scroll lock, Escape and platform-close routing, `purpose` dismissal rules, and focus return to the opener are unchanged.

Public props, defaults, and exports are unchanged. Two observable details move with the structure: the switcher's `ref` now resolves to the dialog hosting the active sheet (it moves on a handoff, stays on the exiting sheet's dialog through its exit, and is `null` while the flow is closed) instead of one persistent element, and `onCancel` plus the forwarded dialog props apply to each sheet's dialog rather than one shared element. Going back to a sheet whose dialog is still fading closes and re-presents that dialog so the interactive sheet is the topmost layer again.

@imdreamrunner
