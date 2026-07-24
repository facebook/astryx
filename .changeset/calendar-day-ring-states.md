---
'@astryxdesign/core': patch
---

[feat] Calendar: make the today/selected day-cell ring precisely themeable. The day cell now reflects a compound `ring` state (`today-only` / `today-in-range`) that maps 1:1 to the treatment actually drawn, so `defineTheme({components: {'calendar-day': {'ring:today-only': {...}}}})` targets exactly those states without over-matching or needing a `:not()` exclusion. Default rendering is unchanged.

@freddymeta
