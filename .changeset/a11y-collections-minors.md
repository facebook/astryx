---
'@astryxdesign/core': patch
---

[fix] Resizable, TabMenu: two collection ARIA minors (WCAG 4.1.2) — Resizable's collapsed handle clamps `aria-valuenow` to `aria-valuemin` and announces a localized "Collapsed" via `aria-valuetext`, and TabMenu overflow options are `menuitemradio` with `aria-checked` (APG menu-button single-select) instead of `menuitem` + `aria-current`.
@bhamodi
