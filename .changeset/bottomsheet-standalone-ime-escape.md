---
'@astryxdesign/core': patch
---

[fix] `BottomSheet`: the standalone sheet no longer dismisses on the Escape a CJK user presses to cancel an in-progress IME composition.

`handleKeyDown` read a bare `event.key === 'Escape'`, so pressing Escape to cancel a pending IME candidate (Korean/Japanese/Chinese input) closed the sheet along with it. `Dialog` and `BottomSheetSwitcher` already guard their own Escape handling with `isImeKeyEvent()`; the standalone sheet's `handleKeyDown` was the one path that did not. The reachable case is the documented `purpose="form"` and mobile-keyboard (`height="tall"`) usages, where a text field sits inside the sheet.

`handleCancel` is left as-is, matching both `Dialog` and `BottomSheetSwitcher`: it only fires from the browser's native close-watcher, which does not run when `handleKeyDown` skips `preventDefault()` for a composing keydown, so there is nothing for it to guard against.

@HelloOjasMutreja
