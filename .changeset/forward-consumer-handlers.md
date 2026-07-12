---
'@astryxdesign/core': patch
---

[fix] Forward consumer event handlers in SegmentedControl, CheckboxListItem, and SideNavCollapseButton

These components set their own `onClick` / `onKeyDown` / `onFocus` / `onBlur` after spreading `{...rest}` (or destructured the consumer's handler and never used it), so a consumer-supplied handler for the same event was silently dropped. They now compose the consumer's handler with the built-in one via `composeEventHandlers`, consumer-first — the consumer's runs and can call `preventDefault()` to opt out of the built-in behavior.
@cixzhang
