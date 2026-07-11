---
'@astryxdesign/core': patch
---

[fix] Icon: allow string (registry) icons to be made meaningful. `aria-hidden="true"` is now applied before the prop spread, so consumers can override it (e.g. `aria-hidden={false}` + `role="img"` + `aria-label`) for a standalone informational icon. Previously registry-mode icons hardcoded `aria-hidden` after the spread, making it impossible to override — inconsistent with component-mode icons, which already allowed it. Default behavior (decorative, hidden) is unchanged. (#3710)
@bhamodi
