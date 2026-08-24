---
'@astryxdesign/core': patch
---

[feat] The checkbox indicator now exposes stable theme targets for its two marks — `astryx-checkbox-indicator-check` (the checkmark) and `astryx-checkbox-indicator-dash` (the indeterminate bar) — mirroring the existing `astryx-radio-indicator-dot`. Both reflect `size`. A theme restyling the mark itself (stroke weight, colour, the dash's proportions) previously had to reach it with `.astryx-checkbox-indicator > svg` and `> span`, which are element-and-order selectors that break silently on any restructure. Purely additive; no visual change.

@freddymeta
