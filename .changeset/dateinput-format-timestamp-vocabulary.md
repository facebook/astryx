---
'@astryxdesign/core': patch
---

[feat] DateInput gains a `format` prop for the committed date value, reusing Timestamp's `format` vocabulary so the same literal renders the same date shape in both components. Named values are `date` ("Mar 21, 2026"), the new `date_weekday` ("Wed, Mar 21, 2026"), and `system_date` ("2026-03-21"); a `(value) => string` function is also accepted for custom output. Left unset, the field keeps its long-month rendering ("March 21, 2026"), so existing usage is unchanged. This also extends Timestamp with the shared `date_weekday` member. Formatting applies only to the committed value, never to text being typed.

@cixzhang
