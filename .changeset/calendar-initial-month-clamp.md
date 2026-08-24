---
'@astryxdesign/core': patch
---

[fix] Calendar (and DateInput, DateRangeInput, DateTimeInput) now opens on a month inside the min/max window instead of on today

@imdreamrunner

With no `focusDate` and no selected value, the calendar opened on today's month
even when `min`/`max` excluded it — a 2019 audit window or a booking window that
opens next spring rendered a grid where every day was disabled, and the only way
in was clicking the prev/next arrows once per month.

The initial month is now today clamped into the window: today when it is inside,
otherwise whichever bound is nearest. An explicit `focusDate` or a selected value
still wins, so nothing changes for callers that already say where to look. With
`numberOfMonths={2}` a past window lands `max` in the right-hand pane, so neither
pane is entirely out of bounds.
