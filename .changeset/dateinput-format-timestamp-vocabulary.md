---
'@astryxdesign/core': patch
---

[feat] DateInput gains a `format` prop for the committed date value, reusing Timestamp's `format` vocabulary so the same literal renders the same date shape in both components. Named values are `date_long` (the default, "March 21, 2026"), `date` ("Mar 21, 2026"), `date_weekday` ("Wed, Mar 21, 2026"), and `system_date` ("2026-03-21"); a `(value) => string` function is also accepted for custom output. The `date_long` default is byte-identical to DateInput's previous long-month rendering, so existing usage is unchanged. This also extends Timestamp with two new shared members, `date_long` and `date_weekday`, giving the two components full value parity on the date-only formats. Formatting applies only to the committed value, never to text being typed.

@cixzhang
