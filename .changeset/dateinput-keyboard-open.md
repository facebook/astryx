---
'@astryxdesign/core': patch
---

[fix] DateInput/DateTimeInput: the date field's calendar popover can now be opened from the keyboard with `ArrowDown` / `Alt+ArrowDown` (APG combobox), not just by clicking. DateTimeInput's time input no longer uses a hardcoded English `aria-label="Time"` — it defaults to `"{label} time"` (tied to the field label and localizable) and accepts an explicit `timeLabel` prop (#3343).
@cixzhang
