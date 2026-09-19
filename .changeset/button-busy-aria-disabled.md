---
'@astryxdesign/core': patch
---

[fix] `Button` (and `IconButton`) no longer use the native `disabled` attribute while a busy state (`isLoading`, or a non-interruptible `clickAction` in flight) is the only reason the button can't be clicked. A natively disabled element can't hold focus, so the browser moved focus to `<body>` the instant an action started and never restored it — the classic reason busy state should be visual-only. Busy now uses `aria-disabled` (button stays focusable) with `aria-busy` and the spinner, matching the documented "Disabled vs Busy" API convention and the behavior input components already follow. `isDisabled` (and `isDisabled` together with a busy state) is unchanged — that still uses native `disabled`. `isInterruptible` is also unchanged.

@HelloOjasMutreja
