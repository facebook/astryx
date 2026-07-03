---
'@astryxdesign/core': patch
---

[fix] Calendar: month navigation chevrons now mirror under `dir="rtl"` so "Previous month" points outward (visually right) and "Next month" points left, instead of both pointing inward at the month label. The mirror is a CSS-only StyleX conditional transform keyed on the `dir` attribute; DOM order, labels, and handlers are unchanged. Also fixes the embedded calendars in DateInput, DateRangeInput, and DateTimeInput (#3388).
@AKnassa
