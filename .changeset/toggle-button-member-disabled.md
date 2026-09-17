---
'@astryxdesign/core': patch
---

[fix] Keep a ToggleButton's own `isDisabled` when its ToggleButtonGroup does not disable anything. The group always supplies an `isDisabled` boolean, so the previous `??` fallback never ran and an enabled group re-enabled a member that had disabled itself — the member selected on click, and a member carrying a `tooltip` stayed operable while looking unavailable. A disabled group still disables every member; it just cannot re-enable one.

@cixzhang
