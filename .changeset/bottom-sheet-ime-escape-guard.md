---
'@astryxdesign/core': patch
---

[fix] BottomSheet: a standalone sheet no longer dismisses when a CJK user presses Escape to cancel an in-progress IME composition. The browser fires that keydown before `compositionend`, so an Escape handler reading a bare `event.key` misread the composition cancel as a dismissal command and closed the sheet — losing whatever had been typed into a `purpose="form"` field inside it. The handler now early-returns on `isImeKeyEvent`, the same guard `Dialog` and `BottomSheetSwitcher` already carry, and claims the key first so the browser raises no close request of its own.

@ernestt
