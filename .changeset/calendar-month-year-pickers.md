---
'@astryxdesign/core': patch
---

[feat] Calendar can now jump straight to a distant month. The new `hasMonthYearPickers` prop replaces the static month/year caption with compact Month and Year pickers, so reaching a birth date or other far-off date no longer means paging one month at a time. The year list derives from the existing `min`/`max` bounds (1900–2099 when unbounded), always widened so the visible year stays labeled, and months and years outside the bounds are disabled rather than hidden. Off by default; a two-month view keeps the static caption, which labels both visible months. The pickers are themeable via the new `calendar-picker` target (`data-picker="month" | "year"`), and screen-reader month-change announcements cover picker jumps too.

@AKnassa
