---
'@astryxdesign/core': patch
---

[fix] utils: clamp plainDateAddMonths to the target month's last day

Adding a month to Jan 31 landed on Mar 3 (Date#setMonth overflow) instead of Feb 28, so month arithmetic from end-of-month dates skipped February entirely. The helper now uses pure month arithmetic and clamps the day, matching Temporal.PlainDate.add and date-fns.
@arham766
