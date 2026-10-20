---
'@astryxdesign/core': patch
---

[fix] `ToggleButton` keeps toggling when it also receives an `onClick`, for example from a wrapper that renders it as its trigger. That `onClick` used to replace the toggle's own click handling, so `onPressedChange` never ran and a `ToggleButtonGroup` member never asked its group to toggle (`pressedChangeAction` still ran). The caller's `onClick` now runs first and the toggle request follows. On a standalone `ToggleButton`, calling `preventDefault()` in that `onClick` cancels the request: neither `onPressedChange` nor `pressedChangeAction` runs.

@cixzhang
