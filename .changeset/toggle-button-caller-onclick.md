---
'@astryxdesign/core': patch
---

[fix] `ToggleButton` no longer stops toggling when it receives an `onClick`. A caller's `onClick` (for example one supplied by a wrapper that renders the toggle as its trigger) used to replace the toggle's own click handling, so `onPressedChange`, `pressedChangeAction`, and group selection never ran. The caller's `onClick` now runs first and the toggle runs after it; calling `preventDefault()` in that `onClick` cancels the toggle, the same way it cancels a `Button`'s `clickAction`.

@cixzhang
