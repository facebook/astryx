---
'@astryxdesign/core': patch
---

[feat] DateInput, DateRangeInput, and DateTimeInput now accept a `weekStartsOn` prop that sets the first day of the week in the calendar popover (0 = Sunday … 6 = Saturday, or a three-letter day name like `"mon"`). It forwards to the underlying Calendar, whose default stays Sunday, so existing usage is unchanged.
@freddymeta
